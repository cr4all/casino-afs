import json
import logging
import threading
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import sessionmaker

from app.models import CanonicalEvent, EvaluateResponse
from app.runtime_config import get_runtime_config
from shared.db.models import EvaluateRequestLog

logger = logging.getLogger(__name__)

_lock = threading.Lock()
_session_factory: sessionmaker | None = None


def init_evaluate_request_logger(session_factory: sessionmaker) -> None:
    global _session_factory
    _session_factory = session_factory
    logging_cfg = get_runtime_config().logging
    logger.info(
        "Evaluate request logger ready (sync=%s, async=%s)",
        logging_cfg.sync_enabled,
        logging_cfg.async_enabled,
    )


def log_sync_evaluate(endpoint: str, request: CanonicalEvent, response: EvaluateResponse) -> None:
    if not get_runtime_config().logging.sync_enabled:
        return

    event_type = request.event_type.value
    _write_entry(
        channel="sync",
        status="scored",
        summary=(
            f"SYNC SCORED | {endpoint} | {event_type} -> {response.decision} "
            f"(score={response.final_score}, level={response.risk_level}) | id={response.event_id}"
        ),
        event_id=response.event_id,
        event_type=event_type,
        routing_key=None,
        queue=None,
        endpoint=endpoint,
        request=request.model_dump(mode="json"),
        response=response.model_dump(mode="json"),
    )


def log_async_scored(
    request: CanonicalEvent,
    response: EvaluateResponse,
    *,
    routing_key: str,
    queue: str,
) -> None:
    if not get_runtime_config().logging.async_enabled:
        return

    event_type = request.event_type.value
    _write_entry(
        channel="async",
        status="scored",
        summary=(
            f"ASYNC SCORED | {queue} | rk={routing_key or '-'} | {event_type} -> {response.decision} "
            f"(score={response.final_score}, level={response.risk_level}) | id={response.event_id}"
        ),
        event_id=response.event_id,
        event_type=event_type,
        routing_key=routing_key or None,
        queue=queue,
        endpoint=None,
        request=request.model_dump(mode="json"),
        response=response.model_dump(mode="json"),
    )


def log_async_skipped(
    *,
    routing_key: str,
    queue: str,
    raw_body: bytes,
    event_type: str | None = None,
) -> None:
    if not get_runtime_config().logging.async_enabled:
        return

    parsed = _parse_raw_message(raw_body)
    resolved_type = event_type or parsed.get("event_type") or routing_key or "unknown"
    _write_entry(
        channel="async",
        status="skipped",
        summary=f"ASYNC SKIPPED | {queue} | rk={routing_key or '-'} | {resolved_type} (not scored by AFS)",
        event_id=parsed.get("event_id"),
        event_type=resolved_type,
        routing_key=routing_key or None,
        queue=queue,
        endpoint=None,
        request=parsed.get("payload"),
        response=None,
        error="not_scored",
    )


def log_async_rejected(
    *,
    routing_key: str,
    queue: str,
    raw_body: bytes,
    error: str,
) -> None:
    if not get_runtime_config().logging.async_enabled:
        return

    parsed = _parse_raw_message(raw_body)
    resolved_type = parsed.get("event_type") or routing_key or "unknown"
    _write_entry(
        channel="async",
        status="rejected",
        summary=f"ASYNC REJECTED | {queue} | rk={routing_key or '-'} | {resolved_type} | {error}",
        event_id=parsed.get("event_id"),
        event_type=resolved_type,
        routing_key=routing_key or None,
        queue=queue,
        endpoint=None,
        request=parsed.get("payload"),
        response=None,
        error=error,
    )


def log_async_failed(
    request: CanonicalEvent,
    *,
    routing_key: str,
    queue: str,
    error: str,
) -> None:
    if not get_runtime_config().logging.async_enabled:
        return

    event_type = request.event_type.value
    _write_entry(
        channel="async",
        status="failed",
        summary=f"ASYNC FAILED | {queue} | rk={routing_key or '-'} | {event_type} | {error} | id={request.event_id}",
        event_id=request.event_id,
        event_type=event_type,
        routing_key=routing_key or None,
        queue=queue,
        endpoint=None,
        request=request.model_dump(mode="json"),
        response=None,
        error=error,
    )


def log_evaluate(endpoint: str, request: CanonicalEvent, response: EvaluateResponse) -> None:
    log_sync_evaluate(endpoint, request, response)


def _parse_raw_message(raw_body: bytes) -> dict[str, Any]:
    try:
        payload = json.loads(raw_body.decode())
    except (UnicodeDecodeError, json.JSONDecodeError):
        preview = raw_body[:500]
        try:
            text_preview = preview.decode("utf-8", errors="replace")
        except Exception:
            text_preview = repr(preview)
        return {"payload": {"raw_preview": text_preview}}

    if not isinstance(payload, dict):
        return {"payload": {"raw_preview": str(payload)[:500]}}

    event_type = payload.get("event_type")
    if not event_type and payload.get("data") and isinstance(payload.get("data"), dict):
        event_type = payload.get("event_type")

    return {
        "event_id": payload.get("event_id"),
        "event_type": event_type,
        "payload": payload,
    }


def _write_entry(
    *,
    channel: str,
    status: str,
    summary: str,
    event_id: str | None,
    event_type: str | None,
    routing_key: str | None,
    queue: str | None,
    endpoint: str | None,
    request: dict[str, Any] | None,
    response: dict[str, Any] | None,
    error: str | None = None,
) -> None:
    if _session_factory is None:
        logger.debug("Evaluate request logger not initialized; skipping log entry")
        return

    row = EvaluateRequestLog(
        logged_at=datetime.now(timezone.utc),
        channel=channel,
        status=status,
        summary=summary,
        event_id=event_id,
        event_type=event_type,
        routing_key=routing_key,
        queue=queue,
        endpoint=endpoint,
        error=error,
        request_json=json.dumps(request, ensure_ascii=False) if request is not None else None,
        response_json=json.dumps(response, ensure_ascii=False) if response is not None else None,
    )

    try:
        with _lock:
            with _session_factory() as session:
                session.add(row)
                session.commit()
    except Exception:
        logger.exception("Failed to write evaluate request log to database")
