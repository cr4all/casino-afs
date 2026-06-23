from collections.abc import Callable

from app.engines import (
    aml_blocklist,
    auth_failure,
    device,
    email,
    fingerprint,
    gaming,
    identity,
    ip,
    login,
    phone,
    signup,
    step_up_verification,
    transaction,
    trusted_device,
    velocity,
)
from app.runtime_config import get_runtime_config
from app.models import CanonicalEvent, EngineResult

EngineFn = Callable[[CanonicalEvent], tuple[int, list[str]]]

ENGINES: dict[str, EngineFn] = {
    "email": email.evaluate,
    "phone": phone.evaluate,
    "ip": ip.evaluate,
    "identity": identity.evaluate,
    "device": device.evaluate,
    "fingerprint": fingerprint.evaluate,
    "signup": signup.evaluate,
    "login": login.evaluate,
    "auth_failure": auth_failure.evaluate,
    "trusted_device": trusted_device.evaluate,
    "gaming": gaming.evaluate,
    "velocity": velocity.evaluate,
    "transaction": transaction.evaluate,
    "aml_blocklist": aml_blocklist.evaluate,
    "step_up_verification": step_up_verification.evaluate,
}

CRITICAL_SIGNALS = frozenset(
    {
        "bulk_login_attack",
        "bulk_signup_attack",
        "credential_stuffing_suspected",
        "bot_user_agent",
        "automated_login_attempt",
        "disposable_email",
        "multi_account_fingerprint_abuse",
        "multi_account_shared_withdrawal_method",
        "ofac_sanctioned_wallet",
        "blocklisted_payout_address",
        "blocklisted_country",
        "sanctioned_country",
        "vpn_withdrawal_attempt",
        "emulator_detected",
        "brute_force_login_suspected",
        "new_device_on_withdrawal",
    }
)


def _critical_signal_set() -> set[str]:
    return set(get_runtime_config().critical_signals)


def run_all_engines(event: CanonicalEvent) -> dict[str, EngineResult]:
    results: dict[str, EngineResult] = {}

    for name, evaluate_fn in ENGINES.items():
        score, signals = evaluate_fn(event)
        results[name] = EngineResult(engine=name, score=score, signals=signals)

    return results


def collect_signals(engine_results: dict[str, EngineResult]) -> list[str]:
    return [signal for result in engine_results.values() for signal in result.signals]


def has_critical_signal(engine_results: dict[str, EngineResult]) -> bool:
    critical = _critical_signal_set()
    return any(signal in critical for signal in collect_signals(engine_results))
