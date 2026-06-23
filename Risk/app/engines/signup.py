from app.runtime_config import get_runtime_config
from app.engines.utils import normalize_text
from app.models import CanonicalEvent, EventType


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if event.event_type != EventType.PLAYER_SIGNUP:
        return 0, []

    score = 0
    signals: list[str] = []
    metadata = event.metadata

    referrer = normalize_text(metadata.referrer if metadata else None).lower()
    channel = normalize_text(metadata.channel if metadata else None).lower()

    suspicious_referrers = get_runtime_config().list_set("suspicious_referrers")

    if referrer in suspicious_referrers:
        score += 20
        signals.append("suspicious_referrer")

    if referrer and any(token in referrer for token in ["tor", "dark", "crack", "hack", "free-money"]):
        score += 35
        signals.append("high_risk_referrer")

    if not channel:
        score += 10
        signals.append("missing_channel_on_signup")

    if event.user.email and event.user.phone and event.user.name:
        email_local = event.user.email.split("@", 1)[0]
        if email_local.isdigit() and event.user.name.isdigit():
            score += 25
            signals.append("auto_generated_profile")

    if event.context.country and event.user.phone:
        phone = event.user.phone.replace(" ", "")
        if event.context.country == "DE" and not phone.startswith("+49"):
            score += 15
            signals.append("phone_country_mismatch")

    return min(score, 100), signals
