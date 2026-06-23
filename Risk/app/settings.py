from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from shared.db.urls import build_amqp_url, build_postgres_sqlalchemy_url, build_redis_url

# Always load Risk/.env regardless of process working directory (uvicorn cwd varies).
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE) if _ENV_FILE.is_file() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )
    # Admin UI / config API (keep secret — not stored in runtime config DB)
    admin_api_key: str = ""

    # IP intelligence (free VPN/proxy detection via ip-api.com + ippriv.com fallback)
    ip_intel_enabled: bool = True
    ip_intel_cache_ttl_seconds: int = 86400
    ip_intel_timeout_seconds: float = 3.0
    ip_intel_fail_open: bool = True

    # iGaming operator context
    platform_name: str = "casino"
    licensed_markets: str = "DE,MT,GB,SE,FI,NL,AT,IE"

    # Database (trusted devices + shared with orchestrator audit)
    database_url: str = "sqlite:///../data/afs_risk.db"
    postgres_user: str | None = None
    postgres_password: str | None = None
    postgres_host: str | None = None
    postgres_port: int = 5432
    postgres_db: str | None = None

    # Sync API
    sync_publish_audit: bool = True
    decision_cache_ttl_seconds: int = 60
    evaluate_file_log_enabled: bool = False
    evaluate_file_log_path: str = "../data/evaluate-requests.jsonl"

    # Redis (shared velocity + optional idempotency cache)
    redis_enabled: bool = False
    redis_url: str = "redis://localhost:6379/0"
    redis_host: str | None = None
    redis_port: int = 6379
    redis_password: str | None = None
    redis_db: int = 0
    redis_velocity_ip_ttl: int = 3600
    redis_velocity_domain_ttl: int = 86400

    # Decision thresholds
    decision_block_threshold: int = 81
    decision_challenge_threshold: int = 31

    # AML blocklist background sync (OFAC lists from third-party sources)
    aml_blocklist_background_sync: bool = True

    # RabbitMQ — async inbound events (casino platform subscription)
    rabbitmq_enabled: bool = True
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"
    rabbitmq_host: str | None = None
    rabbitmq_port: int = 5672
    rabbitmq_user: str | None = None
    rabbitmq_password: str | None = None
    rabbitmq_vhost: str = "/"
    rabbitmq_events_exchange: str = "casino.events"
    rabbitmq_events_exchange_type: str = "topic"
    rabbitmq_events_queue: str = "casino.afs"
    rabbitmq_events_binding_key: str = "#"
    rabbitmq_prefetch: int = 10

    # RabbitMQ — outbound results (audit / orchestrator)
    rabbitmq_publish_results: bool = True
    rabbitmq_results_queue: str = "risk.results"

    @model_validator(mode="after")
    def resolve_connection_urls(self) -> "Settings":
        if self.postgres_host and self.postgres_user and self.postgres_db:
            self.database_url = build_postgres_sqlalchemy_url(
                user=self.postgres_user,
                password=self.postgres_password or "",
                host=self.postgres_host,
                port=self.postgres_port,
                database=self.postgres_db,
            )
        if self.redis_host:
            self.redis_url = build_redis_url(
                host=self.redis_host,
                port=self.redis_port,
                password=self.redis_password or "",
                db=self.redis_db,
            )
        if self.rabbitmq_host and self.rabbitmq_user is not None:
            self.rabbitmq_url = build_amqp_url(
                user=self.rabbitmq_user,
                password=self.rabbitmq_password or "",
                host=self.rabbitmq_host,
                port=self.rabbitmq_port,
                vhost=self.rabbitmq_vhost,
            )
        return self

    def licensed_market_set(self) -> set[str]:
        return {code.strip().upper() for code in self.licensed_markets.split(",") if code.strip()}


settings = Settings()
