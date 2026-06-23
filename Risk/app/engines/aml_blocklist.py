from app.infrastructure.aml_blocklist import (
    COUNTRY_BLOCKLIST_EVENT_TYPES,
    get_aml_blocklist_service,
)
from app.models import CanonicalEvent, EventType
from app.runtime_config import get_runtime_config


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    config = get_runtime_config().aml.blocklist
    if not config.enabled:
        return 0, []

    score = 0
    signals: list[str] = []
    service = get_aml_blocklist_service()

    country = (event.context.country or "").upper()
    if config.country_enabled and country and event.event_type in COUNTRY_BLOCKLIST_EVENT_TYPES:
        if service.is_country_blocked(country):
            score = max(score, config.country_hit_score)
            signals.append("blocklisted_country")

    if event.event_type in {EventType.PAYMENT_WITHDRAW, EventType.PAYMENT_DEPOSIT}:
        transaction = event.transaction
        if transaction and transaction.payment_method_type and transaction.payment_method_key:
            hit = service.is_payout_blocked(
                transaction.payment_method_type,
                transaction.payment_method_key,
            )
            if hit.matched:
                score = max(score, config.crypto_hit_score)
                if hit.source == "ofac":
                    signals.append("ofac_sanctioned_wallet")
                else:
                    signals.append("blocklisted_payout_address")

    return min(score, 100), signals
