from app.engines.registry import run_all_engines
from tests.factories import build_event


def test_evaluator_good_signup_allows(evaluator, good_signup_event):
    result = evaluator.evaluate(good_signup_event, "sync")
    assert result.decision == "allow"
    assert result.final_score == 0
    assert result.risk_level == "low"
    assert result.source == "sync"
    assert result.user_id == "u1"


def test_evaluator_disposable_email_blocks(evaluator):
    event = build_event(
        user={"user_id": "u1", "email": "fake@mailinator.com", "phone": None, "name": "test"},
    )
    result = evaluator.evaluate(event, "sync")
    assert result.decision == "block"
    assert "disposable_email" in [s for e in result.engines.values() for s in e.signals]


def test_evaluator_bot_signup_blocks(evaluator):
    event = build_event(
        context={
            "ip": "203.0.113.10",
            "user_agent": "python-requests/2.31",
            "device_id": "device_001",
            "country": "DE",
        },
    )
    result = evaluator.evaluate(event, "sync")
    assert result.decision == "block"
    assert "bot_user_agent" in [s for e in result.engines.values() for s in e.signals]


def test_evaluator_bulk_login_blocks(evaluator):
    for index in range(16):
        evaluator.evaluate(
            build_event(
                event_id=f"bulk_login_{index}",
                event_type="player.login",
                user={
                    "user_id": f"user_{index}",
                    "email": f"user{index}@gmail.com",
                    "phone": None,
                    "name": "User",
                },
            ),
            "sync",
        )

    result = evaluator.evaluate(
        build_event(
            event_id="bulk_login_final",
            event_type="player.login",
            user={"user_id": "user_final", "email": "final@gmail.com", "phone": None, "name": "User"},
        ),
        "sync",
    )
    assert result.decision == "block"
    assert "credential_stuffing_suspected" in [s for e in result.engines.values() for s in e.signals]


def test_evaluator_async_source(evaluator, good_login_event):
    result = evaluator.evaluate(good_login_event, "async")
    assert result.source == "async"


def test_evaluator_withdrawal_high_amount(evaluator):
    event = build_event(
        event_type="payment.withdraw",
        transaction={"amount": 12000, "currency": "EUR"},
    )
    result = evaluator.evaluate(event, "sync")
    assert result.decision == "block"
    assert result.engines["transaction"].signals


def test_evaluator_returns_all_engines(evaluator, good_signup_event):
    result = evaluator.evaluate(good_signup_event, "sync")
    assert len(result.engines) == 16
    assert result.latency_ms >= 0


def test_evaluator_run_all_engines_integration(good_signup_event):
    results = run_all_engines(good_signup_event)
    assert sum(engine.score for engine in results.values()) >= 0
