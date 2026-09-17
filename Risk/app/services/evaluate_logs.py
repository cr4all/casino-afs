import json
from dataclasses import dataclass

from sqlalchemy.orm import sessionmaker

from shared.db.models import EvaluateRequestLog


@dataclass
class EvaluateLogListResult:
    total: int
    entries: list[dict]


def list_evaluate_logs(
    session_factory: sessionmaker,
    *,
    channel: str | None = None,
    status: str | None = None,
    event_id: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> EvaluateLogListResult:
    limit = min(max(limit, 1), 200)
    offset = max(offset, 0)

    with session_factory() as session:
        query = session.query(EvaluateRequestLog)

        if channel:
            query = query.filter(EvaluateRequestLog.channel == channel)
        if status:
            query = query.filter(EvaluateRequestLog.status == status)
        if event_id:
            query = query.filter(EvaluateRequestLog.event_id.ilike(f"%{event_id}%"))

        total = query.count()
        rows = (
            query.order_by(EvaluateRequestLog.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        return EvaluateLogListResult(total=total, entries=[_serialize_row(row, include_payload=False) for row in rows])


def get_evaluate_log(session_factory: sessionmaker, log_id: int) -> dict | None:
    with session_factory() as session:
        row = session.get(EvaluateRequestLog, log_id)
        if row is None:
            return None
        return _serialize_row(row, include_payload=True)


def _serialize_row(row: EvaluateRequestLog, *, include_payload: bool) -> dict:
    decision, risk_level, final_score = _extract_response_meta(row)
    entry = {
        "id": row.id,
        "logged_at": row.logged_at.isoformat(),
        "channel": row.channel,
        "status": row.status,
        "decision": decision,
        "risk_level": risk_level,
        "final_score": final_score,
        "summary": row.summary,
        "event_id": row.event_id,
        "event_type": row.event_type,
        "routing_key": row.routing_key,
        "queue": row.queue,
        "endpoint": row.endpoint,
        "error": row.error,
    }
    if include_payload:
        entry["request"] = _parse_json(row.request_json)
        entry["response"] = _parse_json(row.response_json)
    return entry


def _extract_response_meta(row: EvaluateRequestLog) -> tuple[str | None, str | None, int | None]:
    response = _parse_json(row.response_json)
    if not isinstance(response, dict):
        return None, None, None
    decision = response.get("decision")
    risk_level = response.get("risk_level")
    if isinstance(decision, str):
        decision = decision.strip().lower() or None
    else:
        decision = None
    if isinstance(risk_level, str):
        risk_level = risk_level.strip().lower() or None
    else:
        risk_level = None
    final_score = response.get("final_score")
    if final_score is not None:
        try:
            final_score = int(final_score)
        except (TypeError, ValueError):
            final_score = None
    else:
        final_score = None
    return decision, risk_level, final_score


def _parse_json(value: str | None):
    if not value:
        return None
    return json.loads(value)
