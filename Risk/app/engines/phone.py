import re

from app.models import CanonicalEvent, EventType


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if event.event_type not in {EventType.PLAYER_SIGNUP, EventType.PLAYER_LOGIN}:
        return 0, []

    phone = event.user.phone
    score = 0
    signals: list[str] = []

    if event.event_type == EventType.PLAYER_SIGNUP and not phone and not event.user.email:
        return 80, ["missing_phone_and_email"]

    if not phone:
        if event.event_type == EventType.PLAYER_SIGNUP:
            score += 15
            signals.append("missing_phone_on_signup")
        return min(score, 100), signals

    normalized = re.sub(r"[\s()-]", "", phone)

    if not re.fullmatch(r"\+?[0-9]{7,15}", normalized):
        score += 45
        signals.append("invalid_phone_format")

    if normalized.startswith("+000") or normalized.startswith("+111"):
        score += 35
        signals.append("suspicious_phone_prefix")

    if len(set(normalized.lstrip("+"))) <= 2:
        score += 40
        signals.append("repeated_digit_phone")

    if event.event_type == EventType.PLAYER_SIGNUP and normalized.startswith("+1") and normalized[2:5] in {"555", "000"}:
        score += 25
        signals.append("test_phone_number_pattern")

    return min(score, 100), signals
