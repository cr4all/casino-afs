from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from shared.db.urls import build_amqp_url, build_postgres_sqlalchemy_url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "sqlite:///../data/afs_risk.db"
    postgres_user: str | None = None
    postgres_password: str | None = None
    postgres_host: str | None = None
    postgres_port: int = 5432
    postgres_db: str | None = None

    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"
    rabbitmq_host: str | None = None
    rabbitmq_port: int = 5672
    rabbitmq_user: str | None = None
    rabbitmq_password: str | None = None
    rabbitmq_vhost: str = "/"
    rabbitmq_results_queue: str = "risk.results"
    rabbitmq_actions_queue: str = "risk.actions"
    rabbitmq_prefetch: int = 10

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
        if self.rabbitmq_host and self.rabbitmq_user is not None:
            self.rabbitmq_url = build_amqp_url(
                user=self.rabbitmq_user,
                password=self.rabbitmq_password or "",
                host=self.rabbitmq_host,
                port=self.rabbitmq_port,
                vhost=self.rabbitmq_vhost,
            )
        return self


settings = Settings()
