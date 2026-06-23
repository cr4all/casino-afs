from app.runtime_config import get_runtime_config
from app.engines.utils import is_private_ip
from app.infrastructure.ip_intelligence import get_ip_intelligence_service
from app.models import CanonicalEvent, EventType, MONEY_EVENT_TYPES, is_provider_sourced_event


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if is_provider_sourced_event(event.event_type):
        return 0, []

    ip = event.context.ip
    context_country = (event.context.country or "").upper()
    score = 0
    signals: list[str] = []

    if not ip:
        if event.event_type in {EventType.PLAYER_SIGNUP, EventType.PLAYER_LOGIN}:
            return 35, ["missing_ip"]
        return 20, ["missing_ip"]

    intel = get_ip_intelligence_service().lookup(ip)

    if intel.is_vpn:
        score += 60
        signals.append("vpn_detected")

    if intel.is_proxy and not intel.is_vpn:
        score += 50
        signals.append("proxy_detected")

    if intel.is_tor:
        score += 70
        signals.append("tor_exit_node")

    if intel.is_vpn or intel.is_proxy or intel.is_tor:
        score += 10
        signals.append("vpn_or_proxy_detected")
        if event.event_type in MONEY_EVENT_TYPES:
            score += 25
            signals.append("vpn_on_money_event")

    if intel.is_hosting and event.event_type in {EventType.PLAYER_SIGNUP, EventType.PLAYER_LOGIN}:
        score += 25
        signals.append("datacenter_ip")

    if intel.lookup_failed and not signals:
        score += 5
        signals.append("ip_intel_lookup_failed")

    # if is_private_ip(ip) and event.event_type in {EventType.PLAYER_SIGNUP, EventType.PLAYER_LOGIN}:
    #     score += 20
    #     signals.append("private_ip_address")

    country = context_country or (intel.country_code or "").upper()
    config = get_runtime_config()
    sanctioned_countries = config.list_set("sanctioned_countries")
    high_risk_countries = config.list_set("high_risk_countries")

    if country in sanctioned_countries:
        score += 40
        signals.append("sanctioned_country_ip_context")
    elif country in high_risk_countries:
        score += 25
        signals.append("high_risk_country")

    if event.event_type in {EventType.PLAYER_SIGNUP, EventType.PLAYER_LOGIN, EventType.PAYMENT_DEPOSIT} and not country:
        score += 10
        signals.append("missing_country")

    if (
        context_country
        and intel.country_code
        and context_country != intel.country_code.upper()
    ):
        score += 20
        signals.append("geo_ip_country_mismatch")

    return min(score, 100), signals
