import logging

import redis

from app.settings import Settings

logger = logging.getLogger(__name__)


def create_redis_client(settings: Settings) -> redis.Redis | None:
    if not settings.redis_enabled:
        return None

    client = redis.from_url(settings.redis_url, decode_responses=True)
    client.ping()
    logger.info("Connected to Redis at %s", settings.redis_url)
    return client
