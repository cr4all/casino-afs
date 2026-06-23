from datetime import datetime, timedelta, timezone

from app.runtime_config import get_runtime_config_store
from app.runtime_config.schema import StepUpVerificationConfig
from app.services.evaluator import RiskEvaluator
from app.services.step_up_verification import get_step_up_verification_service
from tests.factories import build_event


def _turnstile_metadata(*, verified: bool = True, verified_at: datetime | None = None) -> dict:
    return {
        "channel": "web",
        "step_up_verification": {
            "provider": "cloudflare_turnstile",
            "verified": verified,
            "verified_at": (verified_at or datetime.now(timezone.utc)).isoformat().replace("+00:00", "Z"),
            "hostname": "casino.example.com",
            "action": None,
        },
    }


def test_verified_turnstile_downgrades_challenge_to_allow(evaluator: RiskEvaluator):
    store = get_runtime_config_store()
    config = store.get()
    config.step_up_verification = StepUpVerificationConfig(
        enabled=True,
        grant_ttl_days=7,
        applicable_event_types=["player.login"],
    )
    store.update(config, updated_by="test")

    event = build_event(
        event_type="player.login",
        context={
            "ip": "203.0.113.99",
            "country": "DE",
            "fingerprint": "cccccccccccccccccccccccccccccccc",
        },
        metadata=_turnstile_metadata(),
    )
    result = evaluator.evaluate(event, "sync")
    assert result.decision == "allow"
    assert "step_up_verification_active" in result.engines["step_up_verification"].signals


def test_stored_grant_allows_later_login_without_metadata(evaluator: RiskEvaluator):
    store = get_runtime_config_store()
    config = store.get()
    config.step_up_verification = StepUpVerificationConfig(
        enabled=True,
        grant_ttl_days=7,
        applicable_event_types=["player.login"],
    )
    store.update(config, updated_by="test")

    context = {
        "ip": "203.0.113.88",
        "country": "DE",
        "fingerprint": "dddddddddddddddddddddddddddddddd",
    }
    first = build_event(
        event_id="login_step_up_1",
        event_type="player.login",
        context=context,
        metadata=_turnstile_metadata(),
    )
    evaluator.evaluate(first, "sync")

    second = build_event(
        event_id="login_step_up_2",
        event_type="player.login",
        context=context,
        metadata={"channel": "web"},
    )
    result = evaluator.evaluate(second, "sync")
    assert result.decision == "allow"
    assert "step_up_verification_active" in result.engines["step_up_verification"].signals


def test_verified_false_adds_failure_signal(evaluator: RiskEvaluator):
    store = get_runtime_config_store()
    config = store.get()
    config.step_up_verification = StepUpVerificationConfig(enabled=True)
    store.update(config, updated_by="test")

    event = build_event(
        event_type="player.login",
        metadata=_turnstile_metadata(verified=False),
    )
    result = evaluator.evaluate(event, "sync")
    assert "turnstile_verification_failed" in result.engines["step_up_verification"].signals


def test_step_up_does_not_override_block(evaluator: RiskEvaluator):
    store = get_runtime_config_store()
    config = store.get()
    config.step_up_verification = StepUpVerificationConfig(
        enabled=True,
        applicable_event_types=["payment.withdraw"],
    )
    config.aml.blocklist.enabled = True
    config.aml.blocklist.crypto_enabled = True
    config.aml.blocklist.manual_crypto_wallets = ["0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"]
    store.update(config, updated_by="test")

    event = build_event(
        event_type="payment.withdraw",
        transaction={
            "amount": 100.0,
            "currency": "EUR",
            "payment_method_type": "crypto",
            "payment_method_key": "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        },
        metadata=_turnstile_metadata(),
    )
    result = evaluator.evaluate(event, "sync")
    assert result.decision == "block"


def test_stale_verified_at_is_ignored(evaluator: RiskEvaluator):
    store = get_runtime_config_store()
    config = store.get()
    config.step_up_verification = StepUpVerificationConfig(
        enabled=True,
        max_verified_age_minutes=5,
        applicable_event_types=["player.login"],
    )
    store.update(config, updated_by="test")

    stale = datetime.now(timezone.utc) - timedelta(minutes=30)
    event = build_event(
        event_type="player.login",
        context={
            "ip": "203.0.113.77",
            "country": "DE",
            "fingerprint": "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        },
        metadata=_turnstile_metadata(verified_at=stale),
    )
    result = evaluator.evaluate(event, "sync")
    assert "turnstile_verification_stale" in result.engines["step_up_verification"].signals
    service = get_step_up_verification_service()
    assert not service.has_active_grant(event.user.user_id, "fp:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
