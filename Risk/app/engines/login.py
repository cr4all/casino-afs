from app.engines.utils import is_bot_user_agent, is_missing_user_agent, normalize_text
from app.models import CanonicalEvent, EventType


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if event.event_type != EventType.PLAYER_LOGIN:
        return 0, []

    score = 0
    signals: list[str] = []
    metadata = event.metadata

    if not event.user.user_id:
        score += 60
        signals.append("missing_user_id")

    if not event.user.email and not event.user.phone:
        score += 45
        signals.append("missing_login_identifier")

    if is_missing_user_agent(event.context.user_agent):
        score += 25
        signals.append("headless_login_attempt")

    if is_bot_user_agent(event.context.user_agent):
        score += 75
        signals.append("automated_login_attempt")

    channel = normalize_text(metadata.channel if metadata else None).lower()
    if channel == "api" and is_missing_user_agent(event.context.user_agent):
        score += 35
        signals.append("api_login_without_user_agent")

    if event.context.ip and event.context.country:
        # Heuristic: rapid geo inconsistency would need history; flag API channel from high-risk geo
        if channel == "api" and event.context.country in {"NG", "RU", "CN"}:
            score += 20
            signals.append("high_risk_api_login_geo")

    return min(score, 100), signals
