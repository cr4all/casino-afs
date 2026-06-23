from app.engines import auth_failure
from app.scoring.decision import determine_decision
from app.scoring.aggregator import aggregate
from app.engines.registry import run_all_engines
from tests.factories import build_event


def test_auth_failure_engine_ignores_successful_login():
    event = build_event(event_type="player.login")
    score, signals = auth_failure.evaluate(event)
    assert score == 0
    assert signals == []


def test_login_failed_increments_velocity():
    for index in range(6):
        auth_failure.evaluate(
            build_event(
                event_id=f"login_fail_{index}",
                event_type="player.login.failed",
                context={"ip": "198.51.100.50", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "DE"},
            ),
        )

    score, signals = auth_failure.evaluate(
        build_event(
            event_id="login_fail_final",
            event_type="player.login.failed",
            context={"ip": "198.51.100.50", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "DE"},
        ),
    )
    assert score >= 35
    assert "medium_login_failure_velocity" in signals


def test_brute_force_login_triggers_critical_signal():
    for index in range(21):
        auth_failure.evaluate(
            build_event(
                event_id=f"brute_{index}",
                event_type="player.login.failed",
                context={"ip": "198.51.100.99", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "DE"},
            ),
        )

    event = build_event(
        event_id="brute_final",
        event_type="player.login.failed",
        context={"ip": "198.51.100.99", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "DE"},
    )
    results = run_all_engines(event)
    final_score, risk_level = aggregate(results)
    decision = determine_decision(final_score, risk_level, event.event_type, results)

    assert "brute_force_login_suspected" in [s for e in results.values() for s in e.signals]
    assert decision == "block"


def test_signup_failed_velocity():
    for index in range(6):
        auth_failure.evaluate(
            build_event(
                event_id=f"signup_fail_{index}",
                event_type="player.signup.failed",
                context={"ip": "198.51.100.77", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "DE"},
            ),
        )

    score, signals = auth_failure.evaluate(
        build_event(
            event_id="signup_fail_final",
            event_type="player.signup.failed",
            context={"ip": "198.51.100.77", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "DE"},
        ),
    )
    assert score >= 45
    assert "high_signup_failure_velocity" in signals
