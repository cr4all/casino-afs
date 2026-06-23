from app.engines import trusted_device as trusted_device_engine
from app.engines.registry import run_all_engines
from app.scoring.aggregator import aggregate
from app.scoring.decision import determine_decision
from app.services.trusted_devices import get_trusted_device_service
from tests.factories import build_event


def test_trusted_device_engine_ignores_signup():
    score, signals = trusted_device_engine.evaluate(build_event(event_type="player.signup"))
    assert score == 0
    assert signals == []


def test_register_trusted_device_directly():
    service = get_trusted_device_service()
    event = build_event(event_type="player.login", event_id="login_trust_direct")
    service.register_trusted_device(event)
    assert service.is_trusted(event.user.user_id, event.context)


def test_new_device_on_withdrawal_blocks():
    service = get_trusted_device_service()
    login_event = build_event(event_id="login_before_withdrawal", event_type="player.login")
    service.register_trusted_device(login_event)

    withdrawal_event = build_event(
        event_id="withdrawal_new_device",
        event_type="payment.withdraw",
        context={
            "fingerprint": "unknownfingerprint000000000001",
        },
        transaction={"amount": 100.0, "currency": "EUR", "payment_method": "bank_transfer"},
    )

    results = run_all_engines(withdrawal_event)
    final_score, risk_level = aggregate(results)
    decision = determine_decision(final_score, risk_level, withdrawal_event.event_type, results)

    assert "new_device_on_withdrawal" in [s for e in results.values() for s in e.signals]
    assert decision == "block"


def test_first_login_without_known_devices_is_not_penalized():
    event = build_event(
        event_type="player.login",
        user={"user_id": "new_user_1", "email": "a@b.com", "phone": None, "name": "A"},
    )
    score, signals = trusted_device_engine.evaluate(event)
    assert score == 0
    assert signals == []


def test_login_after_signup_registration_trusts_same_fingerprint(evaluator):
    signup = build_event(
        event_id="signup_trust_1",
        event_type="player.signup",
        user={"user_id": "user_42", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
    )
    signup_result = evaluator.evaluate(signup, "sync")
    assert signup_result.decision in {"allow", "challenge"}

    service = get_trusted_device_service()
    assert service.is_trusted("user_42", signup.context)

    login = build_event(
        event_id="login_trust_1",
        event_type="player.login",
        user={"user_id": "user_42", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
    )
    score, signals = trusted_device_engine.evaluate(login)
    assert score == 0
    assert signals == []


def test_login_from_new_fingerprint_after_signup_is_flagged(evaluator):
    signup = build_event(
        event_id="signup_trust_2",
        event_type="player.signup",
        user={"user_id": "user_43", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
    )
    evaluator.evaluate(signup, "sync")

    login = build_event(
        event_id="login_trust_2",
        event_type="player.login",
        user={"user_id": "user_43", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
        context={
            "ip": "203.0.113.10",
            "user_agent": "Mozilla/5.0 Chrome/120",
            "country": "DE",
            "fingerprint": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb01",
        },
    )
    score, signals = trusted_device_engine.evaluate(login)
    assert "untrusted_device_login" in signals


def test_signup_allow_registers_fingerprint(evaluator):
    signup = build_event(
        event_id="signup_register_1",
        event_type="player.signup",
        user={"user_id": "user_signup_reg", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
    )
    result = evaluator.evaluate(signup, "sync")
    assert result.decision in {"allow", "challenge"}

    service = get_trusted_device_service()
    assert service.trusted_device_count("user_signup_reg") == 1
    assert service.is_trusted("user_signup_reg", signup.context)


def test_first_login_registers_when_signup_did_not(evaluator):
    login = build_event(
        event_id="login_register_1",
        event_type="player.login",
        user={"user_id": "user_login_reg", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
    )
    service = get_trusted_device_service()
    assert service.trusted_device_count("user_login_reg") == 0

    result = evaluator.evaluate(login, "sync")
    assert result.decision in {"allow", "challenge"}
    assert service.trusted_device_count("user_login_reg") == 1
    assert service.is_trusted("user_login_reg", login.context)


def test_login_from_new_fingerprint_does_not_auto_register(evaluator):
    signup = build_event(
        event_id="signup_no_auto_1",
        event_type="player.signup",
        user={"user_id": "user_no_auto", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
    )
    evaluator.evaluate(signup, "sync")

    login = build_event(
        event_id="login_no_auto_1",
        event_type="player.login",
        user={"user_id": "user_no_auto", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
        context={
            "ip": "203.0.113.10",
            "user_agent": "Mozilla/5.0 Chrome/120",
            "country": "DE",
            "fingerprint": "cccccccccccccccccccccccccccccc01",
        },
    )
    evaluator.evaluate(login, "sync")

    service = get_trusted_device_service()
    assert service.trusted_device_count("user_no_auto") == 1
    assert not service.is_trusted("user_no_auto", login.context)
