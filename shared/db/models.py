from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from shared.db.base import Base


class TrustedDevice(Base):
    __tablename__ = "trusted_devices"
    __table_args__ = (UniqueConstraint("user_id", "device_key", name="uq_user_device"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(128), index=True)
    device_key: Mapped[str] = mapped_column(String(256))
    fingerprint: Mapped[str | None] = mapped_column(String(128), nullable=True)
    device_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    first_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class RuntimeConfigRecord(Base):
    __tablename__ = "runtime_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    config_json: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_by: Mapped[str | None] = mapped_column(String(128), nullable=True)


class RuntimeConfigAuditLog(Base):
    __tablename__ = "runtime_config_audit"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    config_json: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_by: Mapped[str | None] = mapped_column(String(128), nullable=True)
    summary: Mapped[str] = mapped_column(String(512))


class EvaluateRequestLog(Base):
    __tablename__ = "evaluate_request_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    channel: Mapped[str] = mapped_column(String(16), index=True)
    status: Mapped[str] = mapped_column(String(32), index=True)
    summary: Mapped[str] = mapped_column(Text)
    event_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    event_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    routing_key: Mapped[str | None] = mapped_column(String(256), nullable=True)
    queue: Mapped[str | None] = mapped_column(String(128), nullable=True)
    endpoint: Mapped[str | None] = mapped_column(String(64), nullable=True)
    error: Mapped[str | None] = mapped_column(String(512), nullable=True)
    request_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_json: Mapped[str | None] = mapped_column(Text, nullable=True)


class StepUpVerificationGrant(Base):
    __tablename__ = "step_up_verification_grants"
    __table_args__ = (UniqueConstraint("user_id", "device_key", name="uq_step_up_grant"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(128), index=True)
    device_key: Mapped[str] = mapped_column(String(256))
    provider: Mapped[str] = mapped_column(String(64))
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    hostname: Mapped[str | None] = mapped_column(String(256), nullable=True)


class AmlBlocklistEntry(Base):
    __tablename__ = "aml_blocklist_entries"
    __table_args__ = (UniqueConstraint("entry_type", "value_normalized", name="uq_aml_blocklist_entry"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entry_type: Mapped[str] = mapped_column(String(32), index=True)
    value_normalized: Mapped[str] = mapped_column(String(256), index=True)
    source: Mapped[str] = mapped_column(String(32))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class RiskAuditLog(Base):
    __tablename__ = "risk_audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(String(128), index=True)
    event_type: Mapped[str] = mapped_column(String(64))
    decision: Mapped[str] = mapped_column(String(32))
    final_score: Mapped[int] = mapped_column(Integer)
    risk_level: Mapped[str] = mapped_column(String(32))
    signals: Mapped[str] = mapped_column(Text)
    full_payload: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
