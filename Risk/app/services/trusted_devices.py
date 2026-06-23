from datetime import datetime, timezone

from sqlalchemy.orm import Session

from shared.db.models import TrustedDevice
from app.models import CanonicalEvent, ContextData


def device_key_from_context(context: ContextData) -> str | None:
    if context.fingerprint:
        return f"fp:{context.fingerprint.strip()}"
    return None


class TrustedDeviceService:
    def __init__(self, session_factory) -> None:
        self._session_factory = session_factory

    def register_trusted_device(self, event: CanonicalEvent) -> None:
        key = device_key_from_context(event.context)
        if not key or not event.user.user_id:
            return

        now = datetime.now(timezone.utc)
        with self._session_factory() as session:
            existing = (
                session.query(TrustedDevice)
                .filter_by(user_id=event.user.user_id, device_key=key)
                .one_or_none()
            )
            if existing:
                existing.last_seen_at = now
                existing.fingerprint = event.context.fingerprint
            else:
                session.add(
                    TrustedDevice(
                        user_id=event.user.user_id,
                        device_key=key,
                        fingerprint=event.context.fingerprint,
                        first_seen_at=now,
                        last_seen_at=now,
                    ),
                )
            session.commit()

    def is_trusted(self, user_id: str, context: ContextData) -> bool:
        key = device_key_from_context(context)
        if not key:
            return False

        with self._session_factory() as session:
            return (
                session.query(TrustedDevice)
                .filter_by(user_id=user_id, device_key=key)
                .one_or_none()
                is not None
            )

    def trusted_device_count(self, user_id: str) -> int:
        with self._session_factory() as session:
            return session.query(TrustedDevice).filter_by(user_id=user_id).count()


_service: TrustedDeviceService | None = None


def init_trusted_device_service(session_factory) -> TrustedDeviceService:
    global _service
    _service = TrustedDeviceService(session_factory)
    return _service


def get_trusted_device_service() -> TrustedDeviceService:
    if _service is None:
        raise RuntimeError("Trusted device service not initialized")
    return _service
