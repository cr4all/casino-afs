import json
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

import pytest
from fastapi.testclient import TestClient

from shared.db.models import EvaluateRequestLog, RiskAuditLog


@pytest.fixture
def admin_client():
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


def test_admin_dashboard_metrics_empty(admin_client):
    headers = {"Authorization": "Bearer test-admin-key"}
    response = admin_client.get("/api/admin/dashboard/metrics?hours=1", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert "betting" in body
    assert body["betting"]["total_bets"] == 0
    assert body["overview"]["logging_hint"] is True


def test_admin_dashboard_metrics_with_bet_log(admin_client):
    from shared.db.session import get_session_factory

    now = datetime.now(timezone.utc)
    request = {
        "event_id": "dash_bet_1",
        "event_type": "wallet.bet",
        "user": {"user_id": "player_42"},
        "transaction": {"amount": 100.0},
    }
    response = {
        "event_id": "dash_bet_1",
        "user_id": "player_42",
        "event_type": "wallet.bet",
        "decision": "allow",
        "final_score": 10,
        "risk_level": "low",
        "latency_ms": 12,
        "engines": {},
    }

    with get_session_factory()() as session:
        session.add(
            EvaluateRequestLog(
                logged_at=now,
                channel="sync",
                status="scored",
                summary="test",
                event_id="dash_bet_1",
                event_type="wallet.bet",
                request_json=json.dumps(request),
                response_json=json.dumps(response),
            )
        )
        session.commit()

    headers = {"Authorization": "Bearer test-admin-key"}
    result = admin_client.get("/api/admin/dashboard/metrics?hours=1", headers=headers).json()
    assert result["betting"]["total_bets"] == 1
    assert result["betting"]["total_volume"] == 100.0
    assert result["betting"]["active_bettors"] == 1


def test_admin_dashboard_metrics_block_action(admin_client):
    from shared.db.session import get_session_factory

    now = datetime.now(timezone.utc)
    with get_session_factory()() as session:
        session.add(
            RiskAuditLog(
                event_id="dash_block_1",
                user_id="bad_actor",
                event_type="player.signup",
                decision="block",
                final_score=95,
                risk_level="critical",
                signals=json.dumps(["disposable_email"]),
                full_payload="{}",
                created_at=now,
            )
        )
        session.commit()

    headers = {"Authorization": "Bearer test-admin-key"}
    result = admin_client.get("/api/admin/dashboard/metrics?hours=1", headers=headers).json()
    assert result["decisions"]["blocks"] == 1
    assert len(result["recent_actions"]) == 1
    assert result["recent_actions"][0]["decision"] == "block"


def test_admin_dashboard_alerts_block(admin_client):
    from shared.db.session import get_session_factory

    now = datetime.now(timezone.utc)
    with get_session_factory()() as session:
        session.add(
            RiskAuditLog(
                event_id="dash_alert_block_1",
                user_id="bad_actor",
                event_type="player.signup",
                decision="block",
                final_score=95,
                risk_level="critical",
                signals=json.dumps(["disposable_email"]),
                full_payload="{}",
                created_at=now,
            )
        )
        session.commit()

    since = quote((now.replace(microsecond=0) - timedelta(seconds=1)).isoformat())
    headers = {"Authorization": "Bearer test-admin-key"}
    result = admin_client.get(f"/api/admin/dashboard/alerts?since={since}", headers=headers).json()
    assert result["notifications_enabled"] is True
    assert len(result["alerts"]) == 1
    assert result["alerts"][0]["event_id"] == "dash_alert_block_1"
    assert result["alerts"][0]["kind"] == "both"


def test_admin_dashboard_alerts_respects_since(admin_client):
    from shared.db.session import get_session_factory

    now = datetime.now(timezone.utc)
    with get_session_factory()() as session:
        session.add(
            RiskAuditLog(
                event_id="dash_alert_old",
                user_id="u1",
                event_type="player.login",
                decision="block",
                final_score=90,
                risk_level="high",
                signals="[]",
                full_payload="{}",
                created_at=now,
            )
        )
        session.commit()

    since = quote((now + timedelta(seconds=5)).isoformat())
    headers = {"Authorization": "Bearer test-admin-key"}
    result = admin_client.get(f"/api/admin/dashboard/alerts?since={since}", headers=headers).json()
    assert result["alerts"] == []
