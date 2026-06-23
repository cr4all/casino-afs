from app.infrastructure.velocity_store import get_velocity_store
from app.models import CanonicalEvent, EventType


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if event.event_type not in {EventType.PLAYER_LOGIN_FAILED, EventType.PLAYER_SIGNUP_FAILED}:
        return 0, []

    return get_velocity_store().record_auth_failure(event)
