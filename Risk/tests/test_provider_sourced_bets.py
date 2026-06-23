from app.engines import device, fingerprint, gaming, identity, ip, transaction, velocity
from app.services.evaluator import RiskEvaluator
from tests.factories import build_event


def test_provider_sourced_bet_skips_session_context_engines():
    event = build_event(
        event_type="wallet.bet",
        user={"user_id": "u1", "email": None, "phone": None, "name": None},
        context={
            "ip": None,
            "user_agent": None,
            "country": None,
            "fingerprint": None,
        },
        metadata={"channel": "api"},
        transaction={"amount": 50, "currency": "EUR"},
    )

    assert ip.evaluate(event) == (0, [])
    assert identity.evaluate(event) == (0, [])
    assert device.evaluate(event) == (0, [])
    assert fingerprint.evaluate(event) == (0, [])
    assert gaming.evaluate(event) == (0, [])


def test_provider_sourced_bet_still_scores_velocity_only(evaluator: RiskEvaluator):
    event = build_event(
        event_type="game.bet",
        user={"user_id": "u1", "email": None, "phone": None, "name": None},
        context={"ip": None, "user_agent": None, "country": None, "fingerprint": None},
        metadata={"channel": "api"},
        transaction={"amount": 750},
    )

    tx_score, tx_signals = transaction.evaluate(event)
    assert tx_score == 0
    assert tx_signals == []

    result = evaluator.evaluate(event, "sync")
    assert result.engines["transaction"].score == 0
    assert result.engines["ip"].score == 0
    assert result.engines["identity"].score == 0


def test_provider_sourced_bet_accepts_missing_currency():
    event = build_event(
        event_type="wallet.bet",
        user={"user_id": "u1"},
        context={},
        transaction={"amount": 25},
    )
    assert event.transaction is not None
    assert event.transaction.currency is None
    assert transaction.evaluate(event) == (0, [])
