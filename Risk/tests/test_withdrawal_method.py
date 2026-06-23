from app.engines import velocity
from app.infrastructure.withdrawal_method import withdrawal_method_storage_key
from app.runtime_config import get_runtime_config, get_runtime_config_store
from app.runtime_config.schema import RuntimeConfigData, WithdrawalMethodConfig
from tests.factories import build_event


def test_withdrawal_method_storage_key_normalizes_bank():
    event = build_event(
        event_type="payment.withdraw",
        transaction={
            "amount": 100.0,
            "currency": "EUR",
            "payment_method_type": "bank_transfer",
            "payment_method_key": "de89 3704 0044 0532 0130 00",
        },
    )
    key1 = withdrawal_method_storage_key(event.transaction)
    key2 = withdrawal_method_storage_key(
        build_event(
            event_type="payment.withdraw",
            transaction={
                "amount": 50,
                "currency": "EUR",
                "payment_method_type": "bank",
                "payment_method_key": "DE89370400440532013000",
            },
        ).transaction,
    )
    assert key1 == key2
    assert key1.startswith("bank:")


def test_shared_withdrawal_method_disabled():
    store = get_runtime_config_store()
    config = store.get()
    config.withdrawal_method = WithdrawalMethodConfig(enabled=False)
    store.update(config, updated_by="test")

    for index in range(3):
        velocity.evaluate(
            build_event(
                event_id=f"wm_off_{index}",
                event_type="payment.withdraw",
                user={"user_id": f"u{index}", "email": f"u{index}@test.com", "phone": None, "name": "U"},
                transaction={
                    "amount": 100.0,
                    "currency": "EUR",
                    "payment_method_type": "bank",
                    "payment_method_key": "DE89370400440532013000",
                },
            ),
        )

    score, signals = velocity.evaluate(
        build_event(
            event_id="wm_off_final",
            event_type="payment.withdraw",
            user={"user_id": "u_final", "email": "final@test.com", "phone": None, "name": "U"},
            transaction={
                "amount": 100.0,
                "currency": "EUR",
                "payment_method_type": "bank",
                "payment_method_key": "DE89370400440532013000",
            },
        ),
    )
    assert signals == []
    assert score == 0


def test_shared_withdrawal_method_detects_multiple_users():
    store = get_runtime_config_store()
    config = store.get()
    config.withdrawal_method = WithdrawalMethodConfig(enabled=True)
    store.update(config, updated_by="test")

    shared = {
        "amount": 100.0,
        "currency": "EUR",
        "payment_method_type": "crypto",
        "payment_method_key": "0xabc123def456",
    }

    for index in range(3):
        velocity.evaluate(
            build_event(
                event_id=f"wm_on_{index}",
                event_type="payment.withdraw",
                user={"user_id": f"player_{index}", "email": f"p{index}@test.com", "phone": None, "name": "P"},
                transaction=shared,
            ),
        )

    score, signals = velocity.evaluate(
        build_event(
            event_id="wm_on_final",
            event_type="payment.withdraw",
            user={"user_id": "player_final", "email": "final@test.com", "phone": None, "name": "P"},
            transaction=shared,
        ),
    )
    assert "multi_account_shared_withdrawal_method" in signals
    assert score >= get_runtime_config().withdrawal_method.critical_score


def test_shared_withdrawal_method_missing_key_is_skipped():
    score, signals = velocity.evaluate(
        build_event(
            event_id="wm_no_key",
            event_type="payment.withdraw",
            transaction={"amount": 100.0, "currency": "EUR"},
        ),
    )
    assert "shared_withdrawal_method" not in signals
