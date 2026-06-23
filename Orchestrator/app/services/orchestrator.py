import json
import logging
from datetime import datetime, timezone

from shared.db.models import RiskAuditLog
from app.models import RiskActionMessage, RiskResultMessage
from app.services.action_mapper import collect_signals, map_decision_to_action

logger = logging.getLogger(__name__)


class OrchestratorService:
    def __init__(self, session_factory, action_publisher) -> None:
        self._session_factory = session_factory
        self._publisher = action_publisher

    async def process_result(self, result: RiskResultMessage) -> RiskActionMessage:
        signals = collect_signals(result)
        action = map_decision_to_action(result)

        with self._session_factory() as session:
            existing = session.query(RiskAuditLog).filter_by(event_id=result.event_id).one_or_none()
            if existing is None:
                session.add(
                    RiskAuditLog(
                        event_id=result.event_id,
                        user_id=result.user_id,
                        event_type=result.event_type,
                        decision=result.decision,
                        final_score=result.final_score,
                        risk_level=result.risk_level,
                        signals=json.dumps(signals),
                        full_payload=result.model_dump_json(),
                    ),
                )
                session.commit()
            else:
                logger.info("Audit log already exists for event %s; skipping insert", result.event_id)

        action_message = RiskActionMessage(
            event_id=result.event_id,
            user_id=result.user_id,
            event_type=result.event_type,
            decision=result.decision,
            final_score=result.final_score,
            risk_level=result.risk_level,
            action=action,
            signals=signals,
            processed_at=datetime.now(timezone.utc),
        )

        await self._publisher.publish(action_message)

        logger.info(
            "Orchestrated event %s: decision=%s action=%s",
            result.event_id,
            result.decision,
            action,
        )

        return action_message
