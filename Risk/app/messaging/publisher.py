import logging

from aio_pika import DeliveryMode, Message
from aio_pika.abc import AbstractRobustChannel
from shared.messaging.rabbitmq_connect import RabbitMQBroker, close_connection, connect_robust_with_retry

from app.models import EvaluateResponse, RiskResultMessage
from app.runtime_config import get_runtime_config
from app.settings import Settings

logger = logging.getLogger(__name__)


class ResultPublisher:
    def __init__(self, settings: Settings, broker: RabbitMQBroker | None = None) -> None:
        self._settings = settings
        self._broker = broker
        self._channel: AbstractRobustChannel | None = None

    def is_connected(self) -> bool:
        return self._channel is not None and not self._channel.is_closed

    async def connect(self) -> None:
        await self.close()
        features = get_runtime_config().features
        owns_connection = self._broker is None
        if self._broker is not None:
            connection = await self._broker.connect(self._settings.rabbitmq_url)
        else:
            connection = await connect_robust_with_retry(self._settings.rabbitmq_url)

        try:
            channel = await connection.channel()
            await channel.declare_queue(features.rabbitmq_results_queue, durable=True)
        except Exception:
            if owns_connection:
                await close_connection(connection)
            raise

        self._channel = channel
        logger.info("Publishing results to queue '%s'", features.rabbitmq_results_queue)

    async def close(self) -> None:
        if self._channel and not self._channel.is_closed:
            await self._channel.close()
        self._channel = None

    async def publish(self, result: EvaluateResponse) -> None:
        if not self.is_connected():
            logger.warning("Result publisher not connected; skipping publish for %s", result.event_id)
            return

        payload = RiskResultMessage(**result.model_dump())
        message = Message(
            body=payload.model_dump_json().encode(),
            content_type="application/json",
            delivery_mode=DeliveryMode.PERSISTENT,
        )

        features = get_runtime_config().features
        await self._channel.default_exchange.publish(
            message,
            routing_key=features.rabbitmq_results_queue,
        )

        logger.info(
            "Published result for event %s to '%s'",
            result.event_id,
            features.rabbitmq_results_queue,
        )
