import json
import logging

from shared.messaging.rabbitmq_connect import connect_robust_with_retry
from aio_pika.abc import AbstractIncomingMessage, AbstractRobustConnection
from pydantic import ValidationError

from app.models import RiskResultMessage
from app.services.orchestrator import OrchestratorService
from app.settings import Settings

logger = logging.getLogger(__name__)


class ResultConsumer:
    def __init__(self, settings: Settings, orchestrator: OrchestratorService) -> None:
        self._settings = settings
        self._orchestrator = orchestrator
        self._connection: AbstractRobustConnection | None = None

    async def start(self) -> None:
        self._connection = await connect_robust_with_retry(self._settings.rabbitmq_url)
        channel = await self._connection.channel()
        await channel.set_qos(prefetch_count=self._settings.rabbitmq_prefetch)

        queue = await channel.declare_queue(
            self._settings.rabbitmq_results_queue,
            durable=True,
        )

        await queue.consume(self._handle_message, no_ack=False)
        logger.info(
            "Orchestrator listening on '%s' (prefetch=%s)",
            self._settings.rabbitmq_results_queue,
            self._settings.rabbitmq_prefetch,
        )

    async def stop(self) -> None:
        if self._connection and not self._connection.is_closed:
            await self._connection.close()
            logger.info("Result consumer stopped")

    async def _handle_message(self, message: AbstractIncomingMessage) -> None:
        try:
            payload = json.loads(message.body.decode())
            result = RiskResultMessage.model_validate(payload)
        except (json.JSONDecodeError, ValidationError) as exc:
            logger.error(
                "Rejecting invalid result message (delivery_tag=%s): %s",
                message.delivery_tag,
                exc,
            )
            await message.reject(requeue=False)
            return

        try:
            await self._orchestrator.process_result(result)
        except Exception:
            logger.exception(
                "Failed to orchestrate event %s (delivery_tag=%s)",
                result.event_id,
                message.delivery_tag,
            )
            await message.nack(requeue=True)
            return

        await message.ack()
