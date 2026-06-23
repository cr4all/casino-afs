from app.runtime_config import get_runtime_config
from app.engines.utils import normalize_text
from app.models import BET_EVENT_TYPES, CanonicalEvent, EventType, MONEY_EVENT_TYPES, is_provider_sourced_event


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if is_provider_sourced_event(event.event_type):
        return 0, []

    country = (event.context.country or "").upper()
    score = 0
    signals: list[str] = []

    config = get_runtime_config()
    licensed_markets = config.operator.licensed_market_set()
    sanctioned_countries = config.list_set("sanctioned_countries")
    bonus_abuse_referrer_tokens = config.list_set("bonus_abuse_referrer_tokens")
    money_events = MONEY_EVENT_TYPES | {EventType.PLAYER_SIGNUP, EventType.PLAYER_LOGIN}

    if country in sanctioned_countries and event.event_type in money_events:
        return 90, ["sanctioned_country"]

    if country and country not in licensed_markets and event.event_type in {
        EventType.PLAYER_SIGNUP,
        EventType.PAYMENT_DEPOSIT,
        *BET_EVENT_TYPES,
    }:
        score += 45
        signals.append("unlicensed_jurisdiction")

    if event.event_type == EventType.PAYMENT_WITHDRAW:
        ip = event.context.ip
        if ip:
            from app.infrastructure.ip_intelligence import get_ip_intelligence_service

            intel = get_ip_intelligence_service().lookup(ip)
            if intel.is_anonymous:
                score += 70
                signals.append("vpn_withdrawal_attempt")

    if event.event_type == EventType.PLAYER_SIGNUP:
        referrer = normalize_text(event.metadata.referrer if event.metadata else None).lower()
        if referrer and any(token in referrer for token in bonus_abuse_referrer_tokens):
            score += 40
            signals.append("bonus_abuse_referrer")

    if event.event_type == EventType.PAYMENT_DEPOSIT and country and country not in licensed_markets:
        score += 20
        signals.append("deposit_from_unlicensed_market")

    if event.event_type == EventType.BONUS_CREATED:
        score += 15
        signals.append("bonus_grant_observed")

    if event.event_type == EventType.PLAYER_LOGIN and country in sanctioned_countries:
        score += 35
        signals.append("login_from_restricted_region")

    return min(score, 100), signals
