from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import sessionmaker

from app.models import CanonicalEvent, ContextData, StepUpVerificationData
from app.runtime_config import get_runtime_config
from shared.db.models import StepUpVerificationGrant


def device_key_from_context(context: ContextData) -> str | None:
    if context.fingerprint:
        return f"fp:{context.fingerprint.strip()}"
    if context.device_id:
        return f"dev:{context.device_id.strip()}"
    return None


def is_verified_at_fresh(verified_at: datetime, max_age_minutes: int) -> bool:
    if verified_at.tzinfo is None:
        verified_at = verified_at.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    if verified_at > now:
        return False
    return verified_at >= now - timedelta(minutes=max_age_minutes)


class StepUpVerificationService:
    def __init__(self, session_factory: sessionmaker) -> None:
        self._session_factory = session_factory

    def has_active_grant(self, user_id: str, device_key: str | None) -> bool:
        if not user_id or not device_key:
            return False

        now = datetime.now(timezone.utc)
        with self._session_factory() as session:
            row = (
                session.query(StepUpVerificationGrant)
                .filter_by(user_id=user_id, device_key=device_key)
                .one_or_none()
            )
            if row is None:
                return False
            expires_at = row.expires_at
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            return expires_at > now

    def register_grant(self, event: CanonicalEvent, step_up: StepUpVerificationData) -> None:
        config = get_runtime_config().step_up_verification
        if not config.enabled:
            return

        user_id = event.user.user_id
        device_key = device_key_from_context(event.context)
        if not user_id or not device_key:
            return

        if step_up.provider != "cloudflare_turnstile" or not step_up.verified:
            return

        if not is_verified_at_fresh(step_up.verified_at, config.max_verified_age_minutes):
            return

        if config.allowed_hostnames and step_up.hostname:
            allowed = {host.strip().lower() for host in config.allowed_hostnames if host.strip()}
            if step_up.hostname.strip().lower() not in allowed:
                return

        verified_at = step_up.verified_at
        if verified_at.tzinfo is None:
            verified_at = verified_at.replace(tzinfo=timezone.utc)

        expires_at = datetime.now(timezone.utc) + timedelta(days=config.grant_ttl_days)
        now = datetime.now(timezone.utc)

        with self._session_factory() as session:
            existing = (
                session.query(StepUpVerificationGrant)
                .filter_by(user_id=user_id, device_key=device_key)
                .one_or_none()
            )
            if existing:
                existing.provider = step_up.provider
                existing.verified_at = verified_at
                existing.expires_at = expires_at
                existing.hostname = step_up.hostname
            else:
                session.add(
                    StepUpVerificationGrant(
                        user_id=user_id,
                        device_key=device_key,
                        provider=step_up.provider,
                        verified_at=verified_at,
                        expires_at=expires_at,
                        hostname=step_up.hostname,
                    )
                )
            session.commit()


_service: StepUpVerificationService | None = None


def init_step_up_verification_service(session_factory: sessionmaker) -> StepUpVerificationService:
    global _service
    _service = StepUpVerificationService(session_factory)
    return _service


def get_step_up_verification_service() -> StepUpVerificationService:
    if _service is None:
        raise RuntimeError("Step-up verification service is not initialized")
    return _service
