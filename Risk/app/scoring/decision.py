from app.engines.registry import (
    collect_signals,
    has_critical_signal,
    has_multi_account_fingerprint_signal,
    DEVICE_TRUST_CHALLENGE_SIGNALS,
)
from app.models import (
    AUTH_FAILURE_EVENT_TYPES,
    GAMING_EVENT_TYPES,
    Decision,
    EngineResult,
    EventType,
    MONEY_EVENT_TYPES,
    RiskLevel,
)
from app.runtime_config import get_runtime_config


def _device_trust_challenge(event_type: EventType, signals: list[str]) -> bool:
    signal_set = set(signals)
    if not signal_set & DEVICE_TRUST_CHALLENGE_SIGNALS:
        return False
    if event_type == EventType.PLAYER_LOGIN:
        return "untrusted_device_login" in signal_set
    if event_type == EventType.PAYMENT_WITHDRAW:
        return bool(signal_set & {"new_device_on_withdrawal", "first_device_seen_for_user"})
    return False


def determine_decision(
    final_score: int,
    risk_level: RiskLevel,
    event_type: EventType,
    engine_results: dict[str, EngineResult],
) -> Decision:
    signals = collect_signals(engine_results)

    if has_critical_signal(engine_results):
        return "block"

    if "sanctioned_country" in signals:
        return "block"

    if event_type == EventType.PAYMENT_WITHDRAW and (
        "ofac_sanctioned_wallet" in signals
        or "blocklisted_payout_address" in signals
    ):
        return "block"

    if event_type in MONEY_EVENT_TYPES and "blocklisted_country" in signals:
        return "block"

    if has_multi_account_fingerprint_signal(engine_results):
        return "block"

    if _device_trust_challenge(event_type, signals):
        return "challenge"

    if event_type == EventType.PAYMENT_WITHDRAW and (
        "vpn_withdrawal_attempt" in signals
        or "vpn_detected" in signals
        or "vpn_or_proxy_detected" in signals
        or "tor_exit_node" in signals
    ):
        return "block"

    if event_type in MONEY_EVENT_TYPES and "unlicensed_jurisdiction" in signals:
        return "block"

    if event_type in AUTH_FAILURE_EVENT_TYPES:
        if risk_level in {"high", "critical"}:
            return "block"
        if risk_level == "medium":
            return "challenge"
        return "allow"

    if event_type == EventType.PLAYER_LOGIN and risk_level in {"high", "critical"}:
        if _device_trust_challenge(event_type, signals):
            return "challenge"
        return "block"

    if event_type == EventType.PLAYER_SIGNUP and risk_level in {"high", "critical"}:
        return "block"

    if risk_level == "critical":
        if _device_trust_challenge(event_type, signals):
            return "challenge"
        return "block"

    if risk_level == "high":
        if event_type in MONEY_EVENT_TYPES:
            if _device_trust_challenge(event_type, signals):
                return "challenge"
            return "block"
        if event_type == EventType.WALLET_WIN:
            return "challenge"
        return "challenge"

    if risk_level == "medium":
        if event_type == EventType.PAYMENT_WITHDRAW:
            if _device_trust_challenge(event_type, signals):
                return "challenge"
            return "block"
        if event_type in {
            EventType.PAYMENT_DEPOSIT,
            EventType.PLAYER_SIGNUP,
            EventType.PLAYER_LOGIN,
            *GAMING_EVENT_TYPES,
        }:
            return "challenge"
        return "challenge"

    return "allow"


def apply_step_up_bypass(
    decision: Decision,
    engine_results: dict[str, EngineResult],
) -> Decision:
    config = get_runtime_config().step_up_verification
    if not config.enabled or not config.downgrade_challenge_to_allow:
        return decision
    if decision != "challenge":
        return decision

    signals = collect_signals(engine_results)
    if "step_up_verification_active" in signals:
        return "allow"
    return decision
