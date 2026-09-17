from __future__ import annotations

from datetime import datetime
from typing import Any

from shared.contracts.platform_events import LEGACY_EVENT_TYPE_ALIASES


def is_platform_envelope(raw: dict[str, Any]) -> bool:
    return (
        isinstance(raw.get("event_id"), str)
        and isinstance(raw.get("event_type"), str)
        and isinstance(raw.get("occurred_at"), str)
        and isinstance(raw.get("data"), dict)
    )


def _parse_decimal_amount(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        return float(value)
    return None


def platform_envelope_to_canonical(raw: dict[str, Any]) -> dict[str, Any]:
    """Map PlatformEventEnvelope (casino-api-contract) → AFS CanonicalEvent dict."""
    data = raw.get("data") or {}
    metadata = data.get("metadata") if isinstance(data.get("metadata"), dict) else {}

    player_id = data.get("player_id")
    amount = _parse_decimal_amount(data.get("amount"))

    context: dict[str, Any] = {}
    if metadata.get("ip"):
        context["ip"] = str(metadata["ip"])
    if metadata.get("platform"):
        context["platform"] = str(metadata["platform"])

    canonical_metadata: dict[str, Any] = {
        "channel": "api",
        "platform_event_version": raw.get("version"),
        "reference_type": data.get("reference_type"),
        "reference_id": data.get("reference_id"),
        "funding_source": data.get("funding_source"),
    }

    game_meta = metadata.get("game") if isinstance(metadata.get("game"), dict) else data.get("game")
    if isinstance(game_meta, dict):
        canonical_metadata["game"] = {
            "round_id": game_meta.get("round_id") or data.get("round_id"),
            "table_id": game_meta.get("table_id") or data.get("table_id"),
            "game_type": game_meta.get("game_type") or data.get("game_type"),
            "selection": game_meta.get("selection") or game_meta.get("bet_side") or data.get("selection"),
        }

    canonical: dict[str, Any] = {
        "event_id": raw["event_id"],
        "event_type": raw["event_type"],
        "timestamp": raw.get("occurred_at") or raw.get("timestamp"),
        "user": {
            "user_id": str(player_id) if player_id is not None else "",
            "email": None,
            "phone": None,
            "name": None,
        },
        "context": context,
        "metadata": canonical_metadata,
    }

    if amount is not None or data.get("currency"):
        transaction: dict[str, Any] = {
            "amount": amount,
            "currency": data.get("currency"),
        }
        method_type = (
            data.get("payment_method_type")
            or data.get("payment_method")
            or data.get("payout_method")
        )
        method_key = (
            data.get("payment_method_key")
            or data.get("payout_key")
            or data.get("iban")
            or data.get("wallet_address")
        )
        if method_type is not None:
            transaction["payment_method_type"] = str(method_type)
        if method_key is not None:
            transaction["payment_method_key"] = str(method_key)
        if method_key and not method_type:
            if data.get("iban") or data.get("wallet_address"):
                transaction["payment_method_type"] = "crypto" if data.get("wallet_address") else "bank"
        canonical["transaction"] = transaction

    return canonical


def normalize_event_type(event_type: str) -> str:
    key = event_type.strip().lower()
    return LEGACY_EVENT_TYPE_ALIASES.get(key, event_type)
