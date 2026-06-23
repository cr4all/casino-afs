import pytest
from fastapi.testclient import TestClient

from app.runtime_config import get_runtime_config


@pytest.fixture
def admin_client():
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


def test_admin_status(admin_client):
    response = admin_client.get("/api/admin/status")
    assert response.status_code == 200
    assert response.json()["admin_enabled"] is True


def test_admin_config_requires_key(admin_client):
    response = admin_client.get("/api/admin/config")
    assert response.status_code == 401


def test_admin_config_accepts_bearer_token(admin_client):
    headers = {"Authorization": "Bearer test-admin-key"}
    response = admin_client.get("/api/admin/config", headers=headers)
    assert response.status_code == 200


def test_admin_get_and_update_config(admin_client):
    headers = {"X-Admin-Key": "test-admin-key"}

    response = admin_client.get("/api/admin/config", headers=headers)
    assert response.status_code == 200
    config = response.json()
    assert "velocity_thresholds" in config
    assert "login_ip_high" in config["velocity_thresholds"]
    assert config["aml"]["blocklist"]["enabled"] is True

    config["operator"]["licensed_markets"] = "DE,GB"
    config["decision_thresholds"]["challenge"] = 25

    update = admin_client.put("/api/admin/config", headers=headers, json=config)
    assert update.status_code == 200
    updated = update.json()
    assert updated["operator"]["licensed_markets"] == "DE,GB"
    assert updated["decision_thresholds"]["challenge"] == 25

    runtime = get_runtime_config()
    assert runtime.operator.licensed_markets == "DE,GB"
    assert runtime.decision_thresholds.challenge == 25


def test_admin_config_audit(admin_client):
    headers = {"X-Admin-Key": "test-admin-key"}

    config = admin_client.get("/api/admin/config", headers=headers).json()
    admin_client.put("/api/admin/config", headers=headers, json=config)

    audit = admin_client.get("/api/admin/config/audit", headers=headers)
    assert audit.status_code == 200
    assert len(audit.json()["entries"]) >= 1
