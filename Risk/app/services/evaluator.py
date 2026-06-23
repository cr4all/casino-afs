import asyncio
import logging
import time
from datetime import datetime, timezone

import redis

from app.engines.registry import run_all_engines
from app.messaging.publisher import ResultPublisher
from app.models import CanonicalEvent, EvaluateResponse, EvaluationSource, EventType, TRUST_REGISTRATION_EVENT_TYPES
from app.runtime_config import get_runtime_config
from app.scoring.aggregator import aggregate
from app.scoring.decision import apply_step_up_bypass, determine_decision
from app.services.step_up_verification import get_step_up_verification_service
from app.services.trusted_devices import device_key_from_context, get_trusted_device_service
from app.settings import Settings

logger = logging.getLogger(__name__)

TRUST_REGISTRATION_EVENTS = TRUST_REGISTRATION_EVENT_TYPES


class RiskEvaluator:
    """Shared evaluation core used by both sync API and async RabbitMQ consumer."""

    def __init__(
        self,
        settings: Settings,
        publisher: ResultPublisher | None = None,
        redis_client: redis.Redis | None = None,
    ) -> None:
        self._settings = settings
        self._publisher = publisher
        self._redis = redis_client

    def evaluate(self, event: CanonicalEvent, source: EvaluationSource) -> EvaluateResponse:
        if source == "sync" and self._redis is not None:
            cached = self._get_cached_decision(event.event_id)
            if cached is not None:
                logger.info("Returning cached decision for event %s", event.event_id)
                return cached

        started = time.perf_counter()

        engine_results = run_all_engines(event)
        final_score, risk_level = aggregate(engine_results)
        decision = determine_decision(final_score, risk_level, event.event_type, engine_results)
        decision = apply_step_up_bypass(decision, engine_results)

        result = EvaluateResponse(
            event_id=event.event_id,
            user_id=event.user.user_id,
            event_type=event.event_type,
            decision=decision,
            final_score=final_score,
            risk_level=risk_level,
            engines=engine_results,
            latency_ms=int((time.perf_counter() - started) * 1000),
            source=source,
            scored_at=datetime.now(timezone.utc),
        )

        self._post_process_event(event, result)
        self._post_process_step_up_grant(event)

        if source == "sync" and self._redis is not None:
            self._cache_decision(result)

        logger.info(
            "Evaluated event %s (%s) via %s: decision=%s score=%s level=%s latency_ms=%s",
            event.event_id,
            event.event_type.value,
            source,
            result.decision,
            result.final_score,
            result.risk_level,
            result.latency_ms,
        )

        return result

    def _post_process_event(self, event: CanonicalEvent, result: EvaluateResponse) -> None:
        if result.decision not in {"allow", "challenge"}:
            return

        if event.event_type not in TRUST_REGISTRATION_EVENTS:
            return

        if not event.user.user_id or not device_key_from_context(event.context):
            return

        try:
            service = get_trusted_device_service()
        except RuntimeError:
            logger.debug("Trusted device service unavailable; skipping registration")
            return

        user_id = event.user.user_id

        if event.event_type == EventType.PLAYER_SIGNUP:
            service.register_trusted_device(event)
            return

        if event.event_type == EventType.PLAYER_LOGIN:
            if service.trusted_device_count(user_id) == 0:
                service.register_trusted_device(event)
            elif service.is_trusted(user_id, event.context):
                service.register_trusted_device(event)

    def _post_process_step_up_grant(self, event: CanonicalEvent) -> None:
        step_up = event.metadata.step_up_verification if event.metadata else None
        if step_up is None:
            return

        try:
            service = get_step_up_verification_service()
        except RuntimeError:
            logger.debug("Step-up verification service unavailable; skipping grant registration")
            return

        service.register_grant(event, step_up)

    async def evaluate_sync(self, event: CanonicalEvent) -> EvaluateResponse:
        result = await asyncio.to_thread(self.evaluate, event, "sync")

        if get_runtime_config().features.sync_publish_audit and self._publisher is not None:
            asyncio.create_task(
                self._publisher.publish(result),
                name=f"audit-{event.event_id}",
            )

        return result

    async def evaluate_async(self, event: CanonicalEvent) -> EvaluateResponse:
        result = await asyncio.to_thread(self.evaluate, event, "async")

        if self._publisher is not None:
            await self._publisher.publish(result)

        return result

    def _cache_key(self, event_id: str) -> str:
        return f"decision:{event_id}"

    def _get_cached_decision(self, event_id: str) -> EvaluateResponse | None:
        if self._redis is None:
            return None

        cached = self._redis.get(self._cache_key(event_id))
        if not cached:
            return None

        return EvaluateResponse.model_validate_json(cached)

    def _cache_decision(self, result: EvaluateResponse) -> None:
        if self._redis is None:
            return

        self._redis.setex(
            self._cache_key(result.event_id),
            get_runtime_config().features.decision_cache_ttl_seconds,
            result.model_dump_json(),
        )
