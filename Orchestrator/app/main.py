import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from shared.db.session import get_session_factory, init_database
from app.messaging.consumer import ResultConsumer
from app.messaging.publisher import ActionPublisher
from app.services.orchestrator import OrchestratorService
from app.settings import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database(settings.database_url)

    publisher = ActionPublisher(settings)
    consumer: ResultConsumer | None = None

    try:
        await publisher.connect()
    except Exception:
        logger.exception("RabbitMQ action publisher unavailable at startup")

    orchestrator = OrchestratorService(get_session_factory(), publisher)

    try:
        consumer = ResultConsumer(settings, orchestrator)
        await consumer.start()
    except Exception:
        logger.exception("RabbitMQ result consumer unavailable at startup")
        consumer = None

    app.state.orchestrator = orchestrator

    yield

    if consumer:
        await consumer.stop()
    await publisher.close()


def create_app() -> FastAPI:
    app = FastAPI(
        title="AFS Risk Orchestrator",
        description="Consumes risk.results, persists audit logs, and publishes risk.actions.",
        lifespan=lifespan,
    )

    @app.get("/health")
    async def health():
        return {"status": "ok", "service": "orchestrator"}

    return app


app = create_app()
