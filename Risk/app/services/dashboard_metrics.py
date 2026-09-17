"""Admin dashboard aggregates from evaluate_request_logs and risk_audit_log."""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy.orm import sessionmaker

from shared.db.models import EvaluateRequestLog, RiskAuditLog

BET_EVENT_TYPES = {"wallet.bet", "game.bet"}


@dataclass
class DashboardMetrics:
    from_ts: datetime
    to_ts: datetime
    bucket_minutes: int
    data_sources: dict[str, int]
    betting: dict[str, Any]
    decisions: dict[str, Any]
    recent_actions: list[dict[str, Any]]
    top_signals: list[dict[str, Any]]
    event_types: list[dict[str, Any]]
    overview: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return {
            "from_ts": self.from_ts.isoformat(),
            "to_ts": self.to_ts.isoformat(),
            "bucket_minutes": self.bucket_minutes,
            "data_sources": self.data_sources,
            "betting": self.betting,
            "decisions": self.decisions,
            "recent_actions": self.recent_actions,
            "top_signals": self.top_signals,
            "event_types": self.event_types,
            "overview": self.overview,
        }


def get_dashboard_metrics(
    session_factory: sessionmaker,
    *,
    hours: float = 24,
    bucket_minutes: int = 5,
) -> DashboardMetrics:
    hours = min(max(hours, 0.25), 168)
    bucket_minutes = min(max(bucket_minutes, 1), 60)
    to_ts = datetime.now(timezone.utc)
    from_ts = to_ts - timedelta(hours=hours)
    active_window = min(max(hours * 60, 5), 60)

    with session_factory() as session:
        eval_rows = (
            session.query(EvaluateRequestLog)
            .filter(
                EvaluateRequestLog.logged_at >= from_ts,
                EvaluateRequestLog.logged_at <= to_ts,
                EvaluateRequestLog.status == "scored",
            )
            .order_by(EvaluateRequestLog.logged_at.asc())
            .limit(50000)
            .all()
        )
        audit_rows = (
            session.query(RiskAuditLog)
            .filter(RiskAuditLog.created_at >= from_ts, RiskAuditLog.created_at <= to_ts)
            .order_by(RiskAuditLog.created_at.asc())
            .limit(50000)
            .all()
        )

    return _aggregate(
        eval_rows=eval_rows,
        audit_rows=audit_rows,
        from_ts=from_ts,
        to_ts=to_ts,
        bucket_minutes=bucket_minutes,
        active_window_minutes=active_window,
    )


def _ensure_utc(ts: datetime) -> datetime:
    if ts.tzinfo is None:
        return ts.replace(tzinfo=timezone.utc)
    return ts.astimezone(timezone.utc)


def _aggregate(
    *,
    eval_rows: list[EvaluateRequestLog],
    audit_rows: list[RiskAuditLog],
    from_ts: datetime,
    to_ts: datetime,
    bucket_minutes: int,
    active_window_minutes: float,
) -> DashboardMetrics:
    bucket_delta = timedelta(minutes=bucket_minutes)
    buckets = _build_buckets(from_ts, to_ts, bucket_delta)
    bucket_set = {b.isoformat() for b in buckets}

    bet_counts: dict[str, int] = defaultdict(int)
    bet_volume: dict[str, float] = defaultdict(float)
    bet_users_per_bucket: dict[str, set[str]] = defaultdict(set)
    active_cutoff = to_ts - timedelta(minutes=active_window_minutes)
    active_bettors: set[str] = set()
    total_bet_volume = 0.0
    total_bets = 0

    decision_counts: Counter[str] = Counter()
    risk_level_counts: Counter[str] = Counter()
    signal_counts: Counter[str] = Counter()
    event_type_counts: Counter[str] = Counter()
    channel_counts: Counter[str] = Counter()
    latencies: list[int] = []

    recent_actions: list[dict[str, Any]] = []

    for row in eval_rows:
        logged_at = _ensure_utc(row.logged_at)
        channel_counts[row.channel or "unknown"] += 1
        response = _parse_json(row.response_json)
        request = _parse_json(row.request_json)
        event_type = row.event_type or (response or {}).get("event_type") or "unknown"
        event_type_counts[event_type] += 1

        if response:
            decision = response.get("decision")
            if decision:
                decision_counts[decision] += 1
            risk_level = response.get("risk_level")
            if risk_level:
                risk_level_counts[risk_level] += 1
            latency = response.get("latency_ms")
            if isinstance(latency, int):
                latencies.append(latency)
            _collect_signals_from_response(response, signal_counts)
            _maybe_add_action(
                recent_actions,
                ts=logged_at,
                event_id=row.event_id or response.get("event_id", ""),
                user_id=response.get("user_id") or _user_from_request(request),
                event_type=event_type,
                decision=decision or "allow",
                risk_level=risk_level or "low",
                final_score=response.get("final_score", 0),
                signals=_signals_from_response(response),
                source=row.channel or "sync",
            )

        if event_type in BET_EVENT_TYPES:
            user_id = _user_from_request(request) or (response or {}).get("user_id")
            amount = _amount_from_request(request)
            bucket_key = _bucket_key(logged_at, bucket_delta)
            if bucket_key in bucket_set:
                bet_counts[bucket_key] += 1
                if amount is not None:
                    bet_volume[bucket_key] += amount
                    total_bet_volume += amount
                total_bets += 1
                if user_id:
                    bet_users_per_bucket[bucket_key].add(user_id)
                    if logged_at >= active_cutoff:
                        active_bettors.add(user_id)

    for row in audit_rows:
        created_at = _ensure_utc(row.created_at)
        event_type_counts[row.event_type] += 1
        decision_counts[row.decision] += 1
        risk_level_counts[row.risk_level] += 1
        signals = _parse_json(row.signals)
        if isinstance(signals, list):
            for sig in signals:
                if sig:
                    signal_counts[str(sig)] += 1
        _maybe_add_action(
            recent_actions,
            ts=created_at,
            event_id=row.event_id,
            user_id=row.user_id,
            event_type=row.event_type,
            decision=row.decision,
            risk_level=row.risk_level,
            final_score=row.final_score,
            signals=signals if isinstance(signals, list) else [],
            source="orchestrator",
        )

    series = []
    for bucket_start in buckets:
        key = bucket_start.isoformat()
        series.append(
            {
                "ts": key,
                "bet_count": bet_counts.get(key, 0),
                "bet_volume": round(bet_volume.get(key, 0.0), 2),
                "unique_bettors": len(bet_users_per_bucket.get(key, set())),
            }
        )

    recent_actions.sort(key=lambda item: item["ts"], reverse=True)
    recent_actions = recent_actions[:40]

    top_signals = [{"signal": name, "count": count} for name, count in signal_counts.most_common(12)]
    event_types = [{"event_type": name, "count": count} for name, count in event_type_counts.most_common(15)]
    avg_latency = round(sum(latencies) / len(latencies), 1) if latencies else None

    return DashboardMetrics(
        from_ts=from_ts,
        to_ts=to_ts,
        bucket_minutes=bucket_minutes,
        data_sources={
            "evaluate_logs": len(eval_rows),
            "risk_audit_log": len(audit_rows),
        },
        betting={
            "series": series,
            "total_bets": total_bets,
            "total_volume": round(total_bet_volume, 2),
            "active_bettors": len(active_bettors),
            "active_window_minutes": int(active_window_minutes),
        },
        decisions={
            "by_decision": dict(decision_counts),
            "by_risk_level": dict(risk_level_counts),
            "blocks": decision_counts.get("block", 0),
            "challenges": decision_counts.get("challenge", 0),
            "allows": decision_counts.get("allow", 0),
            "critical": risk_level_counts.get("critical", 0),
            "high": risk_level_counts.get("high", 0),
        },
        recent_actions=recent_actions,
        top_signals=top_signals,
        event_types=event_types,
        overview={
            "total_scored": len(eval_rows) + len(audit_rows),
            "channels": dict(channel_counts),
            "avg_latency_ms": avg_latency,
            "logging_hint": len(eval_rows) == 0 and len(audit_rows) == 0,
        },
    )


def _build_buckets(from_ts: datetime, to_ts: datetime, delta: timedelta) -> list[datetime]:
    buckets: list[datetime] = []
    minute_mod = int(delta.total_seconds() // 60) or 1
    cursor = from_ts.replace(second=0, microsecond=0)
    cursor = cursor.replace(minute=cursor.minute - (cursor.minute % minute_mod))
    while cursor <= to_ts:
        buckets.append(cursor)
        cursor += delta
    return buckets


def _bucket_key(ts: datetime, delta: timedelta) -> str:
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    minute_mod = int(delta.total_seconds() // 60) or 1
    aligned = ts.replace(second=0, microsecond=0)
    aligned = aligned.replace(minute=aligned.minute - (aligned.minute % minute_mod))
    return aligned.isoformat()


def _parse_json(raw: str | None) -> dict | list | None:
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _user_from_request(request: dict | None) -> str | None:
    if not request:
        return None
    user = request.get("user")
    if isinstance(user, dict):
        return user.get("user_id")
    return None


def _amount_from_request(request: dict | None) -> float | None:
    if not request:
        return None
    tx = request.get("transaction")
    if isinstance(tx, dict) and tx.get("amount") is not None:
        try:
            return float(tx["amount"])
        except (TypeError, ValueError):
            return None
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


def _collect_signals_from_response(response: dict, counter: Counter[str]) -> None:
    for sig in _signals_from_response(response):
        counter[sig] += 1


def _maybe_add_action(
    actions: list[dict[str, Any]],
    *,
    ts: datetime,
    event_id: str,
    user_id: str | None,
    event_type: str,
    decision: str,
    risk_level: str,
    final_score: int,
    signals: list[str],
    source: str,
) -> None:
    if decision not in {"block", "challenge"} and risk_level not in {"critical", "high"}:
        return
    actions.append(
        {
            "ts": ts.isoformat(),
            "event_id": event_id,
            "user_id": user_id or "-",
            "event_type": event_type,
            "decision": decision,
            "risk_level": risk_level,
            "final_score": final_score,
            "signals": signals[:8],
            "source": source,
        }
    )
