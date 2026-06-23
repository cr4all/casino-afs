from collections.abc import Callable

from app.models import CanonicalEvent, EventType
from app.runtime_config import get_runtime_config


def _tier_score(
    count: int,
    *,
    medium_at: int,
    high_at: int,
    critical_at: int,
    medium_score: int,
    high_score: int,
    critical_score: int,
    medium_signal: str,
    high_signal: str,
    critical_signal: str,
) -> tuple[int, list[str]]:
    if count >= critical_at:
        return critical_score, [critical_signal]
    if count >= high_at:
        return high_score, [high_signal]
    if count >= medium_at:
        return medium_score, [medium_signal]
    return 0, []


def betting_pattern_velocity(
    event: CanonicalEvent,
    incr: Callable[[str], int],
    get: Callable[[str], int],
) -> tuple[int, list[str]]:
    """Detect rapid sequential betting and suspicious win patterns in a rolling window."""
    config = get_runtime_config().betting_patterns
    if not config.enabled:
        return 0, []

    user_id = event.user.user_id
    if not user_id:
        return 0, []

    score = 0
    signals: list[str] = []

    if event.event_type == EventType.GAME_BET:
        count = incr(f"vel:game_bet_burst:user:{user_id}")
        incr(f"vel:bet_activity:user:{user_id}")
        tier_score, tier_signals = _tier_score(
            count,
            medium_at=config.game_bet_burst_medium,
            high_at=config.game_bet_burst_high,
            critical_at=config.game_bet_burst_critical,
            medium_score=config.game_bet_medium_score,
            high_score=config.game_bet_high_score,
            critical_score=config.game_bet_critical_score,
            medium_signal="sequential_game_bet_burst",
            high_signal="high_sequential_game_bet_burst",
            critical_signal="critical_sequential_game_bet_burst",
        )
        score += tier_score
        signals.extend(tier_signals)

    if event.event_type == EventType.WALLET_BET:
        count = incr(f"vel:wallet_bet_burst:user:{user_id}")
        incr(f"vel:bet_activity:user:{user_id}")
        tier_score, tier_signals = _tier_score(
            count,
            medium_at=config.wallet_bet_burst_medium,
            high_at=config.wallet_bet_burst_high,
            critical_at=config.wallet_bet_burst_critical,
            medium_score=config.wallet_bet_medium_score,
            high_score=config.wallet_bet_high_score,
            critical_score=config.wallet_bet_critical_score,
            medium_signal="sequential_wallet_bet_burst",
            high_signal="high_sequential_wallet_bet_burst",
            critical_signal="critical_sequential_wallet_bet_burst",
        )
        score += tier_score
        signals.extend(tier_signals)

    if event.event_type == EventType.WALLET_WIN:
        win_count = incr(f"vel:wallet_win_burst:user:{user_id}")
        tier_score, tier_signals = _tier_score(
            win_count,
            medium_at=config.wallet_win_burst_medium,
            high_at=config.wallet_win_burst_high,
            critical_at=config.wallet_win_burst_critical,
            medium_score=config.wallet_win_medium_score,
            high_score=config.wallet_win_high_score,
            critical_score=config.wallet_win_critical_score,
            medium_signal="sequential_wallet_win_burst",
            high_signal="high_sequential_wallet_win_burst",
            critical_signal="critical_sequential_wallet_win_burst",
        )
        score += tier_score
        signals.extend(tier_signals)

        bet_activity = get(f"vel:bet_activity:user:{user_id}")
        if bet_activity >= config.win_rate_min_bets:
            win_ratio = win_count / bet_activity
            if win_ratio >= config.win_rate_critical_ratio:
                score += config.win_rate_critical_score
                signals.append("critical_win_rate_in_betting_sequence")
            elif win_ratio >= config.win_rate_high_ratio:
                score += config.win_rate_high_score
                signals.append("high_win_rate_in_betting_sequence")

    return min(score, 100), signals
