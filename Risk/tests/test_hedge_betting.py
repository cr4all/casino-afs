from app.engines import hedge_betting
from app.infrastructure.hedge_betting import init_hedge_betting_store
from tests.factories import build_event


def _live_bet(
    *,
    event_id: str,
    selection: str,
    amount: float,
    round_id: str = "round-1",
    table_id: str = "table-a",
):
    return build_event(
        event_type="wallet.bet",
        event_id=event_id,
        user={"user_id": "washer-1"},
        context={},
        transaction={"amount": amount},
        metadata={
            "channel": "api",
            "game": {
                "round_id": round_id,
                "table_id": table_id,
                "game_type": "baccarat",
                "selection": selection,
            },
        },
    )


def test_opposite_side_bets_same_round_detected():
    init_hedge_betting_store(redis_enabled=False, redis_client=None)

    score1, signals1 = hedge_betting.evaluate(_live_bet(event_id="b1", selection="banker", amount=1000))
    assert score1 == 0
    assert signals1 == []

    score2, signals2 = hedge_betting.evaluate(_live_bet(event_id="b2", selection="player", amount=1000))
    assert score2 >= 50
    assert "opposite_side_bets_same_round" in signals2


def test_amount_mismatch_not_flagged_as_hedge():
    init_hedge_betting_store(redis_enabled=False, redis_client=None)

    hedge_betting.evaluate(_live_bet(event_id="m1", selection="banker", amount=1000))
    score, signals = hedge_betting.evaluate(_live_bet(event_id="m2", selection="player", amount=500))

    assert "opposite_side_bets_same_round" not in signals
    assert score == 0


def test_repeated_hedged_rounds_tier():
    init_hedge_betting_store(redis_enabled=False, redis_client=None)

    for index in range(3):
        round_id = f"round-repeat-{index}"
        hedge_betting.evaluate(_live_bet(event_id=f"rb-{index}", selection="banker", amount=100, round_id=round_id))
        score, signals = hedge_betting.evaluate(
            _live_bet(event_id=f"rp-{index}", selection="player", amount=100, round_id=round_id)
        )

    assert "repeated_hedged_rounds" in signals
    assert score >= 30


def test_missing_game_metadata_skips():
    init_hedge_betting_store(redis_enabled=False, redis_client=None)

    event = build_event(
        event_type="wallet.bet",
        user={"user_id": "u1"},
        context={},
        transaction={"amount": 100},
        metadata={"channel": "api"},
    )
    score, signals = hedge_betting.evaluate(event)
    assert score == 0
    assert signals == []
