from app.runtime_config import get_runtime_config
from app.engines.utils import is_numeric_only, name_matches_email_local, normalize_text
from app.models import CanonicalEvent, EventType, is_provider_sourced_event


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if is_provider_sourced_event(event.event_type):
        return 0, []

    user = event.user
    score = 0
    signals: list[str] = []

    if not user.email and not user.phone:
        score += 50
        signals.append("no_contact_methods")

    name = normalize_text(user.name)

    if event.event_type == EventType.PLAYER_SIGNUP and not name:
        score += 35
        signals.append("missing_name_on_signup")

    if name:
        lowered = name.lower()

        # if lowered in get_runtime_config().list_set("generic_names"):
        #     score += 30
        #     signals.append("generic_name")

        if len(name) <= 2:
            score += 25
            signals.append("name_too_short")

        # if is_numeric_only(name.replace(" ", "")):
        #     score += 35
        #     signals.append("numeric_name")

        # if name_matches_email_local(name, user.email):
        #     score += 15
        #     signals.append("name_matches_email")

        # if user.email and lowered == user.email.lower():
        #     score += 40
        #     signals.append("name_equals_email")

        # if any(char.isdigit() for char in name) and event.event_type == EventType.PLAYER_SIGNUP:
        #     score += 15
        #     signals.append("name_contains_digits")

    if event.event_type == EventType.PLAYER_LOGIN and not user.user_id:
        score += 50
        signals.append("missing_user_id_on_login")

    return min(score, 100), signals
