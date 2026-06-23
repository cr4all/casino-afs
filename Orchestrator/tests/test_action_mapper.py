import pytest

from app.models import EngineResult, RiskResultMessage
from app.services.action_mapper import map_decision_to_action


def _result(**overrides) -> RiskResultMessage:
    payload = {
        "event_id": "evt_1",
        "user_id": "u1",
        "event_type": "player.login",
        "decision": "allow",
        "final_score": 10,
        "risk_level": "low",
        "engines": {"email": EngineResult(engine="email", score=10, signals=[])},
        "latency_ms": 5,
        "source": "async",
        "scored_at": "2026-06-21T12:00:00Z",
    }
    payload.update(overrides)
    return RiskResultMessage.model_validate(payload)


@pytest.mark.parametrize(
    ("decision", "event_type", "expected_action"),
    [
        ("allow", "player.login", "allow"),
        ("block", "payment.withdraw", "hold_withdrawal"),
        ("block", "player.login.failed", "rate_limit_ip"),
        ("block", "player.signup", "reject_signup"),
        ("challenge", "player.login", "require_mfa"),
        ("challenge", "payment.withdraw", "manual_review_withdrawal"),
    ],
)
def test_map_decision_to_action(decision, event_type, expected_action):
    result = _result(decision=decision, event_type=event_type)
    assert map_decision_to_action(result) == expected_action
