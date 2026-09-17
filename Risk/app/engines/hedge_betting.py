from app.infrastructure.hedge_betting import get_hedge_betting_store
from app.models import BET_EVENT_TYPES, CanonicalEvent


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if event.event_type not in BET_EVENT_TYPES:
        return 0, []
    return get_hedge_betting_store().evaluate_bet(event)
