"""Admin dashboard alert feed for block / critical events."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import sessionmaker

from app.runtime_config import get_runtime_config_store
from shared.db.models import EvaluateRequestLog, RiskAuditLog


def get_dashboard_alerts(
    session_factory: sessionmaker,
    *,
    since: datetime,
    limit: int = 50,
) -> dict[str, Any]:
    limit = min(max(limit, 1), 100)
    since = _ensure_utc(since)

    dashboard = get_runtime_config_store().get().dashboard
    if not dashboard.notifications_enabled:
        return {"alerts": [], "notifications_enabled": False}

    notify_block = dashboard.notify_on_block
    notify_critical = dashboard.notify_on_critical
    if not notify_block and not notify_critical:
        return {"alerts": [], "notifications_enabled": True}

    alerts: list[dict[str, Any]] = []

    with session_factory() as session:
        eval_rows = (
            session.query(EvaluateRequestLog)
            .filter(
                EvaluateRequestLog.logged_at > since,
                EvaluateRequestLog.status == "scored",
            )
            .order_by(EvaluateRequestLog.logged_at.asc())
            .limit(500)
            .all()
        )
        audit_rows = (
            session.query(RiskAuditLog)
            .filter(RiskAuditLog.created_at > since)
            .order_by(RiskAuditLog.created_at.asc())
            .limit(500)
            .all()
        )

    for row in eval_rows:
        logged_at = _ensure_utc(row.logged_at)
        response = _parse_json(row.response_json)
        request = _parse_json(row.request_json)
        if not isinstance(response, dict):
            continue
        decision = str(response.get("decision") or "allow").strip().lower()
        risk_level = str(response.get("risk_level") or "low").strip().lower()
        kind = _alert_kind(decision, risk_level, notify_block, notify_critical)
        if kind is None:
            continue
        event_type = row.event_type or response.get("event_type") or "unknown"
        alerts.append(
            {
                "ts": logged_at.isoformat(),
                "event_id": row.event_id or response.get("event_id", ""),
                "user_id": response.get("user_id") or _user_from_request(request) or "-",
                "event_type": event_type,
                "decision": decision,
                "risk_level": risk_level,
                "final_score": response.get("final_score", 0),
                "signals": _signals_from_response(response)[:8],
                "source": row.channel or "sync",
                "kind": kind,
            }
        )

    for row in audit_rows:
        created_at = _ensure_utc(row.created_at)
        decision = str(row.decision or "allow").strip().lower()
        risk_level = str(row.risk_level or "low").strip().lower()
        kind = _alert_kind(decision, risk_level, notify_block, notify_critical)
        if kind is None:
            continue
        signals = _parse_json(row.signals)
        alerts.append(
            {
                "ts": created_at.isoformat(),
                "event_id": row.event_id,
                "user_id": row.user_id or "-",
                "event_type": row.event_type,
                "decision": decision,
                "risk_level": risk_level,
                "final_score": row.final_score,
                "signals": signals if isinstance(signals, list) else [],
                "source": "orchestrator",
                "kind": kind,
            }
        )

    alerts.sort(key=lambda item: item["ts"])
    alerts = alerts[-limit:]

    return {
        "alerts": alerts,
        "notifications_enabled": True,
        "notify_on_block": notify_block,
        "notify_on_critical": notify_critical,
        "poll_interval_seconds": dashboard.poll_interval_seconds,
    }


def _alert_kind(
    decision: str,
    risk_level: str,
    notify_block: bool,
    notify_critical: bool,
) -> str | None:
    is_block = decision == "block"
    is_critical = risk_level == "critical"
    if notify_block and is_block and notify_critical and is_critical:
        return "both"
    if notify_block and is_block:
        return "block"
    if notify_critical and is_critical:
        return "critical"
    return None


def _ensure_utc(ts: datetime) -> datetime:
    if ts.tzinfo is None:
        return ts.replace(tzinfo=timezone.utc)
    return ts.astimezone(timezone.utc)


def _parse_json(raw: str | None) -> dict | list | None:
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _user_from_request(request: dict | None) -> str | None:
    if not isinstance(request, dict):
        return None
    user = request.get("user")
    if isinstance(user, dict):
        return user.get("user_id")
    return None


def _signals_from_response(response: dict) -> list[str]:
    signals: list[str] = []
    engines = response.get("engines")
    if isinstance(engines, dict):
        for engine in engines.values():
            if isinstance(engine, dict):
                for sig in engine.get("signals") or []:
                    signals.append(str(sig))
    return signals
