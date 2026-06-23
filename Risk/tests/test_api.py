import json

import pytest
from fastapi.testclient import TestClient

from tests.factories import build_event


@pytest.fixture
def client():
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["rabbitmq_consumer_enabled"] is False


def test_evaluate_endpoint_good_signup(client):
    payload = build_event(event_type="player.signup", event_id="api_signup_good").model_dump(mode="json")
    response = client.post("/evaluate", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["decision"] == "allow"
    assert body["event_id"] == "api_signup_good"
    assert body["source"] == "sync"
    assert "engines" in body


def test_evaluate_endpoint_bad_signup(client):
    event = build_event(
        event_id="api_signup_bad",
        user={"user_id": "u1", "email": "bad@mailinator.com", "phone": None, "name": "test"},
    )
    response = client.post("/evaluate", json=event.model_dump(mode="json"))
    assert response.status_code == 200
    assert response.json()["decision"] == "block"



def test_evaluate_rejects_invalid_payload(client):
    response = client.post("/evaluate", json={"event_id": "broken"})
    assert response.status_code == 422


def test_evaluate_writes_request_and_response_to_database(client):
    from app.runtime_config import get_runtime_config_store
    from app.infrastructure.evaluate_request_logger import init_evaluate_request_logger
    from shared.db.models import EvaluateRequestLog
    from shared.db.session import get_session_factory

    store = get_runtime_config_store()
    runtime = store.get()
    runtime.logging.sync_enabled = True
    store.update(runtime, updated_by="test")
    init_evaluate_request_logger(get_session_factory())

    payload = build_event(event_type="player.signup", event_id="db_log_signup").model_dump(mode="json")
    response = client.post("/evaluate", json=payload)
    assert response.status_code == 200

    with get_session_factory()() as session:
        row = session.query(EvaluateRequestLog).filter_by(event_id="db_log_signup").one()
        assert row.channel == "sync"
        assert row.status == "scored"
        assert row.endpoint == "/evaluate"
        assert "SYNC SCORED" in row.summary
        assert '"decision": "allow"' in row.response_json


def test_event_schema_endpoint(client):
    response = client.get("/integration/event-schema")
    assert response.status_code == 200
    body = response.json()
    assert body["request"]["name"] == "CanonicalEvent"
    assert "player.signup" in body["event_types"]
    assert "transaction_required_for" in body["field_requirements"]


def test_schema_files_served(client):
    response = client.get("/schemas/canonical-event.schema.json")
    assert response.status_code == 200
    assert response.json()["title"] == "CanonicalEvent"
