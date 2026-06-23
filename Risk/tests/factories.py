from app.models import CanonicalEvent


def build_event(
    *,
    event_id: str = "evt_test_1",
    event_type: str = "player.signup",
    user: dict | None = None,
    context: dict | None = None,
    metadata: dict | None = None,
    transaction: dict | None = None,
) -> CanonicalEvent:
    payload = {
        "event_id": event_id,
        "event_type": event_type,
        "timestamp": "2026-06-21T12:00:00Z",
        "user": user
        or {
            "user_id": "u1",
            "email": "mgarcia@gmail.com",
            "phone": "+491701234567",
            "name": "Maria Garcia",
        },
        "context": context
        or {
            "ip": "203.0.113.10",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
            "country": "DE",
            "fingerprint": "a1b2c3d4e5f6789012345678abcdef01",
            "fingerprint_version": "v4.2.0",
            "browser_language": "de-DE",
            "timezone": "Europe/Berlin",
            "platform": "Win32",
            "screen_resolution": "1920x1080",
        },
        "metadata": metadata
        or {
            "channel": "web",
            "session_id": "sess_abc",
            "referrer": "google.com",
        },
    }

    if transaction is not None:
        payload["transaction"] = transaction

    return CanonicalEvent.model_validate(payload)
