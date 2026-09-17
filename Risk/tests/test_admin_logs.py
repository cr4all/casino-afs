import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def admin_client():
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


def test_admin_list_logs(admin_client):
    headers = {"Authorization": "Bearer test-admin-key"}
    response = admin_client.get("/api/admin/logs", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert "total" in body
    assert "entries" in body


def test_admin_list_logs_filter_channel(admin_client):
    headers = {"Authorization": "Bearer test-admin-key"}
    response = admin_client.get("/api/admin/logs?channel=sync", headers=headers)
    assert response.status_code == 200


def test_admin_list_logs_includes_decision(admin_client):
    import json
    from datetime import datetime, timezone

    from shared.db.session import get_session_factory
    from shared.db.models import EvaluateRequestLog

    response_payload = {
        "event_id": "log_decision_test",
        "user_id": "player_1",
        "event_type": "player.login",
        "decision": "challenge",
        "final_score": 55,
        "risk_level": "medium",
        "engines": {},
        "latency_ms": 10,
        "source": "sync",
    }

    with get_session_factory()() as session:
        session.add(
            EvaluateRequestLog(
                logged_at=datetime.now(timezone.utc),
                channel="sync",
                status="scored",
                summary="test",
                event_id="log_decision_test",
                event_type="player.login",
                request_json="{}",
                response_json=json.dumps(response_payload),
            )
        )
        session.commit()

    headers = {"Authorization": "Bearer test-admin-key"}
    result = admin_client.get("/api/admin/logs?event_id=log_decision_test", headers=headers).json()
    assert result["total"] >= 1
    entry = result["entries"][0]
    assert entry["decision"] == "challenge"
    assert entry["risk_level"] == "medium"
    assert entry["final_score"] == 55


def test_admin_list_logs_critical_decision(admin_client):
    import json
    from datetime import datetime, timezone

    from shared.db.session import get_session_factory
    from shared.db.models import EvaluateRequestLog

    response_payload = {
        "event_id": "log_critical_test",
        "decision": "block",
        "risk_level": "critical",
    }

    with get_session_factory()() as session:
        session.add(
            EvaluateRequestLog(
                logged_at=datetime.now(timezone.utc),
                channel="sync",
                status="scored",
                summary="test",
                event_id="log_critical_test",
                event_type="payment.withdraw",
                request_json="{}",
                response_json=json.dumps(response_payload),
            )
        )
        session.commit()

    headers = {"Authorization": "Bearer test-admin-key"}
    result = admin_client.get("/api/admin/logs?event_id=log_critical_test", headers=headers).json()
    entry = result["entries"][0]
    assert entry["decision"] == "block"
    assert entry["risk_level"] == "critical"


def test_admin_log_detail_not_found(admin_client):
    headers = {"Authorization": "Bearer test-admin-key"}
    response = admin_client.get("/api/admin/logs/999999", headers=headers)
    assert response.status_code == 404
