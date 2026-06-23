from datetime import datetime, timezone
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

from shared.contracts.platform_events import LEGACY_EVENT_TYPE_ALIASES, SCORED_EVENT_TYPES


class EventType(str, Enum):
    """Event types scored by AFS.

    Platform types match casino-api-contract asyncapi/platform-events-v1.yaml.
    Auth types are used by POST /evaluate until the platform contract adds them.
    """

    WALLET_BET = "wallet.bet"
    WALLET_WIN = "wallet.win"
    GAME_BET = "game.bet"
    PAYMENT_DEPOSIT = "payment.deposit"
    PAYMENT_WITHDRAW = "payment.withdraw"
    BONUS_CREATED = "bonus.created"
    PLAYER_SIGNUP = "player.signup"
    PLAYER_SIGNUP_FAILED = "player.signup.failed"
    PLAYER_LOGIN = "player.login"
    PLAYER_LOGIN_FAILED = "player.login.failed"


# Groupings used by scoring engines and decision logic.
BET_EVENT_TYPES = {EventType.WALLET_BET, EventType.GAME_BET}
GAMING_EVENT_TYPES = {*BET_EVENT_TYPES, EventType.WALLET_WIN}
MONEY_EVENT_TYPES = {
    EventType.PAYMENT_DEPOSIT,
    EventType.PAYMENT_WITHDRAW,
    *BET_EVENT_TYPES,
}
# Events relayed by third-party game/payment providers with minimal player session context.
PROVIDER_SOURCED_EVENT_TYPES = GAMING_EVENT_TYPES
AUTH_FAILURE_EVENT_TYPES = {EventType.PLAYER_LOGIN_FAILED, EventType.PLAYER_SIGNUP_FAILED}
TRUST_REGISTRATION_EVENT_TYPES = {EventType.PLAYER_SIGNUP, EventType.PLAYER_LOGIN}


def is_provider_sourced_event(event_type: EventType) -> bool:
    return event_type in PROVIDER_SOURCED_EVENT_TYPES


class UserData(BaseModel):
    user_id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None


class ContextData(BaseModel):
    ip: Optional[str] = None
    user_agent: Optional[str] = None
    device_id: Optional[str] = None
    country: Optional[str] = None
    fingerprint: Optional[str] = None
    fingerprint_version: Optional[str] = None
    browser_language: Optional[str] = None
    timezone: Optional[str] = None
    platform: Optional[str] = None
    screen_resolution: Optional[str] = None


class TransactionData(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    payment_method_type: Optional[str] = None
    payment_method_key: Optional[str] = None


class StepUpVerificationData(BaseModel):
    provider: Literal["cloudflare_turnstile"]
    verified: bool
    verified_at: datetime
    hostname: Optional[str] = None
    action: Optional[str] = None


class MetadataData(BaseModel):
    channel: Optional[str] = None
    session_id: Optional[str] = None
    referrer: Optional[str] = None
    failure_reason: Optional[str] = None
    platform_event_version: Optional[str] = None
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    funding_source: Optional[str] = None
    step_up_verification: Optional[StepUpVerificationData] = None


class CanonicalEvent(BaseModel):
    event_id: str
    event_type: EventType
    timestamp: datetime
    user: UserData
    context: ContextData
    transaction: Optional[TransactionData] = None
    metadata: Optional[MetadataData] = None

    @field_validator("event_type", mode="before")
    @classmethod
    def normalize_legacy_event_type(cls, value: object) -> object:
        if isinstance(value, str):
            normalized = LEGACY_EVENT_TYPE_ALIASES.get(value.strip().lower(), value)
            return normalized
        return value


Decision = Literal["allow", "challenge", "block"]
RiskLevel = Literal["low", "medium", "high", "critical"]
EvaluationSource = Literal["sync", "async"]


class EngineResult(BaseModel):
    engine: str
    score: int
    signals: list[str] = Field(default_factory=list)


class EvaluateResponse(BaseModel):
    event_id: str
    user_id: str
    event_type: EventType
    decision: Decision
    final_score: int
    risk_level: RiskLevel
    engines: dict[str, EngineResult]
    latency_ms: int
    source: EvaluationSource
    scored_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RiskResultMessage(EvaluateResponse):
    """Published to RabbitMQ for downstream orchestration, audit, and analytics."""

    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def is_scored_event_type(event_type: str) -> bool:
    normalized = LEGACY_EVENT_TYPE_ALIASES.get(event_type.strip().lower(), event_type)
    return normalized in SCORED_EVENT_TYPES
