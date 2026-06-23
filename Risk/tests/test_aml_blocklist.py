from datetime import datetime, timezone

import pytest

from app.engines import aml_blocklist
from app.infrastructure.aml_blocklist import get_aml_blocklist_service, init_aml_blocklist_service
from app.runtime_config import get_runtime_config_store
from app.runtime_config.schema import AmlBlocklistConfig
from app.scoring.decision import determine_decision
from app.models import EngineResult
from shared.db.models import AmlBlocklistEntry
from shared.db.session import get_session_factory
from tests.factories import build_event


@pytest.fixture
def admin_client():
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


def test_manual_bank_account_blocked():
    store = get_runtime_config_store()
    config = store.get()
    config.aml.blocklist = AmlBlocklistConfig(
        enabled=True,
        bank_enabled=True,
        manual_bank_accounts=["DE89370400440532013000"],
    )
    store.update(config, updated_by="test")

    score, signals = aml_blocklist.evaluate(
        build_event(
            event_type="payment.withdraw",
            transaction={
                "amount": 100.0,
                "currency": "EUR",
                "payment_method_type": "bank",
                "payment_method_key": "de89 3704 0044 0532 0130 00",
            },
        ),
    )
    assert "blocklisted_payout_address" in signals
    assert score >= 90


def test_manual_ewallet_blocked():
    store = get_runtime_config_store()
    config = store.get()
    config.aml.blocklist = AmlBlocklistConfig(
        enabled=True,
        ewallet_enabled=True,
        manual_ewallet_accounts=["user@skrill.com"],
    )
    store.update(config, updated_by="test")

    score, signals = aml_blocklist.evaluate(
        build_event(
            event_type="payment.withdraw",
            transaction={
                "amount": 100.0,
                "currency": "EUR",
                "payment_method_type": "ewallet",
                "payment_method_key": "User@Skrill.com",
            },
        ),
    )
    assert "blocklisted_payout_address" in signals


def test_manual_card_blocked():
    store = get_runtime_config_store()
    config = store.get()
    config.aml.blocklist = AmlBlocklistConfig(
        enabled=True,
        card_enabled=True,
        manual_card_accounts=["card_token_abc123"],
    )
    store.update(config, updated_by="test")

    score, signals = aml_blocklist.evaluate(
        build_event(
            event_type="payment.withdraw",
            transaction={
                "amount": 100.0,
                "currency": "EUR",
                "payment_method_type": "card",
                "payment_method_key": "CARD_TOKEN_ABC123",
            },
        ),
    )
    assert "blocklisted_payout_address" in signals


def test_bank_blocklist_respects_disabled_toggle():
    store = get_runtime_config_store()
    config = store.get()
    config.aml.blocklist = AmlBlocklistConfig(
        enabled=True,
        bank_enabled=False,
        manual_bank_accounts=["DE89370400440532013000"],
    )
    store.update(config, updated_by="test")

    score, signals = aml_blocklist.evaluate(
        build_event(
            event_type="payment.withdraw",
            transaction={
                "amount": 100.0,
                "currency": "EUR",
                "payment_method_type": "bank",
                "payment_method_key": "DE89370400440532013000",
            },
        ),
    )
    assert signals == []


def test_manual_crypto_wallet_blocked():
    store = get_runtime_config_store()
    config = store.get()
    config.aml.blocklist = AmlBlocklistConfig(
        enabled=True,
        crypto_enabled=True,
        manual_crypto_wallets=["0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"],
    )
    store.update(config, updated_by="test")

    score, signals = aml_blocklist.evaluate(
        build_event(
            event_type="payment.withdraw",
            transaction={
                "amount": 100.0,
                "currency": "EUR",
                "payment_method_type": "crypto",
                "payment_method_key": "0xDeAdBeEfdeadbeefdeadbeefdeadbeefdeadbeef",
            },
        ),
    )
    assert "blocklisted_payout_address" in signals
    assert score >= 90


def test_ofac_crypto_wallet_in_db():
    service = get_aml_blocklist_service()
    session = get_session_factory()()
    try:
        session.add(
            AmlBlocklistEntry(
                entry_type="crypto_wallet",
                value_normalized="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                source="ofac",
                updated_at=datetime.now(timezone.utc),
            )
        )
        session.commit()
    finally:
        session.close()

    score, signals = aml_blocklist.evaluate(
        build_event(
            event_type="payment.withdraw",
            transaction={
                "amount": 50.0,
                "currency": "EUR",
                "payment_method_type": "btc",
                "payment_method_key": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            },
        ),
    )
    assert "ofac_sanctioned_wallet" in signals


def test_blocklisted_country_on_withdrawal():
    store = get_runtime_config_store()
    config = store.get()
    config.aml.blocklist = AmlBlocklistConfig(
        enabled=True,
        country_enabled=True,
        manual_countries=["KP"],
    )
    store.update(config, updated_by="test")

    score, signals = aml_blocklist.evaluate(
        build_event(
            event_type="payment.withdraw",
            context={"ip": "203.0.113.10", "country": "KP", "fingerprint": "a1b2c3d4e5f6789012345678abcdef01"},
            transaction={"amount": 100.0, "currency": "EUR"},
        ),
    )
    assert "blocklisted_country" in signals


def test_blocklist_disabled():
    store = get_runtime_config_store()
    config = store.get()
    config.aml.blocklist = AmlBlocklistConfig(
        enabled=False,
        manual_crypto_wallets=["0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"],
        manual_countries=["KP"],
    )
    store.update(config, updated_by="test")

    score, signals = aml_blocklist.evaluate(
        build_event(
            event_type="payment.withdraw",
            context={"ip": "203.0.113.10", "country": "KP", "fingerprint": "a1b2c3d4e5f6789012345678abcdef01"},
            transaction={
                "amount": 100.0,
                "currency": "EUR",
                "payment_method_type": "crypto",
                "payment_method_key": "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
            },
        ),
    )
    assert signals == []
    assert score == 0


def test_decision_blocks_ofac_wallet():
    results = {
        "aml_blocklist": EngineResult(
            engine="aml_blocklist",
            score=90,
            signals=["ofac_sanctioned_wallet"],
        ),
    }
    decision = determine_decision(
        90,
        "critical",
        build_event(event_type="payment.withdraw").event_type,
        results,
    )
    assert decision == "block"


def test_admin_blocklist_status(admin_client):
    headers = {"X-Admin-Key": "test-admin-key"}
    response = admin_client.get("/api/admin/blocklist/status", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert "enabled" in body
    assert "crypto_entries_in_db" in body


def test_admin_config_includes_blocklist(admin_client):
    headers = {"X-Admin-Key": "test-admin-key"}
    config = admin_client.get("/api/admin/config", headers=headers).json()
    assert config["aml"]["blocklist"]["enabled"] is True
