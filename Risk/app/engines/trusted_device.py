from app.models import CanonicalEvent, EventType
from app.services.trusted_devices import get_trusted_device_service


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if event.event_type not in {EventType.PAYMENT_WITHDRAW, EventType.PLAYER_LOGIN, EventType.PAYMENT_DEPOSIT}:
        return 0, []

    user_id = event.user.user_id
    if not user_id:
        return 40, ["missing_user_id_for_device_check"]

    try:
        service = get_trusted_device_service()
    except RuntimeError:
        return 0, []

    if service.is_trusted(user_id, event.context):
        return 0, []

    known_devices = service.trusted_device_count(user_id)

    # First login for this user: no baseline yet (signup may register after allow/challenge).
    if event.event_type == EventType.PLAYER_LOGIN and known_devices == 0:
        return 0, []

    score = 0
    signals: list[str] = []

    if event.event_type == EventType.PAYMENT_WITHDRAW:
        score += 70
        signals.append("new_device_on_withdrawal")
    elif event.event_type == EventType.PLAYER_LOGIN:
        score += 35
        signals.append("untrusted_device_login")
    elif event.event_type == EventType.PAYMENT_DEPOSIT:
        score += 25
        signals.append("untrusted_device_deposit")

    if known_devices == 0:
        score += 15
        signals.append("first_device_seen_for_user")

    return min(score, 100), signals
