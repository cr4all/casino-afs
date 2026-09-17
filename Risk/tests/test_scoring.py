from app.engines import velocity
from app.engines.registry import CRITICAL_SIGNALS, collect_signals, has_critical_signal, run_all_engines
from app.models import EngineResult
from app.scoring.aggregator import aggregate
from app.scoring.decision import determine_decision
from tests.factories import build_event


def test_aggregate_low_medium_high_critical():
    low = {"a": EngineResult(engine="a", score=10, signals=[])}
    medium = {"a": EngineResult(engine="a", score=45, signals=[])}
    high = {"a": EngineResult(engine="a", score=75, signals=[])}
    critical = {"a": EngineResult(engine="a", score=95, signals=[])}

    assert aggregate(low) == (10, "low")
    assert aggregate(medium) == (45, "medium")
    assert aggregate(high) == (75, "high")
    assert aggregate(critical) == (95, "critical")


def test_aggregate_caps_at_100():
    results = {
        "a": EngineResult(engine="a", score=80, signals=[]),
        "b": EngineResult(engine="b", score=80, signals=[]),
    }
    total, level = aggregate(results)
    assert total == 100
    assert level == "critical"


def test_has_critical_signal():
    results = {
        "velocity": EngineResult(engine="velocity", score=80, signals=["bulk_login_attack"]),
    }
    assert has_critical_signal(results) is True


def test_collect_signals():
    results = {
        "email": EngineResult(engine="email", score=10, signals=["a"]),
        "ip": EngineResult(engine="ip", score=10, signals=["b"]),
    }
    assert collect_signals(results) == ["a", "b"]


def test_critical_signals_registry_contains_expected():
    assert "credential_stuffing_suspected" in CRITICAL_SIGNALS
    assert "disposable_email" in CRITICAL_SIGNALS


def test_determine_decision_allow_low_risk():
    results = {"email": EngineResult(engine="email", score=0, signals=[])}
    assert determine_decision(10, "low", build_event(event_type="player.signup").event_type, results) == "allow"


def test_determine_decision_block_on_critical_signal():
    results = {
        "email": EngineResult(engine="email", score=70, signals=["disposable_email"]),
    }
    decision = determine_decision(70, "high", build_event(event_type="player.signup").event_type, results)
    assert decision == "block"


def test_determine_decision_login_high_blocks():
    results = {"ip": EngineResult(engine="ip", score=75, signals=[])}
    decision = determine_decision(75, "high", build_event(event_type="player.login").event_type, results)
    assert decision == "block"


def test_determine_decision_signup_high_blocks():
    results = {"ip": EngineResult(engine="ip", score=75, signals=[])}
    decision = determine_decision(75, "high", build_event(event_type="player.signup").event_type, results)
    assert decision == "block"


def test_has_critical_signal_ignores_device_trust_signals_in_config():
    from app.runtime_config import get_runtime_config_store
    from app.settings import Settings

    store = get_runtime_config_store()
    config = store.get()
    config.critical_signals = list(config.critical_signals) + ["new_device_on_withdrawal"]
    store.update(config, updated_by="test")

    results = {
        "trusted_device": EngineResult(
            engine="trusted_device",
            score=70,
            signals=["new_device_on_withdrawal"],
        ),
    }
    assert has_critical_signal(results) is False

    store.reset(settings=Settings(), updated_by="test")


def test_determine_decision_new_device_withdrawal_critical_risk_still_challenges():
    results = {
        "trusted_device": EngineResult(
            engine="trusted_device",
            score=85,
            signals=["new_device_on_withdrawal", "first_device_seen_for_user"],
        ),
    }
    decision = determine_decision(85, "critical", build_event(event_type="payment.withdraw").event_type, results)
    assert decision == "challenge"


def test_determine_decision_untrusted_device_login_challenges_despite_high_risk():
    results = {
        "trusted_device": EngineResult(
            engine="trusted_device",
            score=35,
            signals=["untrusted_device_login"],
        ),
        "ip": EngineResult(engine="ip", score=40, signals=["vpn_detected"]),
    }
    decision = determine_decision(75, "high", build_event(event_type="player.login").event_type, results)
    assert decision == "challenge"


def test_determine_decision_shared_fingerprint_blocks_before_device_trust_challenge():
    """Multi-account fingerprint abuse must hard-block even with untrusted_device_login."""
    results = {
        "trusted_device": EngineResult(
            engine="trusted_device",
            score=50,
            signals=["untrusted_device_login", "first_device_seen_for_user"],
        ),
        "velocity": EngineResult(
            engine="velocity",
            score=55,
            signals=["multiple_accounts_same_fingerprint"],
        ),
    }
    decision = determine_decision(100, "critical", build_event(event_type="player.login").event_type, results)
    assert decision == "block"


def test_determine_decision_new_device_on_withdrawal_challenges():
    results = {
        "trusted_device": EngineResult(
            engine="trusted_device",
            score=70,
            signals=["new_device_on_withdrawal"],
        ),
    }
    decision = determine_decision(70, "high", build_event(event_type="payment.withdraw").event_type, results)
    assert decision == "challenge"


def test_determine_decision_withdrawal_medium_blocks():
    results = {"tx": EngineResult(engine="tx", score=40, signals=[])}
    decision = determine_decision(40, "medium", build_event(event_type="payment.withdraw").event_type, results)
    assert decision == "block"


def test_run_all_engines_returns_all_registered_engines(good_signup_event):
    results = run_all_engines(good_signup_event)
    assert set(results.keys()) == {
        "email",
        "phone",
        "ip",
        "identity",
        "device",
        "fingerprint",
        "signup",
        "login",
        "auth_failure",
        "trusted_device",
        "gaming",
        "hedge_betting",
        "velocity",
        "transaction",
        "aml_blocklist",
        "step_up_verification",
    }


def test_velocity_bulk_signup_from_same_ip():
    for index in range(10):
        velocity.evaluate(
            build_event(
                event_id=f"signup_vel_{index}",
                event_type="player.signup",
                context={
                    "ip": "203.0.113.10",
                    "user_agent": "Mozilla/5.0 Chrome/120",
                    "country": "DE",
                    "fingerprint": f"a1b2c3d4e5f6789012345678abc{index:04d}",
                },
            ),
        )

    score, signals = velocity.evaluate(
        build_event(
            event_id="signup_vel_final",
            event_type="player.signup",
            context={
                "ip": "203.0.113.10",
                "user_agent": "Mozilla/5.0 Chrome/120",
                "country": "DE",
                "fingerprint": "a1b2c3d4e5f6789012345678abc9999",
            },
        ),
    )
    assert score >= 60
    assert "bulk_signup_attack" in signals


def test_velocity_bulk_login_and_credential_stuffing():
    for index in range(16):
        velocity.evaluate(
            build_event(
                event_id=f"login_vel_{index}",
                event_type="player.login",
                user={
                    "user_id": f"user_{index}",
                    "email": f"user{index}@example.com",
                    "phone": None,
                    "name": "User",
                },
            ),
        )

    score, signals = velocity.evaluate(
        build_event(
            event_id="login_vel_final",
            event_type="player.login",
            user={"user_id": "user_final", "email": "final@example.com", "phone": None, "name": "User"},
        ),
    )
    assert "credential_stuffing_suspected" in signals
    assert score >= 80


def test_velocity_multi_account_same_fingerprint():
    shared_fingerprint = "a1b2c3d4e5f6789012345678abcdef01"
    for index in range(4):
        velocity.evaluate(
            build_event(
                event_id=f"fp_vel_{index}",
                event_type="player.signup",
                context={
                    "ip": f"203.0.113.{index}",
                    "user_agent": "Mozilla/5.0 Chrome/120",
                    "fingerprint": shared_fingerprint,
                    "country": "DE",
                },
            ),
        )

    score, signals = velocity.evaluate(
        build_event(
            event_id="fp_vel_final",
            event_type="player.signup",
            context={
                "ip": "203.0.113.99",
                "user_agent": "Mozilla/5.0 Chrome/120",
                "fingerprint": shared_fingerprint,
                "country": "DE",
            },
        ),
    )
    assert "high_signup_fingerprint_velocity" in signals
