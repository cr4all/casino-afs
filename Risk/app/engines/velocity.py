from app.infrastructure.velocity_store import get_velocity_store
from app.models import CanonicalEvent


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    return get_velocity_store().record_and_score(event)
