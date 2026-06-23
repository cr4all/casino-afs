from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.admin_auth import require_admin_key
from app.runtime_config import RuntimeConfigData, get_runtime_config_store
from app.services.evaluate_logs import get_evaluate_log, list_evaluate_logs
from app.settings import settings
from app.infrastructure.aml_blocklist import get_aml_blocklist_service
from shared.db.session import get_session_factory
router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/status")
def admin_status() -> dict:
    return {
        "admin_enabled": bool(settings.admin_api_key),
        "database_configured": bool(settings.database_url),
    }


@router.get("/config", response_model=RuntimeConfigData)
def get_config(_: str = Depends(require_admin_key)) -> RuntimeConfigData:
    return get_runtime_config_store().get()


@router.put("/config", response_model=RuntimeConfigData)
def update_config(
    config: RuntimeConfigData,
    _: str = Depends(require_admin_key),
) -> RuntimeConfigData:
    return get_runtime_config_store().update(config, updated_by="admin:ui")


@router.post("/config/reset", response_model=RuntimeConfigData)
def reset_config(_: str = Depends(require_admin_key)) -> RuntimeConfigData:
    return get_runtime_config_store().reset(settings=settings, updated_by="admin:reset")


@router.get("/config/audit")
def config_audit(limit: int = 50, _: str = Depends(require_admin_key)) -> dict:
    entries = get_runtime_config_store().list_audit(limit=min(limit, 200))
    return {"entries": entries}


@router.get("/logs")
def evaluate_logs(
    channel: str | None = Query(default=None, pattern="^(sync|async)$"),
    status: str | None = Query(default=None),
    event_id: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: str = Depends(require_admin_key),
) -> dict:
    result = list_evaluate_logs(
        get_session_factory(),
        channel=channel,
        status=status,
        event_id=event_id,
        limit=limit,
        offset=offset,
    )
    return {"total": result.total, "entries": result.entries, "limit": limit, "offset": offset}


@router.get("/logs/{log_id}")
def evaluate_log_detail(log_id: int, _: str = Depends(require_admin_key)) -> dict:
    entry = get_evaluate_log(get_session_factory(), log_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Log entry not found")
    return entry


@router.get("/blocklist/status")
def blocklist_status(_: str = Depends(require_admin_key)) -> dict:
    return get_aml_blocklist_service().get_status()


@router.post("/blocklist/sync")
def blocklist_sync(_: str = Depends(require_admin_key)) -> dict:
    status = get_aml_blocklist_service().sync_ofac_lists()
    return {
        "last_sync_at": status.last_sync_at.isoformat() if status.last_sync_at else None,
        "last_sync_ok": status.last_sync_ok,
        "crypto_count": status.crypto_count,
        "country_count": status.country_count,
        "last_error": status.last_error,
    }
