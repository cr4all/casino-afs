from app.models import CanonicalEvent
from app.runtime_config import get_runtime_config
from app.services.step_up_verification import (
    device_key_from_context,
    get_step_up_verification_service,
    is_verified_at_fresh,
)


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    config = get_runtime_config().step_up_verification
    if not config.enabled:
        return 0, []

    if event.event_type.value not in config.applicable_event_types:
        return 0, []

    user_id = event.user.user_id
    device_key = device_key_from_context(event.context)

    try:
        service = get_step_up_verification_service()
        if service.has_active_grant(user_id, device_key):
            return 0, ["step_up_verification_active"]
    except RuntimeError:
        pass

    step_up = event.metadata.step_up_verification if event.metadata else None
    if step_up is None:
        return 0, []

    if step_up.provider != "cloudflare_turnstile":
        return 0, []

    if not step_up.verified:
        return 15, ["turnstile_verification_failed"]

    if not is_verified_at_fresh(step_up.verified_at, config.max_verified_age_minutes):
        return 0, ["turnstile_verification_stale"]

    if config.allowed_hostnames and step_up.hostname:
        allowed = {host.strip().lower() for host in config.allowed_hostnames if host.strip()}
        if step_up.hostname.strip().lower() not in allowed:
            return 10, ["turnstile_hostname_mismatch"]

    return 0, ["step_up_verification_active"]
