from app.engines.utils import is_bot_user_agent, is_missing_user_agent, normalize_text
from app.infrastructure.user_agent_parser import parse_user_agent
from app.models import CanonicalEvent, EventType, MONEY_EVENT_TYPES, TRUST_REGISTRATION_EVENT_TYPES, is_provider_sourced_event


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if is_provider_sourced_event(event.event_type):
        return 0, []

    if event.event_type not in MONEY_EVENT_TYPES | TRUST_REGISTRATION_EVENT_TYPES:
        return 0, []

    context = event.context
    metadata = event.metadata
    score = 0
    signals: list[str] = []

    user_agent = context.user_agent
    channel = normalize_text(metadata.channel if metadata else None).lower()

    if is_missing_user_agent(user_agent):
        score += 30
        signals.append("missing_user_agent")

    if is_bot_user_agent(user_agent):
        score += 70
        signals.append("bot_user_agent")

    parsed = parse_user_agent(user_agent)

    if parsed.is_emulator:
        score += 55
        signals.append("emulator_detected")

    if parsed.is_bot and not is_bot_user_agent(user_agent):
        score += 40
        signals.append("parser_bot_detected")

    if parsed.browser_family == "Other" and event.event_type == EventType.PLAYER_SIGNUP:
        score += 20
        signals.append("unknown_browser_family")

    if channel and channel not in {"web", "ios", "android", "mobile", "api"}:
        score += 15
        signals.append("unknown_channel")

    if event.event_type == EventType.PLAYER_SIGNUP and user_agent and len(user_agent) < 20:
        score += 20
        signals.append("abnormally_short_user_agent")

    if channel == "web" and parsed.is_mobile and context.platform and context.platform.lower().startswith("win"):
        score += 15
        signals.append("mobile_ua_desktop_platform")

    if channel == "android" and parsed.os_family and parsed.os_family.lower() not in {"android"}:
        score += 25
        signals.append("channel_os_mismatch")

    if channel == "ios" and parsed.os_family and parsed.os_family.lower() not in {"ios", "iphone os"}:
        score += 25
        signals.append("channel_os_mismatch")

    return min(score, 100), signals
