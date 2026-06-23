from app.engines import velocity
from app.runtime_config import get_runtime_config_store
from app.runtime_config.schema import BettingPatternConfig
from tests.factories import build_event


def _bet_event(event_type: str, user_id: str = "u-bet", event_id: str | None = None):
    return build_event(
        event_type=event_type,
        event_id=event_id or f"{event_type}-{user_id}",
        user={"user_id": user_id},
        context={},
        transaction={"amount": 10},
    )


def test_sequential_game_bet_burst():
    user_id = "u-game-burst"
    for index in range(9):
        score, signals = velocity.evaluate(_bet_event("game.bet", user_id, f"gb-{index}"))
        assert "sequential_game_bet_burst" not in signals

    score, signals = velocity.evaluate(_bet_event("game.bet", user_id, "gb-10"))
    assert score >= 25
    assert "sequential_game_bet_burst" in signals


def test_sequential_wallet_bet_burst():
    user_id = "u-wallet-burst"
    for index in range(19):
        velocity.evaluate(_bet_event("wallet.bet", user_id, f"wb-{index}"))

    score, signals = velocity.evaluate(_bet_event("wallet.bet", user_id, "wb-20"))
    assert score >= 20
    assert "sequential_wallet_bet_burst" in signals


def test_sequential_wallet_win_burst():
    user_id = "u-win-burst"
    for index in range(7):
        velocity.evaluate(
            build_event(
                event_type="wallet.win",
                event_id=f"ww-{index}",
                user={"user_id": user_id},
                context={},
                transaction={"amount": 50},
            )
        )

    score, signals = velocity.evaluate(
        build_event(
            event_type="wallet.win",
            event_id="ww-8",
            user={"user_id": user_id},
            context={},
            transaction={"amount": 50},
        )
    )
    assert score >= 25
    assert "sequential_wallet_win_burst" in signals


def test_high_win_rate_in_betting_sequence():
    user_id = "u-win-rate"
    for index in range(5):
        velocity.evaluate(_bet_event("wallet.bet", user_id, f"rate-bet-{index}"))

    score = 0
    signals: list[str] = []
    for index in range(4):
        score, signals = velocity.evaluate(
            build_event(
                event_type="wallet.win",
                event_id=f"rate-win-{index}",
                user={"user_id": user_id},
                context={},
                transaction={"amount": 20},
            )
        )

    assert score >= 40
    assert "high_win_rate_in_betting_sequence" in signals


def test_betting_patterns_can_be_disabled():
    store = get_runtime_config_store()
    config = store.get()
    original = config.betting_patterns.model_copy()
    try:
        config.betting_patterns = BettingPatternConfig(enabled=False)
        store.update(config, updated_by="test")

        score, signals = velocity.evaluate(_bet_event("game.bet", "u-disabled"))
        assert score == 0
        assert signals == []
    finally:
        config.betting_patterns = original
        store.update(config, updated_by="test")


def test_wallet_win_is_provider_sourced(evaluator):
    from app.engines import device, fingerprint, gaming, identity, ip, transaction

    event = build_event(
        event_type="wallet.win",
        user={"user_id": "u-win"},
        context={},
        transaction={"amount": 100},
    )

    assert ip.evaluate(event) == (0, [])
    assert identity.evaluate(event) == (0, [])
    assert device.evaluate(event) == (0, [])
    assert fingerprint.evaluate(event) == (0, [])
    assert gaming.evaluate(event) == (0, [])
    assert transaction.evaluate(event) == (0, [])

    result = evaluator.evaluate(event, "sync")
    assert result.event_type == "wallet.win"
    assert result.engines["velocity"].score >= 0
