import pytest

from app.infrastructure.evaluate_request_logger import (
    init_evaluate_request_logger,
    log_async_rejected,
    log_async_scored,
    log_async_skipped,
    log_sync_evaluate,
)
from app.models import EngineResult, EvaluateResponse
from app.runtime_config import get_runtime_config_store
from shared.db.models import EvaluateRequestLog
from shared.db.session import get_session_factory
from tests.factories import build_event


@pytest.fixture
def logging_enabled():
    store = get_runtime_config_store()
    config = store.get()
    config.logging.sync_enabled = True
    config.logging.async_enabled = True
    store.update(config, updated_by="test")
    init_evaluate_request_logger(get_session_factory())
    yield
    config.logging.sync_enabled = False
    config.logging.async_enabled = False
    store.update(config, updated_by="test")


def test_sync_log_writes_to_database(logging_enabled):
    event = build_event(event_type="player.login", event_id="sync_log_1")
    result = EvaluateResponse(
        event_id="sync_log_1",
        user_id=event.user.user_id,
        event_type=event.event_type,
        decision="allow",
        final_score=5,
        risk_level="low",
        engines={"email": EngineResult(engine="email", score=0, signals=[])},
        latency_ms=10,
        source="sync",
    )

    log_sync_evaluate("/evaluate", event, result)

    with get_session_factory()() as session:
        row = session.query(EvaluateRequestLog).order_by(EvaluateRequestLog.id.desc()).first()
        assert row is not None
        assert row.channel == "sync"
        assert row.status == "scored"
        assert "SYNC SCORED" in row.summary
        assert row.request_json is not None
        assert row.response_json is not None


def test_async_scored_log(logging_enabled):
    event = build_event(event_type="payment.deposit", event_id="async_log_1")
    result = EvaluateResponse(
        event_id="async_log_1",
        user_id=event.user.user_id,
        event_type=event.event_type,
        decision="challenge",
        final_score=40,
        risk_level="medium",
        engines={"transaction": EngineResult(engine="transaction", score=40, signals=["high_amount"])},
        latency_ms=15,
        source="async",
    )

    log_async_scored(
        event,
        result,
        routing_key="payment.deposit",
        queue="casino.afs",
    )

    with get_session_factory()() as session:
        row = session.query(EvaluateRequestLog).order_by(EvaluateRequestLog.id.desc()).first()
        assert row.channel == "async"
        assert row.status == "scored"
        assert row.routing_key == "payment.deposit"


def test_logging_respects_disabled_flags():
    store = get_runtime_config_store()
    config = store.get()
    config.logging.sync_enabled = False
    config.logging.async_enabled = False
    store.update(config, updated_by="test")
    init_evaluate_request_logger(get_session_factory())

    event = build_event(event_type="player.login", event_id="disabled_log")
    result = EvaluateResponse(
        event_id="disabled_log",
        user_id=event.user.user_id,
        event_type=event.event_type,
        decision="allow",
        final_score=1,
        risk_level="low",
        engines={},
        latency_ms=1,
        source="sync",
    )
    log_sync_evaluate("/evaluate", event, result)

    with get_session_factory()() as session:
        assert session.query(EvaluateRequestLog).filter_by(event_id="disabled_log").count() == 0


def test_async_rejected_log(logging_enabled):
    log_async_rejected(
        routing_key="-",
        queue="casino.afs",
        raw_body=b"not-json",
        error="invalid JSON",
    )

    with get_session_factory()() as session:
        row = session.query(EvaluateRequestLog).order_by(EvaluateRequestLog.id.desc()).first()
        assert row.status == "rejected"
        assert row.error == "invalid JSON"
