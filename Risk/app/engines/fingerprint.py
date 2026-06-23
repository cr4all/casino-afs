from app.runtime_config import get_runtime_config
from app.engines.utils import normalize_text
from app.infrastructure.fingerprint_validator import is_valid_fingerprint, normalize_fingerprint
from app.models import CanonicalEvent, EventType, MONEY_EVENT_TYPES, TRUST_REGISTRATION_EVENT_TYPES, is_provider_sourced_event


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if is_provider_sourced_event(event.event_type):
        return 0, []

    if event.event_type not in MONEY_EVENT_TYPES | TRUST_REGISTRATION_EVENT_TYPES:
        return 0, []

    context = event.context
    metadata = event.metadata
    channel = normalize_text(metadata.channel if metadata else None).lower()
    fingerprint = normalize_fingerprint(context.fingerprint)
    score = 0
    signals: list[str] = []

    required_channels = {channel.lower() for channel in get_runtime_config().fingerprint.required_channels}

    if channel in required_channels:
        if not fingerprint:
            score += 35
            signals.append("missing_fingerprint")
        elif not is_valid_fingerprint(fingerprint):
            score += 45
            signals.append("invalid_fingerprint")

    if fingerprint and not is_valid_fingerprint(fingerprint):
        score += 40
        signals.append("malformed_fingerprint")

    if event.event_type in {EventType.PAYMENT_WITHDRAW, EventType.PAYMENT_DEPOSIT} and not fingerprint:
        score += 25
        signals.append("missing_fingerprint_on_money_event")

    if fingerprint and context.timezone and context.country:
        if _timezone_country_mismatch(context.timezone, context.country):
            score += 15
            signals.append("timezone_country_mismatch")

    if context.platform and context.user_agent:
        platform = context.platform.lower()
        ua = context.user_agent.lower()
        if platform.startswith("win") and "iphone" in ua:
            score += 30
            signals.append("platform_user_agent_mismatch")
        elif platform.startswith("linux") and "mac os" in ua:
            score += 30
            signals.append("platform_user_agent_mismatch")

    return min(score, 100), signals


def _timezone_country_mismatch(timezone: str, country: str) -> bool:
    country = country.upper()
    timezone_lower = timezone.lower()

    country_timezone_hints = {
        "DE": ("berlin", "vienna"),
        "GB": ("london",),
        "US": ("new_york", "chicago", "denver", "los_angeles"),
    }

    hints = country_timezone_hints.get(country)
    if not hints:
        return False

    return not any(hint in timezone_lower for hint in hints)
