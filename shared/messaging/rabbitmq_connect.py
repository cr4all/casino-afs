import asyncio
import logging

from aio_pika.abc import AbstractConnection
from aio_pika.connection import Connection, make_url

logger = logging.getLogger(__name__)

DEFAULT_CONNECT_TIMEOUT = 30.0


def rabbitmq_target(url: str) -> str:
    if "@" in url:
        return url.split("@", 1)[1]
    return url


def _mark_connection_closed(connection: AbstractConnection) -> None:
    """Prevent aio_pika Connection.__del__ from scheduling async close off-loop.

    When connect() fails before a transport exists, aio_pika's close() returns
    early without marking the internal _closed future, so GC later triggers
    Connection.__del__ in worker threads (e.g. ThreadPoolExecutor).
    """
    connection._close_called = True
    if not connection.is_closed:
        connection._closed.set_result(True)


async def close_connection(connection: AbstractConnection | None) -> None:
    if connection is None:
        return
    try:
        await connection.close()
    except Exception:
        logger.debug("Error closing RabbitMQ connection", exc_info=True)
    finally:
        try:
            _mark_connection_closed(connection)
        except Exception:
            logger.debug("Error marking RabbitMQ connection closed", exc_info=True)


async def connect_with_retry(
    url: str,
    *,
    attempts: int = 10,
    delay_seconds: float = 3.0,
    timeout: float = DEFAULT_CONNECT_TIMEOUT,
) -> AbstractConnection:
    """Connect to RabbitMQ, explicitly closing partial connections on failure."""
    target = rabbitmq_target(url)
    last_error: Exception | None = None

    for attempt in range(1, attempts + 1):
        connection = Connection(make_url(url))
        try:
            await connection.connect(timeout=timeout)
            logger.info("Connected to RabbitMQ at %s", target)
            return connection
        except Exception as exc:
            last_error = exc
            await close_connection(connection)
            logger.warning(
                "RabbitMQ connect attempt %s/%s to %s failed: %s",
                attempt,
                attempts,
                target,
                exc,
            )
            if attempt < attempts:
                await asyncio.sleep(delay_seconds)

    assert last_error is not None
    raise last_error


# Backward-compatible alias used by Orchestrator and tests.
connect_robust_with_retry = connect_with_retry


class RabbitMQBroker:
    """One RabbitMQ connection shared by publisher and consumer channels."""

    def __init__(self) -> None:
        self._connection: AbstractConnection | None = None
        self._url: str | None = None

    def is_connected(self) -> bool:
        return self._connection is not None and not self._connection.is_closed

    async def connect(self, url: str) -> AbstractConnection:
        if self.is_connected():
            return self._connection  # type: ignore[return-value]

        self._url = url
        self._connection = await connect_with_retry(url)
        return self._connection

    async def reconnect(self) -> AbstractConnection:
        await self.close()
        if not self._url:
            raise RuntimeError("RabbitMQ broker URL is not set")
        self._connection = await connect_with_retry(self._url)
        return self._connection

    async def close(self) -> None:
        await close_connection(self._connection)
        self._connection = None
