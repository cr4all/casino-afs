"""
Reference types for casino backend integrators (Python 3.11+).

Event names match casino-api-contract asyncapi/platform-events-v1.yaml
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, TypedDict

PlatformEventType = Literal[
    "wallet.bet",
    "wallet.win",
    "wallet.rollback",
    "game.bet",
    "payment.deposit",
    "payment.withdraw",
    "bonus.created",
    "bonus.completed",
    "affiliate.commission",
    "notification.send",
]

ScoredEventType = Literal[
    "wallet.bet",
    "wallet.win",
    "game.bet",
    "payment.deposit",
    "payment.withdraw",
    "bonus.created",
    "player.signup",
    "player.signup.failed",
    "player.login",
    "player.login.failed",
]

Channel = Literal["web", "mobile", "api"]
Decision = Literal["allow", "challenge", "block"]
RiskLevel = Literal["low", "medium", "high", "critical"]


class UserData(TypedDict):
    user_id: str
    email: str | None
    phone: str | None
    name: str | None


class ContextData(TypedDict, total=False):
    ip: str | None
    user_agent: str | None
    device_id: str | None
    country: str | None
    fingerprint: str | None
    fingerprint_version: str | None
    browser_language: str | None
    timezone: str | None
    platform: str | None
    screen_resolution: str | None


class TransactionData(TypedDict, total=False):
    amount: float | None
    currency: str | None
    payment_method_type: str | None
    payment_method_key: str | None


class StepUpVerificationData(TypedDict, total=False):
    provider: Literal["cloudflare_turnstile"]
    verified: bool
    verified_at: str
    hostname: str | None
    action: str | None


class MetadataData(TypedDict, total=False):
    channel: Channel | None
    session_id: str | None
    referrer: str | None
    failure_reason: str | None
    step_up_verification: StepUpVerificationData | None


class CanonicalEvent(TypedDict):
    event_id: str
    event_type: ScoredEventType
    timestamp: datetime | str
    user: UserData
    context: ContextData
    transaction: TransactionData | None
    metadata: MetadataData | None


class PlatformEventEnvelope(TypedDict):
    event_id: str
    event_type: PlatformEventType
    occurred_at: str
    version: Literal["1.0"]
    data: dict


TRANSACTION_EVENT_TYPES: frozenset[ScoredEventType] = frozenset(
    {"payment.deposit", "payment.withdraw", "wallet.bet", "game.bet", "wallet.win"},
)
