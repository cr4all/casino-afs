import json
import logging
import threading
from datetime import datetime, timezone

from sqlalchemy.orm import Session, sessionmaker

from app.runtime_config.defaults import build_default_runtime_config
from app.runtime_config.schema import RuntimeConfigData
from app.settings import Settings
from shared.db.models import RuntimeConfigAuditLog, RuntimeConfigRecord

logger = logging.getLogger(__name__)

CONFIG_ROW_ID = 1
_store: "RuntimeConfigStore | None" = None


class RuntimeConfigStore:
    def __init__(self, session_factory: sessionmaker) -> None:
        self._session_factory = session_factory
        self._lock = threading.RLock()
        self._config = build_default_runtime_config()

    def get(self, *, copy: bool = True) -> RuntimeConfigData:
        with self._lock:
            if copy:
                return self._config.model_copy(deep=True)
            return self._config

    def load(self, settings: Settings | None = None) -> RuntimeConfigData:
        with self._lock:
            with self._session_factory() as session:
                record = session.get(RuntimeConfigRecord, CONFIG_ROW_ID)
                if record is None:
                    self._config = build_default_runtime_config(settings)
                    self._persist(session, self._config, updated_by="system:bootstrap")
                    session.commit()
                    logger.info("Initialized runtime config from defaults")
                else:
                    self._config = RuntimeConfigData.model_validate_json(record.config_json)
                    logger.info("Loaded runtime config from database (updated_at=%s)", record.updated_at)
            self._apply_side_effects()
            return self._config.model_copy(deep=True)

    def update(self, config: RuntimeConfigData, updated_by: str) -> RuntimeConfigData:
        with self._lock:
            with self._session_factory() as session:
                self._persist(session, config, updated_by=updated_by)
                session.commit()
                self._config = config
            self._apply_side_effects()
            logger.info("Runtime config updated by %s", updated_by)
            return self._config.model_copy(deep=True)

    def reset(self, settings: Settings | None = None, updated_by: str = "system:reset") -> RuntimeConfigData:
        config = build_default_runtime_config(settings)
        return self.update(config, updated_by=updated_by)

    def list_audit(self, limit: int = 50) -> list[dict]:
        with self._session_factory() as session:
            rows = (
                session.query(RuntimeConfigAuditLog)
                .order_by(RuntimeConfigAuditLog.id.desc())
                .limit(limit)
                .all()
            )
            return [
                {
                    "id": row.id,
                    "updated_at": row.updated_at.isoformat(),
                    "updated_by": row.updated_by,
                    "summary": row.summary,
                }
                for row in rows
            ]

    def _persist(self, session: Session, config: RuntimeConfigData, updated_by: str) -> None:
        now = datetime.now(timezone.utc)
        payload = config.model_dump(mode="json")
        config_json = json.dumps(payload, ensure_ascii=False)

        record = session.get(RuntimeConfigRecord, CONFIG_ROW_ID)
        if record is None:
            record = RuntimeConfigRecord(
                id=CONFIG_ROW_ID,
                config_json=config_json,
                updated_at=now,
                updated_by=updated_by,
            )
            session.add(record)
        else:
            record.config_json = config_json
            record.updated_at = now
            record.updated_by = updated_by

        session.add(
            RuntimeConfigAuditLog(
                config_json=config_json,
                updated_at=now,
                updated_by=updated_by,
                summary=f"Config updated by {updated_by}",
            )
        )

    def _apply_side_effects(self) -> None:
        return


def init_runtime_config_store(session_factory: sessionmaker, settings: Settings | None = None) -> RuntimeConfigStore:
    global _store
    _store = RuntimeConfigStore(session_factory)
    _store.load(settings)
    return _store


def get_runtime_config_store() -> RuntimeConfigStore:
    if _store is None:
        raise RuntimeError("Runtime config store is not initialized")
    return _store


def get_runtime_config(*, copy: bool = False) -> RuntimeConfigData:
    return get_runtime_config_store().get(copy=copy)
