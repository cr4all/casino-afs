from app.models import BET_EVENT_TYPES, CanonicalEvent, EventType, MONEY_EVENT_TYPES, is_provider_sourced_event
from app.runtime_config import get_runtime_config


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    if is_provider_sourced_event(event.event_type):
        return 0, []

    if event.event_type not in MONEY_EVENT_TYPES:
        return 0, []

    transaction = event.transaction
    if not transaction or transaction.amount is None:
        return 25, ["missing_transaction_amount"]

    aml = get_runtime_config().aml
    amount = transaction.amount
    score = 0
    signals: list[str] = []

    if event.event_type == EventType.PAYMENT_DEPOSIT:
        if amount < aml.micro_deposit_max:
            score += 20
            signals.append("micro_deposit_bonus_farming")

        if amount >= aml.large_deposit_threshold:
            score += 55
            signals.append("large_deposit_aml_review")
        elif amount >= aml.single_deposit_threshold:
            score += 30
            signals.append("elevated_deposit_aml_review")

        if aml.structuring_threshold * 0.9 <= amount < aml.structuring_threshold:
            score += 25
            signals.append("structuring_threshold_deposit")

    if event.event_type == EventType.PAYMENT_WITHDRAW:
        if amount >= aml.large_deposit_threshold:
            score += 50
            signals.append("large_withdrawal_review")
        elif amount >= aml.withdrawal_review_threshold:
            score += 30
            signals.append("elevated_withdrawal_review")

        if amount >= aml.withdrawal_review_threshold:
            score += 15
            signals.append("cashout_review_required")

    if event.event_type in BET_EVENT_TYPES:
        if amount >= aml.high_stake_bet_threshold:
            score += 35
            signals.append("high_stake_bet")
        elif amount >= 100:
            score += 10
            signals.append("elevated_stake_bet")

    return min(score, 100), signals
