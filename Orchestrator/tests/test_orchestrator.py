import json
from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest

from shared.db.models import RiskAuditLog
from shared.db.session import get_session_factory, init_database
from app.models import EngineResult, RiskResultMessage
from app.services.orchestrator import OrchestratorService


@pytest.fixture
def orchestrator_setup(tmp_path):
    db_url = f"sqlite:///{tmp_path / 'orchestrator_test.db'}"
    init_database(db_url)
    publisher = AsyncMock()
    service = OrchestratorService(get_session_factory(), publisher)
    return service, publisher


def _result(event_id: str = "orch_evt_1") -> RiskResultMessage:
    return RiskResultMessage(
        event_id=event_id,
        user_id="u1",
        event_type="payment.withdraw",
        decision="block",
        final_score=85,
        risk_level="high",
        engines={
            "trusted_device": EngineResult(
                engine="trusted_device",
                score=70,
                signals=["new_device_on_withdrawal"],
            ),
        },
        latency_ms=12,
        source="async",
        scored_at=datetime.now(timezone.utc),
    )


@pytest.mark.asyncio
async def test_process_result_persists_audit_and_publishes_action(orchestrator_setup):
    service, publisher = orchestrator_setup
    result = _result()

    action = await service.process_result(result)

    assert action.action == "hold_withdrawal"
    assert action.event_id == result.event_id
    publisher.publish.assert_awaited_once()

    with get_session_factory()() as session:
        row = session.query(RiskAuditLog).filter_by(event_id=result.event_id).one()
        assert row.decision == "block"
        assert "new_device_on_withdrawal" in json.loads(row.signals)


@pytest.mark.asyncio
async def test_process_result_is_idempotent(orchestrator_setup):
    service, publisher = orchestrator_setup
    result = _result(event_id="orch_evt_dup")

    await service.process_result(result)
    await service.process_result(result)

    with get_session_factory()() as session:
        count = session.query(RiskAuditLog).filter_by(event_id=result.event_id).count()

    assert count == 1
    assert publisher.publish.await_count == 2
