import os

import pytest

from app.infrastructure.velocity_store import init_velocity_store
from app.models import CanonicalEvent
from app.runtime_config import init_runtime_config_store
from tests.factories import build_event

os.environ.setdefault("RABBITMQ_ENABLED", "false")
os.environ.setdefault("RABBITMQ_PUBLISH_RESULTS", "false")
os.environ.setdefault("REDIS_ENABLED", "false")
os.environ.setdefault("EVALUATE_FILE_LOG_ENABLED", "false")
os.environ.setdefault("IP_INTEL_ENABLED", "true")
os.environ.setdefault("AML_BLOCKLIST_BACKGROUND_SYNC", "false")


class MockIpIntelligenceService:
    def __init__(self, result_by_ip: dict | None = None):
        from app.infrastructure.ip_intelligence import IpIntelResult

        self._result_by_ip = result_by_ip or {}

    def lookup(self, ip: str):
        from app.infrastructure.ip_intelligence import IpIntelResult

        if ip in self._result_by_ip:
            return self._result_by_ip[ip]
        return IpIntelResult(ip=ip, provider="mock")


@pytest.fixture(autouse=True)
def mock_ip_intelligence(monkeypatch):
    from app.infrastructure import ip_intelligence as ip_intel_module

    service = MockIpIntelligenceService()
    monkeypatch.setattr(ip_intel_module, "_service", service)
    yield service
    ip_intel_module._service = None


@pytest.fixture(autouse=True)
def setup_trusted_devices_database(tmp_path, monkeypatch):
    from shared.db import session as db_session
    from shared.db.session import get_session_factory, init_database
    import app.services.trusted_devices as trusted_devices_module
    from app.settings import settings

    db_url = f"sqlite:///{tmp_path / 'test.db'}"
    db_session._engine = None
    db_session._SessionLocal = None

    monkeypatch.setattr(settings, "database_url", db_url)
    monkeypatch.setattr(settings, "admin_api_key", "test-admin-key")
    monkeypatch.setattr(settings, "rabbitmq_enabled", False)
    monkeypatch.setattr(settings, "rabbitmq_publish_results", False)
    monkeypatch.setattr(settings, "redis_enabled", False)

    init_database(db_url)
    init_runtime_config_store(get_session_factory(), settings)
    from app.infrastructure.evaluate_request_logger import init_evaluate_request_logger

    init_evaluate_request_logger(get_session_factory())
    trusted_devices_module.init_trusted_device_service(get_session_factory())
    import app.services.step_up_verification as step_up_module

    step_up_module.init_step_up_verification_service(get_session_factory())
    from app.infrastructure.aml_blocklist import init_aml_blocklist_service

    init_aml_blocklist_service(get_session_factory())
    yield
    trusted_devices_module._service = None
    step_up_module._service = None
    import app.infrastructure.aml_blocklist as aml_blocklist_module

    aml_blocklist_module._service = None
    import app.runtime_config.store as runtime_config_store

    runtime_config_store._store = None
    db_session._engine = None
    db_session._SessionLocal = None


@pytest.fixture(autouse=True)
def reset_velocity_store():
    init_velocity_store(
        redis_enabled=False,
        redis_client=None,
        ip_ttl=3600,
        domain_ttl=86400,
    )
    yield
    init_velocity_store(
        redis_enabled=False,
        redis_client=None,
        ip_ttl=3600,
        domain_ttl=86400,
    )


@pytest.fixture
def good_signup_event() -> CanonicalEvent:
    return build_event(event_type="player.signup", event_id="signup_good")


@pytest.fixture
def good_login_event() -> CanonicalEvent:
    return build_event(event_type="player.login", event_id="login_good")


@pytest.fixture
def evaluator():
    from app.services.evaluator import RiskEvaluator
    from app.settings import Settings

    settings = Settings(
        rabbitmq_enabled=False,
        rabbitmq_publish_results=False,
        redis_enabled=False,
    )
    return RiskEvaluator(settings)
