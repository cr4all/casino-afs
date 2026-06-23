import json

import pytest

from app.messaging.event_parser import parse_canonical_event
from tests.factories import build_event


def test_parse_canonical_event_from_direct_payload():
    event = build_event(event_type="player.login", event_id="evt_1")
    parsed = parse_canonical_event(
        json.dumps(event.model_dump(mode="json")).encode(),
        "player.login",
    )
    assert parsed is not None
    assert parsed.event_type.value == "player.login"


def test_parse_platform_envelope_payment_deposit():
    body = {
        "event_id": "550e8400-e29b-41d4-a716-446655440002",
        "event_type": "payment.deposit",
        "occurred_at": "2026-06-21T11:00:00+00:00",
        "version": "1.0",
        "data": {
            "player_id": 123,
            "amount": "500.0000",
            "deposit_id": 45,
            "ledger_id": 800,
            "currency": "USD",
        },
    }
    parsed = parse_canonical_event(json.dumps(body).encode(), "payment.deposit")
    assert parsed is not None
    assert parsed.event_type.value == "payment.deposit"
    assert parsed.user.user_id == "123"
    assert parsed.transaction.amount == 500.0
    assert parsed.transaction.currency == "USD"


def test_parse_platform_envelope_wallet_bet():
    body = {
        "event_id": "550e8400-e29b-41d4-a716-446655440001",
        "event_type": "wallet.bet",
        "occurred_at": "2026-06-21T10:30:00+00:00",
        "version": "1.0",
        "data": {
            "player_id": 456,
            "amount": "100.0000",
            "ledger_id": 789,
            "reference_type": "game_round",
            "reference_id": "round_abc123",
            "funding_source": "cash",
        },
    }
    parsed = parse_canonical_event(json.dumps(body).encode(), "wallet.bet")
    assert parsed is not None
    assert parsed.event_type.value == "wallet.bet"
    assert parsed.transaction.amount == 100.0


def test_parse_skips_non_scored_platform_event():
    body = {
        "event_id": "550e8400-e29b-41d4-a716-446655440099",
        "event_type": "notification.send",
        "occurred_at": "2026-06-21T12:00:00+00:00",
        "version": "1.0",
        "data": {"channel": "email", "template": "deposit_confirmed"},
    }
    assert parse_canonical_event(json.dumps(body).encode(), "notification.send") is None


def test_parse_legacy_alias_signup():
    event = build_event(event_type="player.signup", event_id="evt_legacy")
    parsed = parse_canonical_event(json.dumps(event.model_dump(mode="json")).encode())
    assert parsed is not None
    assert parsed.event_type.value == "player.signup"


def test_parse_unwraps_payload_envelope():
    event = build_event(event_type="player.signup", event_id="evt_3")
    body = {"payload": event.model_dump(mode="json")}
    parsed = parse_canonical_event(json.dumps(body).encode(), "player.signup")
    assert parsed is not None
    assert parsed.event_type.value == "player.signup"


def test_parse_rejects_invalid_scored_event():
    with pytest.raises(ValueError):
        parse_canonical_event(b'{"event_type":"player.login"}', "player.login")
