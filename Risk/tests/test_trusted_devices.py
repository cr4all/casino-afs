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


def test_new_device_on_withdrawal_challenges():
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
    assert decision == "challenge"


def test_no_trusted_device_on_withdrawal_challenges():
    withdrawal_event = build_event(
        event_id="withdrawal_no_baseline",
        event_type="payment.withdraw",
        user={"user_id": "user_no_signup_trust", "email": "a@b.com", "phone": None, "name": "A"},
        transaction={"amount": 50.0, "currency": "EUR", "payment_method": "bank_transfer"},
    )
    results = run_all_engines(withdrawal_event)
    decision = determine_decision(
        *aggregate(results),
        withdrawal_event.event_type,
        results,
    )
    assert "new_device_on_withdrawal" in [s for e in results.values() for s in e.signals]
    assert decision == "challenge"


def test_signup_registers_device_not_withdraw(evaluator):
    signup = build_event(
        event_id="signup_only_trust",
        event_type="player.signup",
        user={"user_id": "user_signup_only", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
    )
    signup_result = evaluator.evaluate(signup, "sync")
    assert signup_result.decision in {"allow", "challenge"}
    service = get_trusted_device_service()
    assert service.trusted_device_count("user_signup_only") == 1

    withdraw = build_event(
        event_id="withdraw_after_signup",
        event_type="payment.withdraw",
        user={"user_id": "user_signup_only", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
        transaction={"amount": 50.0, "currency": "EUR", "payment_method": "bank_transfer"},
    )
    result = evaluator.evaluate(withdraw, "sync")
    assert result.decision == "allow"
    assert service.trusted_device_count("user_signup_only") == 1


def test_first_login_challenges_and_registers(evaluator):
    login = build_event(
        event_id="login_first_challenge",
        event_type="player.login",
        user={"user_id": "user_first_login", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
    )
    service = get_trusted_device_service()
    assert service.trusted_device_count("user_first_login") == 0

    result = evaluator.evaluate(login, "sync")
    assert "untrusted_device_login" in [
        s for e in result.engines.values() for s in e.signals
    ]
    assert result.decision == "challenge"
    assert service.trusted_device_count("user_first_login") == 1
    assert service.is_trusted("user_first_login", login.context)


def _full_context(**overrides) -> dict:
    base = {
        "ip": "203.0.113.10",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "country": "DE",
        "fingerprint": "a1b2c3d4e5f6789012345678abcdef01",
        "fingerprint_version": "v4.2.0",
        "browser_language": "de-DE",
        "timezone": "Europe/Berlin",
        "platform": "Win32",
        "screen_resolution": "1920x1080",
    }
    base.update(overrides)
    return base


def test_withdraw_allows_matching_fingerprint_case_insensitive(evaluator):
    signup = build_event(
        event_id="signup_fp_case",
        event_type="player.signup",
        user={"user_id": "user_fp_case", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
        context=_full_context(fingerprint="A1B2C3D4E5F6789012345678ABCDEF01"),
    )
    evaluator.evaluate(signup, "sync")

    withdraw = build_event(
        event_id="withdraw_fp_case",
        event_type="payment.withdraw",
        user={"user_id": "user_fp_case", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
        context=_full_context(fingerprint="a1b2c3d4e5f6789012345678abcdef01"),
        transaction={"amount": 50.0, "currency": "EUR", "payment_method": "bank_transfer"},
    )
    result = evaluator.evaluate(withdraw, "sync")
    assert "new_device_on_withdrawal" not in [
        s for e in result.engines.values() for s in e.signals
    ]
    assert result.decision in {"allow", "challenge"}


def test_first_login_without_known_devices_signals_untrusted():
    event = build_event(
        event_type="player.login",
        user={"user_id": "new_user_1", "email": "a@b.com", "phone": None, "name": "A"},
    )
    score, signals = trusted_device_engine.evaluate(event)
    assert score > 0
    assert "untrusted_device_login" in signals


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


def test_login_new_device_challenges_when_baseline_exists(evaluator):
    signup = build_event(
        event_id="signup_login_challenge",
        event_type="player.signup",
        user={"user_id": "user_login_new_dev", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
    )
    evaluator.evaluate(signup, "sync")

    login = build_event(
        event_id="login_new_device",
        event_type="player.login",
        user={"user_id": "user_login_new_dev", "email": "maria@gmail.com", "phone": "+491701234567", "name": "Maria"},
        context={
            "ip": "203.0.113.10",
            "user_agent": "Mozilla/5.0 Chrome/120",
            "country": "DE",
            "fingerprint": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb01",
        },
    )
    result = evaluator.evaluate(login, "sync")
    assert "untrusted_device_login" in [
        s for e in result.engines.values() for s in e.signals
    ]
    assert result.decision == "challenge"


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


def test_login_from_new_fingerprint_registers_on_challenge(evaluator):
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
    result = evaluator.evaluate(login, "sync")
    assert result.decision == "challenge"

    service = get_trusted_device_service()
    assert service.trusted_device_count("user_no_auto") == 2
    assert service.is_trusted("user_no_auto", login.context)
