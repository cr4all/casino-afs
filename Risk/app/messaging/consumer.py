import logging

from aio_pika import ExchangeType
from aio_pika.abc import AbstractIncomingMessage, AbstractRobustChannel
from shared.messaging.rabbitmq_connect import RabbitMQBroker, close_connection, connect_robust_with_retry

from app.infrastructure.evaluate_request_logger import (
    log_async_failed,
    log_async_rejected,
    log_async_scored,
    log_async_skipped,
)
from app.messaging.event_parser import parse_canonical_event
from app.runtime_config import get_runtime_config
from app.services.evaluator import RiskEvaluator
from app.settings import Settings

logger = logging.getLogger(__name__)


class EventConsumer:
    def __init__(
        self,
        settings: Settings,
        evaluator: RiskEvaluator,
        broker: RabbitMQBroker | None = None,
    ) -> None:
        self._settings = settings
        self._evaluator = evaluator
        self._broker = broker
        self._channel: AbstractRobustChannel | None = None

    def is_connected(self) -> bool:
        return self._channel is not None and not self._channel.is_closed

    async def start(self) -> None:
        await self.stop()
        features = get_runtime_config().features
        owns_connection = self._broker is None
        if self._broker is not None:
            connection = await self._broker.connect(self._settings.rabbitmq_url)
        else:
            connection = await connect_robust_with_retry(self._settings.rabbitmq_url)

        try:
            channel = await connection.channel()
            await channel.set_qos(prefetch_count=features.rabbitmq_prefetch)

            queue = await self._bind_events_queue(channel, features)
            await queue.consume(self._handle_message, no_ack=False)
        except Exception:
            if owns_connection:
                await close_connection(connection)
            raise

        self._channel = channel

        if features.rabbitmq_events_exchange:
            logger.info(
                "Async consumer bound queue '%s' to exchange '%s' (%s) with binding '%s' (prefetch=%s)",
                features.rabbitmq_events_queue,
                features.rabbitmq_events_exchange,
                features.rabbitmq_events_exchange_type,
                features.rabbitmq_events_binding_key,
                features.rabbitmq_prefetch,
            )
        else:
            logger.info(
                "Async consumer listening on queue '%s' (legacy/default exchange, prefetch=%s)",
                features.rabbitmq_events_queue,
                features.rabbitmq_prefetch,
            )

    async def _bind_events_queue(self, channel, features):
        exchange_name = features.rabbitmq_events_exchange.strip()

        if not exchange_name:
            return await channel.declare_queue(
                features.rabbitmq_events_queue,
                durable=True,
            )

        exchange_type = ExchangeType(features.rabbitmq_events_exchange_type.lower())
        exchange = await channel.declare_exchange(
            exchange_name,
            type=exchange_type,
            durable=True,
        )
        queue = await channel.declare_queue(
            features.rabbitmq_events_queue,
            durable=True,
        )
        await queue.bind(exchange, routing_key=features.rabbitmq_events_binding_key)
        return queue

    async def stop(self) -> None:
        if self._channel and not self._channel.is_closed:
            await self._channel.close()
            logger.info("Async consumer stopped")
        self._channel = None

    async def _handle_message(self, message: AbstractIncomingMessage) -> None:
        routing_key = message.routing_key or ""
        queue_name = get_runtime_config().features.rabbitmq_events_queue

        try:
            event = parse_canonical_event(message.body, routing_key)
        except ValueError as exc:
            logger.error(
                "Rejecting invalid message (routing_key=%s, delivery_tag=%s): %s",
                routing_key or "-",
                message.delivery_tag,
                exc,
            )
            log_async_rejected(
                routing_key=routing_key,
                queue=queue_name,
                raw_body=message.body,
                error=str(exc),
            )
            await message.reject(requeue=False)
            return

        if event is None:
            log_async_skipped(
                routing_key=routing_key,
                queue=queue_name,
                raw_body=message.body,
            )
            await message.ack()
            return

        try:
            result = await self._evaluator.evaluate_async(event)
        except Exception as exc:
            logger.exception(
                "Failed to process event %s (routing_key=%s, delivery_tag=%s)",
                event.event_id,
                routing_key or "-",
                message.delivery_tag,
            )
            log_async_failed(
                event,
                routing_key=routing_key,
                queue=queue_name,
                error=str(exc),
            )
            await message.nack(requeue=True)
            return

        log_async_scored(
            event,
            result,
            routing_key=routing_key,
            queue=queue_name,
        )
        await message.ack()
