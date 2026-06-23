from fastapi import APIRouter, Depends, Request

from app.infrastructure.evaluate_request_logger import log_evaluate
from app.models import CanonicalEvent, EvaluateResponse, EventType
from app.services.evaluator import RiskEvaluator
from shared.contracts.platform_events import (
    CONTRACT_URL,
    CONTRACT_VERSION,
    PLATFORM_EVENT_TYPES,
    SCORED_EVENT_TYPES,
    SKIPPED_PLATFORM_EVENT_TYPES,
)

router = APIRouter()

_SCHEMA_FILES = {
    "canonical_event": "canonical-event.schema.json",
    "evaluate_response": "evaluate-response.schema.json",
    "risk_action": "risk-action.schema.json",
}


def get_evaluator(request: Request) -> RiskEvaluator:
    return request.app.state.evaluator


@router.get("/health")
def health(request: Request) -> dict:
    from app.runtime_config import get_runtime_config

    settings = request.app.state.settings
    runtime = get_runtime_config()
    return {
        "status": "ok",
        "admin_ui": "/admin",
        "rabbitmq_broker": getattr(request.app.state, "rabbitmq_target", None),
        "rabbitmq_publisher_connected": getattr(request.app.state, "rabbitmq_publisher_connected", False),
        "rabbitmq_consumer_connected": getattr(request.app.state, "rabbitmq_consumer_connected", False),
        "licensed_markets": runtime.operator.licensed_markets,
        "decision_thresholds": runtime.decision_thresholds.model_dump(),
        "rabbitmq_consumer_enabled": runtime.features.rabbitmq_enabled,
        "rabbitmq_events_exchange": runtime.features.rabbitmq_events_exchange,
        "rabbitmq_events_queue": runtime.features.rabbitmq_events_queue,
        "rabbitmq_events_binding_key": runtime.features.rabbitmq_events_binding_key,
        "rabbitmq_publish_results": runtime.features.rabbitmq_publish_results,
        "redis_enabled": runtime.features.redis_enabled,
        "sync_publish_audit": runtime.features.sync_publish_audit,
        "logging": runtime.logging.model_dump(),
        "sync_request_log_enabled": runtime.logging.sync_enabled,
        "async_request_log_enabled": runtime.logging.async_enabled,
        "secrets_in_env": ["database_url", "redis_url", "rabbitmq_url", "admin_api_key"],
    }


@router.get("/integration/device-context")
def device_context_schema() -> dict:
    """How to collect FingerprintJS OSS + free browser signals on the client."""
    return {
        "library": "FingerprintJS open-source (MIT)",
        "cdn": "https://openfpcdn.io/fingerprintjs/v4/iife.min.js",
        "helper_script": "/client/fingerprint-collector.js",
        "context_fields": {
            "fingerprint": "FingerprintJS visitorId",
            "fingerprint_version": "FingerprintJS agent version",
            "user_agent": "navigator.userAgent",
            "browser_language": "navigator.language",
            "timezone": "Intl resolved timezone",
            "platform": "navigator.platform",
            "screen_resolution": "screen.width x screen.height",
            "ip": "server-side from request",
            "country": "geo from IP or user profile",
        },
    }


@router.get("/integration/event-schema")
def event_schema() -> dict:
    """Canonical request/response types for backend integrators."""
    return {
        "description": "Use these schemas so every backend sends the same payload shape.",
        "request": {
            "name": "CanonicalEvent",
            "content_type": "application/json",
            "endpoint": "POST /evaluate",
            "async": "RabbitMQ exchange casino.events (flat body or wrapped in payload/data/event)",
            "json_schema": CanonicalEvent.model_json_schema(),
            "download": "/schemas/canonical-event.schema.json",
        },
        "response": {
            "name": "EvaluateResponse",
            "endpoint": "POST /evaluate",
            "json_schema": EvaluateResponse.model_json_schema(),
            "download": "/schemas/evaluate-response.schema.json",
        },
        "action_message": {
            "name": "RiskActionMessage",
            "queue": "risk.actions",
            "download": "/schemas/risk-action.schema.json",
        },
        "event_types": [event_type.value for event_type in EventType],
        "platform_contract": {
            "url": CONTRACT_URL,
            "version": CONTRACT_VERSION,
            "platform_event_types": sorted(PLATFORM_EVENT_TYPES),
            "scored_event_types": sorted(SCORED_EVENT_TYPES),
            "skipped_platform_event_types": sorted(SKIPPED_PLATFORM_EVENT_TYPES),
        },
        "typescript": "/schemas/afs-types.d.ts",
        "python": "/schemas/canonical_event.py",
        "field_requirements": {
            "always_required": ["event_id", "event_type", "timestamp", "user", "context"],
            "user_required": ["user_id"],
            "transaction_required_for": ["deposit", "withdrawal", "bet"],
            "recommended_for_web": [
                "context.fingerprint",
                "context.user_agent",
                "context.timezone",
                "metadata.channel",
            ],
            "recommended_for_withdrawal": [
                "transaction.payment_method_type",
                "transaction.payment_method_key",
            ],
            "recommended_server_side": ["context.ip", "context.country"],
        },
        "schema_files": _SCHEMA_FILES,
    }


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate(event: CanonicalEvent, evaluator: RiskEvaluator = Depends(get_evaluator)):
    """Synchronous risk evaluation for signup, login, and transaction flows."""
    result = await evaluator.evaluate_sync(event)
    log_evaluate("/evaluate", event, result)
    return result
