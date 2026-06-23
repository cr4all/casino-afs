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


def test_admin_log_detail_not_found(admin_client):
    headers = {"Authorization": "Bearer test-admin-key"}
    response = admin_client.get("/api/admin/logs/999999", headers=headers)
    assert response.status_code == 404
