from app.engines.registry import collect_signals, has_critical_signal
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

    if "new_device_on_withdrawal" in signals:
        return "block"

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
        return "block"

    if event_type == EventType.PLAYER_SIGNUP and risk_level in {"high", "critical"}:
        return "block"

    if risk_level == "critical":
        return "block"

    if risk_level == "high":
        if event_type in MONEY_EVENT_TYPES:
            return "block"
        if event_type == EventType.WALLET_WIN:
            return "challenge"
        return "challenge"

    if risk_level == "medium":
        if event_type == EventType.PAYMENT_WITHDRAW:
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
