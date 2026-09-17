from __future__ import annotations

import json
from typing import Protocol

import redis

from app.models import BET_EVENT_TYPES, CanonicalEvent, EventType, GameBetData
from app.runtime_config import get_runtime_config
from app.runtime_config.schema import HedgeBettingConfig


def _normalize_selection(value: str) -> str:
    return value.strip().lower()


def _amounts_match(left: float, right: float, tolerance_percent: float) -> bool:
    if left <= 0 or right <= 0:
        return False
    larger = max(left, right)
    return abs(left - right) / larger * 100.0 <= tolerance_percent


def _opposite_pairs(config: HedgeBettingConfig) -> list[frozenset[str]]:
    pairs: list[frozenset[str]] = []
    for group in config.opposite_selection_groups:
        normalized = {_normalize_selection(item) for item in group if item and item.strip()}
        if len(normalized) >= 2:
            pairs.append(frozenset(normalized))
    return pairs


def _selections_are_opposite(
    left: str,
    right: str,
    config: HedgeBettingConfig,
) -> bool:
    if left == right:
        return False
    for group in _opposite_pairs(config):
        if left in group and right in group:
            return True
    return False


def _round_key(event: CanonicalEvent, game: GameBetData, config: HedgeBettingConfig) -> str | None:
    if game.round_id and game.round_id.strip():
        return game.round_id.strip()

    if config.require_round_id:
        return None

    table_id = (game.table_id or "").strip()
    if table_id:
        bucket = int(event.timestamp.timestamp()) // config.time_pair_window_seconds
        return f"{table_id}:{bucket}"

    return None


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


def _find_opposite_leg(
    selection: str,
    amount: float,
    legs: dict[str, float],
    config: HedgeBettingConfig,
) -> tuple[str, float] | None:
    for other_selection, other_amount in legs.items():
        if _selections_are_opposite(selection, other_selection, config) and _amounts_match(
            amount,
            other_amount,
            config.amount_match_tolerance_percent,
        ):
            return other_selection, other_amount
    return None


class HedgeBettingStore(Protocol):
    def evaluate_bet(self, event: CanonicalEvent) -> tuple[int, list[str]]: ...


class InMemoryHedgeBettingStore:
    def __init__(self) -> None:
        self._round_legs: dict[str, dict[str, float]] = {}
        self._round_flagged: set[str] = set()
        self._hedged_round_count: dict[str, int] = {}
        self._gross_volume: dict[str, float] = {}
        self._hedged_gross_volume: dict[str, float] = {}

    def evaluate_bet(self, event: CanonicalEvent) -> tuple[int, list[str]]:
        config = get_runtime_config().hedge_betting
        if not config.enabled or event.event_type not in BET_EVENT_TYPES:
            return 0, []

        game = event.metadata.game if event.metadata else None
        if game is None or not game.selection or not game.selection.strip():
            return 0, []

        amount = event.transaction.amount if event.transaction else None
        if amount is None or amount <= 0:
            return 0, []

        user_id = event.user.user_id
        if not user_id:
            return 0, []

        round_key = _round_key(event, game, config)
        if round_key is None:
            return 0, []

        selection = _normalize_selection(game.selection)
        score = 0
        signals: list[str] = []

        user_stats_key = user_id
        self._gross_volume[user_stats_key] = self._gross_volume.get(user_stats_key, 0.0) + amount

        round_storage_key = f"{user_id}:{round_key}"
        legs = self._round_legs.setdefault(round_storage_key, {})
        opposite = _find_opposite_leg(selection, amount, legs, config)

        legs[selection] = legs.get(selection, 0.0) + amount

        if opposite is not None:
            score += config.opposite_side_same_round_score
            signals.append("opposite_side_bets_same_round")

            if round_storage_key not in self._round_flagged:
                self._round_flagged.add(round_storage_key)
                matched_volume = amount + opposite[1]
                self._hedged_round_count[user_stats_key] = (
                    self._hedged_round_count.get(user_stats_key, 0) + 1
                )
                self._hedged_gross_volume[user_stats_key] = (
                    self._hedged_gross_volume.get(user_stats_key, 0.0) + matched_volume
                )

                tier_score, tier_signals = _tier_score(
                    self._hedged_round_count[user_stats_key],
                    medium_at=config.hedged_round_medium,
                    high_at=config.hedged_round_high,
                    critical_at=config.hedged_round_critical,
                    medium_score=config.hedged_round_medium_score,
                    high_score=config.hedged_round_high_score,
                    critical_score=config.hedged_round_critical_score,
                    medium_signal="repeated_hedged_rounds",
                    high_signal="high_repeated_hedged_rounds",
                    critical_signal="critical_hedged_bet_volume_washing",
                )
                score += tier_score
                signals.extend(tier_signals)

        if config.volume_washing_enabled:
            gross = self._gross_volume.get(user_stats_key, 0.0)
            hedged_gross = self._hedged_gross_volume.get(user_stats_key, 0.0)
            if gross >= config.min_gross_volume and gross > 0:
                ratio = hedged_gross / gross
                if ratio >= config.min_hedged_gross_ratio:
                    score += config.volume_washing_score
                    signals.append("hedged_bet_volume_washing")

        return min(score, 100), signals


class RedisHedgeBettingStore:
    def __init__(self, client: redis.Redis) -> None:
        self._client = client

    def evaluate_bet(self, event: CanonicalEvent) -> tuple[int, list[str]]:
        config = get_runtime_config().hedge_betting
        if not config.enabled or event.event_type not in BET_EVENT_TYPES:
            return 0, []

        game = event.metadata.game if event.metadata else None
        if game is None or not game.selection or not game.selection.strip():
            return 0, []

        amount = event.transaction.amount if event.transaction else None
        if amount is None or amount <= 0:
            return 0, []

        user_id = event.user.user_id
        if not user_id:
            return 0, []

        round_key = _round_key(event, game, config)
        if round_key is None:
            return 0, []

        selection = _normalize_selection(game.selection)
        score = 0
        signals: list[str] = []
        window_ttl = config.window_seconds
        round_ttl = config.round_leg_ttl_seconds

        gross_key = f"hedge:gross:user:{user_id}"
        hedged_gross_key = f"hedge:hedged_gross:user:{user_id}"
        hedged_round_key = f"hedge:round_count:user:{user_id}"
        round_legs_key = f"hedge:round_legs:{user_id}:{round_key}"
        round_flag_key = f"hedge:round_flag:{user_id}:{round_key}"

        self._incr_float(gross_key, amount, window_ttl)

        legs_raw = self._client.get(round_legs_key)
        legs: dict[str, float] = json.loads(legs_raw) if legs_raw else {}
        opposite = _find_opposite_leg(selection, amount, legs, config)

        legs[selection] = legs.get(selection, 0.0) + amount
        self._client.set(round_legs_key, json.dumps(legs), ex=round_ttl)

        if opposite is not None:
            score += config.opposite_side_same_round_score
            signals.append("opposite_side_bets_same_round")

            if not self._client.exists(round_flag_key):
                self._client.set(round_flag_key, "1", ex=round_ttl)
                matched_volume = amount + opposite[1]
                self._incr_float(hedged_gross_key, matched_volume, window_ttl)
                hedged_round_count = self._incr(hedged_round_key, window_ttl)

                tier_score, tier_signals = _tier_score(
                    hedged_round_count,
                    medium_at=config.hedged_round_medium,
                    high_at=config.hedged_round_high,
                    critical_at=config.hedged_round_critical,
                    medium_score=config.hedged_round_medium_score,
                    high_score=config.hedged_round_high_score,
                    critical_score=config.hedged_round_critical_score,
                    medium_signal="repeated_hedged_rounds",
                    high_signal="high_repeated_hedged_rounds",
                    critical_signal="critical_hedged_bet_volume_washing",
                )
                score += tier_score
                signals.extend(tier_signals)

        if config.volume_washing_enabled:
            gross = float(self._client.get(gross_key) or 0.0)
            hedged_gross = float(self._client.get(hedged_gross_key) or 0.0)
            if gross >= config.min_gross_volume and gross > 0:
                ratio = hedged_gross / gross
                if ratio >= config.min_hedged_gross_ratio:
                    score += config.volume_washing_score
                    signals.append("hedged_bet_volume_washing")

        return min(score, 100), signals

    def _incr(self, key: str, ttl: int) -> int:
        count = int(self._client.incr(key))
        if count == 1:
            self._client.expire(key, ttl)
        return count

    def _incr_float(self, key: str, amount: float, ttl: int) -> None:
        self._client.incrbyfloat(key, amount)
        if self._client.ttl(key) < 0:
            self._client.expire(key, ttl)


_store: HedgeBettingStore | None = None


def init_hedge_betting_store(
    *,
    redis_enabled: bool,
    redis_client: redis.Redis | None,
) -> HedgeBettingStore:
    global _store

    if redis_enabled and redis_client is not None:
        _store = RedisHedgeBettingStore(redis_client)
    else:
        _store = InMemoryHedgeBettingStore()

    return _store


def get_hedge_betting_store() -> HedgeBettingStore:
    if _store is None:
        return init_hedge_betting_store(redis_enabled=False, redis_client=None)
    return _store
