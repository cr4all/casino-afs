"""
Casino platform event contract (AsyncAPI).

Source of truth (check before changing event names):
https://github.com/cr4all/casino-api-contract/blob/main/asyncapi/platform-events-v1.yaml
"""

from __future__ import annotations

CONTRACT_URL = (
    "https://github.com/cr4all/casino-api-contract/blob/main/asyncapi/platform-events-v1.yaml"
)
CONTRACT_RAW_URL = (
    "https://raw.githubusercontent.com/cr4all/casino-api-contract/main/asyncapi/platform-events-v1.yaml"
)
CONTRACT_VERSION = "1.2.0"

# All event_type values published on exchange casino.events (routing key = event_type).
PLATFORM_EVENT_TYPES: frozenset[str] = frozenset(
    {
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
    }
)

# Auth / risk-gate events for POST /evaluate (not in platform contract yet).
AUTH_EVENT_TYPES: frozenset[str] = frozenset(
    {
        "player.signup",
        "player.signup.failed",
        "player.login",
        "player.login.failed",
    }
)

# Platform events AFS scores (others are acked and skipped).
SCORED_PLATFORM_EVENT_TYPES: frozenset[str] = frozenset(
    {
        "wallet.bet",
        "wallet.win",
        "game.bet",
        "payment.deposit",
        "payment.withdraw",
        "bonus.created",
    }
)

SKIPPED_PLATFORM_EVENT_TYPES: frozenset[str] = (
    PLATFORM_EVENT_TYPES - SCORED_PLATFORM_EVENT_TYPES
)

# Every event_type AFS will score (platform subset + auth gates).
SCORED_EVENT_TYPES: frozenset[str] = SCORED_PLATFORM_EVENT_TYPES | AUTH_EVENT_TYPES

# Backward-compatible aliases for sync /evaluate until backends migrate.
LEGACY_EVENT_TYPE_ALIASES: dict[str, str] = {
    "signup": "player.signup",
    "signup_failed": "player.signup.failed",
    "login": "player.login",
    "login_failed": "player.login.failed",
    "deposit": "payment.deposit",
    "withdrawal": "payment.withdraw",
    "bet": "wallet.bet",
}
