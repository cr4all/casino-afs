import logging

from aio_pika import DeliveryMode, Message
from shared.messaging.rabbitmq_connect import connect_robust_with_retry
from aio_pika.abc import AbstractRobustChannel, AbstractRobustConnection

from app.models import RiskActionMessage
from app.settings import Settings

logger = logging.getLogger(__name__)


class ActionPublisher:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._connection: AbstractRobustConnection | None = None
        self._channel: AbstractRobustChannel | None = None

    async def connect(self) -> None:
        self._connection = await connect_robust_with_retry(self._settings.rabbitmq_url)
        self._channel = await self._connection.channel()
        await self._channel.declare_queue(self._settings.rabbitmq_actions_queue, durable=True)
        logger.info("Publishing actions to queue '%s'", self._settings.rabbitmq_actions_queue)

    async def close(self) -> None:
        if self._connection and not self._connection.is_closed:
            await self._connection.close()
            logger.info("Action publisher disconnected")

    async def publish(self, action: RiskActionMessage) -> None:
        if self._channel is None or self._channel.is_closed:
            logger.warning("Action publisher not connected; skipping publish for %s", action.event_id)
            return

        message = Message(
            body=action.model_dump_json().encode(),
            content_type="application/json",
            delivery_mode=DeliveryMode.PERSISTENT,
        )

        await self._channel.default_exchange.publish(
            message,
            routing_key=self._settings.rabbitmq_actions_queue,
        )

        logger.info(
            "Published action '%s' for event %s to '%s'",
            action.action,
            action.event_id,
            self._settings.rabbitmq_actions_queue,
        )
