import asyncio
import contextlib
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.admin_routes import router as admin_router
from app.api.routes import router
from shared.db.session import get_session_factory, init_database
from app.infrastructure.aml_blocklist import init_aml_blocklist_service, get_aml_blocklist_service
from app.infrastructure.evaluate_request_logger import init_evaluate_request_logger
from app.infrastructure.ip_intelligence import init_ip_intelligence_service
from app.infrastructure.redis_client import create_redis_client
from app.infrastructure.velocity_store import init_velocity_store
from app.messaging.consumer import EventConsumer
from app.messaging.publisher import ResultPublisher
from app.runtime_config import get_runtime_config, init_runtime_config_store
from app.services.evaluator import RiskEvaluator
from app.services.trusted_devices import init_trusted_device_service
from app.services.step_up_verification import init_step_up_verification_service
from app.settings import settings
from shared.messaging.rabbitmq_connect import RabbitMQBroker, rabbitmq_target
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

logger = logging.getLogger(__name__)


async def _rabbitmq_reconnect_loop(
    app: FastAPI,
    evaluator: RiskEvaluator,
    *,
    want_publisher: bool,
    want_consumer: bool,
) -> None:
    while True:
        await asyncio.sleep(15)

        broker: RabbitMQBroker = app.state.rabbitmq_broker
        publisher: ResultPublisher | None = getattr(app.state, "rabbitmq_publisher", None)
        consumer: EventConsumer | None = getattr(app.state, "rabbitmq_consumer", None)

        if not broker.is_connected():
            try:
                await broker.connect(settings.rabbitmq_url)
            except Exception:
                app.state.rabbitmq_publisher_connected = False
                app.state.rabbitmq_consumer_connected = False
                logger.debug("RabbitMQ broker reconnect failed", exc_info=True)
                continue

        if want_publisher and publisher is not None and not publisher.is_connected():
            try:
                await publisher.connect()
                app.state.rabbitmq_publisher_connected = True
                evaluator._publisher = publisher
                logger.info("RabbitMQ result publisher channel restored (background retry)")
            except Exception:
                await publisher.close()
                app.state.rabbitmq_publisher_connected = False
                logger.debug("RabbitMQ publisher channel retry failed", exc_info=True)

        if want_consumer and consumer is not None and not consumer.is_connected():
            try:
                await consumer.start()
                app.state.rabbitmq_consumer_connected = True
                logger.info("RabbitMQ async consumer channel restored (background retry)")
            except Exception:
                await consumer.stop()
                app.state.rabbitmq_consumer_connected = False
                logger.debug("RabbitMQ consumer channel retry failed", exc_info=True)


async def _aml_blocklist_sync_loop() -> None:
    # Defer first sync so RabbitMQ startup/reconnect finishes on the main loop.
    await asyncio.sleep(10)
    while True:
        try:
            runtime = get_runtime_config()
            blocklist = runtime.aml.blocklist
            if blocklist.enabled and (
                blocklist.sync_ofac_crypto_enabled or blocklist.sync_ofac_countries_enabled
            ):
                await get_aml_blocklist_service().sync_ofac_lists_async()
            interval_seconds = max(blocklist.sync_interval_hours, 1) * 3600
        except Exception:
            logger.exception("AML blocklist sync loop error")
            interval_seconds = 3600
        await asyncio.sleep(interval_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI):
    redis_client = None
    reconnect_task = None

    init_database(settings.database_url)
    init_runtime_config_store(get_session_factory(), settings)
    runtime = get_runtime_config()

    try:
        if runtime.features.redis_enabled:
            redis_client = create_redis_client(settings)
    except Exception:
        logger.exception("Redis unavailable; falling back to in-memory velocity store")

    init_velocity_store(
        redis_enabled=runtime.features.redis_enabled and redis_client is not None,
        redis_client=redis_client,
        ip_ttl=runtime.features.redis_velocity_ip_ttl,
        domain_ttl=runtime.features.redis_velocity_domain_ttl,
    )

    init_ip_intelligence_service(
        settings,
        redis_client if runtime.features.redis_enabled and redis_client is not None else None,
    )

    init_trusted_device_service(get_session_factory())
    init_step_up_verification_service(get_session_factory())
    init_evaluate_request_logger(get_session_factory())
    init_aml_blocklist_service(get_session_factory())

    blocklist_sync_task = None
    runtime_blocklist = runtime.aml.blocklist
    if (
        settings.aml_blocklist_background_sync
        and runtime_blocklist.enabled
        and (runtime_blocklist.sync_ofac_crypto_enabled or runtime_blocklist.sync_ofac_countries_enabled)
    ):
        blocklist_sync_task = asyncio.create_task(_aml_blocklist_sync_loop(), name="aml-blocklist-sync")

    app.state.rabbitmq_target = rabbitmq_target(settings.rabbitmq_url)
    app.state.rabbitmq_publisher_connected = False
    app.state.rabbitmq_consumer_connected = False
    app.state.rabbitmq_broker = RabbitMQBroker()
    app.state.rabbitmq_publisher = None
    app.state.rabbitmq_consumer = None
    logger.info("RabbitMQ broker target: %s", app.state.rabbitmq_target)

    broker: RabbitMQBroker = app.state.rabbitmq_broker
    publisher: ResultPublisher | None = None
    consumer: EventConsumer | None = None
    want_publisher = runtime.features.rabbitmq_publish_results and settings.rabbitmq_publish_results
    want_consumer = runtime.features.rabbitmq_enabled and settings.rabbitmq_enabled

    if want_publisher:
        publisher = ResultPublisher(settings, broker=broker)
        app.state.rabbitmq_publisher = publisher
        try:
            await publisher.connect()
            app.state.rabbitmq_publisher_connected = True
        except Exception:
            await publisher.close()
            logger.exception(
                "RabbitMQ result publisher unavailable at startup; sync /evaluate still works; will retry"
            )

    evaluator = RiskEvaluator(
        settings=settings,
        publisher=publisher,
        redis_client=redis_client,
    )
    app.state.settings = settings
    app.state.evaluator = evaluator

    if want_consumer:
        consumer = EventConsumer(settings, evaluator, broker=broker)
        app.state.rabbitmq_consumer = consumer
        try:
            await consumer.start()
            app.state.rabbitmq_consumer_connected = True
        except Exception:
            await consumer.stop()
            logger.exception(
                "RabbitMQ async consumer unavailable at startup; sync /evaluate still works; will retry"
            )
    else:
        logger.warning("RabbitMQ async consumer disabled")

    reconnect_task = None
    if want_publisher or want_consumer:
        reconnect_task = asyncio.create_task(
            _rabbitmq_reconnect_loop(
                app,
                evaluator,
                want_publisher=want_publisher,
                want_consumer=want_consumer,
            ),
            name="rabbitmq-reconnect",
        )
    app.state.blocklist_sync_task = blocklist_sync_task

    yield

    if reconnect_task:
        reconnect_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await reconnect_task

    blocklist_sync_task = getattr(app.state, "blocklist_sync_task", None)
    if blocklist_sync_task:
        blocklist_sync_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await blocklist_sync_task

    consumer = getattr(app.state, "rabbitmq_consumer", None)
    publisher = getattr(app.state, "rabbitmq_publisher", None)
    broker = getattr(app.state, "rabbitmq_broker", None)
    if consumer:
        await consumer.stop()
    if publisher:
        await publisher.close()
    if broker:
        await broker.close()
    if redis_client is not None:
        redis_client.close()


def create_app() -> FastAPI:
    app = FastAPI(
        title="AFS Risk Engine",
        description="Fraud and compliance risk scoring for casino / iGaming platforms (signup, login, deposit, withdrawal, bet).",
        lifespan=lifespan,
    )
    app.include_router(router)
    app.include_router(admin_router)

    repo_root = Path(__file__).resolve().parents[2]
    admin_dir = repo_root / "admin"
    if admin_dir.is_dir():
        app.mount("/admin", StaticFiles(directory=admin_dir, html=True), name="admin")

    client_dir = repo_root / "client"
    if client_dir.is_dir():
        app.mount("/client", StaticFiles(directory=client_dir), name="client")

    schemas_dir = repo_root / "schemas"
    if schemas_dir.is_dir():
        app.mount("/schemas", StaticFiles(directory=schemas_dir), name="schemas")

    return app


app = create_app()
