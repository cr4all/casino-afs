from app.engines import gaming, transaction
from app.scoring.decision import determine_decision
from app.models import EngineResult
from tests.factories import build_event


def test_gaming_sanctioned_country_signup_blocks():
    event = build_event(
        event_type="player.signup",
        context={"ip": "203.0.113.1", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "IR"},
    )
    score, signals = gaming.evaluate(event)
    assert score >= 90
    assert "sanctioned_country" in signals


def test_gaming_unlicensed_jurisdiction_deposit():
    event = build_event(
        event_type="payment.deposit",
        context={"ip": "203.0.113.1", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "BR"},
        transaction={"amount": 100, "currency": "EUR"},
    )
    score, signals = gaming.evaluate(event)
    assert "unlicensed_jurisdiction" in signals
    assert "deposit_from_unlicensed_market" in signals


def test_gaming_vpn_withdrawal(mock_ip_intelligence):
    from app.infrastructure.ip_intelligence import IpIntelResult

    mock_ip_intelligence._result_by_ip["185.220.101.2"] = IpIntelResult(
        ip="185.220.101.2",
        is_vpn=True,
        provider="mock",
    )
    event = build_event(
        event_type="payment.withdraw",
        context={"ip": "185.220.101.2", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "DE"},
        transaction={"amount": 500, "currency": "EUR"},
    )
    score, signals = gaming.evaluate(event)
    assert "vpn_withdrawal_attempt" in signals


def test_gaming_bonus_abuse_referrer():
    event = build_event(
        event_type="player.signup",
        metadata={"channel": "web", "session_id": "s1", "referrer": "free-spins-promo-site.com"},
    )
    score, signals = gaming.evaluate(event)
    assert "bonus_abuse_referrer" in signals


def test_transaction_micro_deposit_bonus_farming():
    event = build_event(
        event_type="payment.deposit",
        transaction={"amount": 5, "currency": "EUR"},
    )
    score, signals = transaction.evaluate(event)
    assert "micro_deposit_bonus_farming" in signals


def test_transaction_structuring_deposit():
    event = build_event(
        event_type="payment.deposit",
        transaction={"amount": 2800, "currency": "EUR"},
    )
    score, signals = transaction.evaluate(event)
    assert "structuring_threshold_deposit" in signals


def test_transaction_high_stake_bet_skipped_for_provider_sourced_event():
    event = build_event(
        event_type="wallet.bet",
        transaction={"amount": 750, "currency": "EUR"},
    )
    score, signals = transaction.evaluate(event)
    assert score == 0
    assert signals == []


def test_transaction_high_stake_deposit():
    event = build_event(
        event_type="payment.deposit",
        transaction={"amount": 12000, "currency": "EUR"},
    )
    score, signals = transaction.evaluate(event)
    assert "large_deposit_aml_review" in signals


def test_decision_blocks_sanctioned_signup():
    results = {
        "gaming": EngineResult(engine="gaming", score=90, signals=["sanctioned_country"]),
    }
    decision = determine_decision(90, "critical", build_event(event_type="player.signup").event_type, results)
    assert decision == "block"


def test_decision_blocks_vpn_withdrawal():
    results = {
        "gaming": EngineResult(engine="gaming", score=70, signals=["vpn_withdrawal_attempt"]),
    }
    decision = determine_decision(70, "high", build_event(event_type="payment.withdraw").event_type, results)
    assert decision == "block"


def test_evaluator_sanctioned_deposit_blocks(evaluator):
    event = build_event(
        event_type="payment.deposit",
        context={"ip": "203.0.113.1", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "IR"},
        transaction={"amount": 100, "currency": "EUR"},
    )
    result = evaluator.evaluate(event, "sync")
    assert result.decision == "block"
    assert "sanctioned_country" in [s for e in result.engines.values() for s in e.signals]
