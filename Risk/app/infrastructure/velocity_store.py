from collections.abc import Callable
from typing import Protocol

import redis

from app.infrastructure.betting_patterns import betting_pattern_velocity
from app.runtime_config import get_runtime_config
from app.infrastructure.withdrawal_method import withdrawal_method_storage_key
from app.models import CanonicalEvent, EventType, GAMING_EVENT_TYPES, MONEY_EVENT_TYPES, is_provider_sourced_event


def _money_event_velocity(event: CanonicalEvent, incr: Callable[[str], int]) -> tuple[int, list[str]]:
    """Casino-specific velocity for deposit, withdrawal, and bet events."""
    score = 0
    signals: list[str] = []
    user_id = event.user.user_id
    ip = event.context.ip

    if event.event_type == EventType.PAYMENT_DEPOSIT:
        deposit_count = incr(f"vel:deposit:user:{user_id}")
        if deposit_count >= get_runtime_config().velocity_thresholds["deposit_user_critical"]:
            score += 70
            signals.append("rapid_deposit_activity")
        elif deposit_count >= get_runtime_config().velocity_thresholds["deposit_user_high"]:
            score += 45
            signals.append("high_deposit_velocity")
        elif deposit_count >= get_runtime_config().velocity_thresholds["deposit_user_medium"]:
            score += 25
            signals.append("medium_deposit_velocity")

    if event.event_type == EventType.PAYMENT_WITHDRAW:
        withdrawal_count = incr(f"vel:withdrawal:user:{user_id}")
        if withdrawal_count >= get_runtime_config().velocity_thresholds["withdrawal_user_critical"]:
            score += 75
            signals.append("rapid_withdrawal_activity")
        elif withdrawal_count >= get_runtime_config().velocity_thresholds["withdrawal_user_high"]:
            score += 50
            signals.append("high_withdrawal_velocity")
        elif withdrawal_count >= get_runtime_config().velocity_thresholds["withdrawal_user_medium"]:
            score += 30
            signals.append("medium_withdrawal_velocity")

        if ip:
            withdrawal_ip_count = incr(f"vel:withdrawal:ip:{ip}")
            if withdrawal_ip_count >= get_runtime_config().velocity_thresholds["withdrawal_ip_high"]:
                score += 40
                signals.append("high_withdrawal_ip_velocity")

    return score, signals


def _fingerprint_velocity(
    event: CanonicalEvent,
    incr: Callable[[str], int],
    sadd: Callable[[str, str], int],
) -> tuple[int, list[str]]:
    fingerprint = (event.context.fingerprint or "").strip()
    user_id = event.user.user_id

    if not fingerprint:
        return 0, []

    score = 0
    signals: list[str] = []

    if event.event_type == EventType.PLAYER_SIGNUP:
        fp_signup_count = incr(f"vel:signup:fingerprint:{fingerprint}")
        if fp_signup_count >= get_runtime_config().velocity_thresholds["signup_fingerprint_critical"]:
            score += 75
            signals.append("multi_account_fingerprint_abuse")
        elif fp_signup_count >= get_runtime_config().velocity_thresholds["signup_fingerprint_high"]:
            score += 50
            signals.append("high_signup_fingerprint_velocity")

    if event.event_type in {EventType.PLAYER_SIGNUP, EventType.PLAYER_LOGIN}:
        distinct_users = sadd(f"vel:fingerprint:users:{fingerprint}", user_id)
        if distinct_users >= get_runtime_config().velocity_thresholds["fingerprint_distinct_users_critical"]:
            score += 80
            signals.append("multi_account_fingerprint_abuse")
        elif distinct_users >= get_runtime_config().velocity_thresholds["fingerprint_distinct_users_high"]:
            score += 55
            signals.append("multiple_accounts_same_fingerprint")

    return score, signals


def _shared_withdrawal_method_velocity(
    event: CanonicalEvent,
    sadd: Callable[[str, str], int],
) -> tuple[int, list[str]]:
    config = get_runtime_config().withdrawal_method
    if not config.enabled or event.event_type != EventType.PAYMENT_WITHDRAW:
        return 0, []

    user_id = event.user.user_id
    if not user_id:
        return 0, []

    storage_key = withdrawal_method_storage_key(event.transaction)
    if not storage_key:
        return 0, []

    distinct_users = sadd(f"vel:withdrawal_method:users:{storage_key}", user_id)

    score = 0
    signals: list[str] = []

    if distinct_users >= config.distinct_users_critical:
        score += config.critical_score
        signals.append("multi_account_shared_withdrawal_method")
    elif distinct_users >= config.distinct_users_high:
        score += config.high_score
        signals.append("multiple_accounts_shared_payout_method")
    elif distinct_users >= config.distinct_users_medium:
        score += config.medium_score
        signals.append("shared_withdrawal_method")

    return score, signals


def _auth_failure_velocity(
    event: CanonicalEvent,
    incr: Callable[[str], int],
) -> tuple[int, list[str]]:
    score = 0
    signals: list[str] = []
    ip = event.context.ip
    user_id = event.user.user_id
    email = event.user.email or "unknown"

    if event.event_type == EventType.PLAYER_LOGIN_FAILED:
        if ip:
            ip_count = incr(f"vel:login_failed:ip:{ip}")
            if ip_count >= get_runtime_config().velocity_thresholds["login_failed_ip_critical"]:
                score += 85
                signals.append("brute_force_login_suspected")
            elif ip_count >= get_runtime_config().velocity_thresholds["login_failed_ip_high"]:
                score += 60
                signals.append("excessive_login_failures")
            elif ip_count >= get_runtime_config().velocity_thresholds["login_failed_ip_medium"]:
                score += 35
                signals.append("medium_login_failure_velocity")

        if user_id:
            user_count = incr(f"vel:login_failed:user:{user_id}")
            if user_count >= get_runtime_config().velocity_thresholds["login_failed_user_critical"]:
                score += 75
                signals.append("account_lockout_recommended")
            elif user_count >= get_runtime_config().velocity_thresholds["login_failed_user_high"]:
                score += 50
                signals.append("high_user_login_failure_velocity")

        email_count = incr(f"vel:login_failed:email:{email}")
        if email_count >= get_runtime_config().velocity_thresholds["login_failed_user_high"]:
            score += 40
            signals.append("credential_guessing_suspected")

    if event.event_type == EventType.PLAYER_SIGNUP_FAILED and ip:
        ip_count = incr(f"vel:signup_failed:ip:{ip}")
        if ip_count >= get_runtime_config().velocity_thresholds["signup_failed_ip_critical"]:
            score += 70
            signals.append("signup_abuse_suspected")
        elif ip_count >= get_runtime_config().velocity_thresholds["signup_failed_ip_high"]:
            score += 45
            signals.append("high_signup_failure_velocity")

    return min(score, 100), signals


class VelocityStore(Protocol):
    def record_and_score(self, event: CanonicalEvent) -> tuple[int, list[str]]: ...

    def record_auth_failure(self, event: CanonicalEvent) -> tuple[int, list[str]]: ...


class InMemoryVelocityStore:
    def __init__(self) -> None:
        self._counters: dict[str, int] = {}
        self._sets: dict[str, set[str]] = {}

    def _incr(self, key: str) -> int:
        self._counters[key] = self._counters.get(key, 0) + 1
        return self._counters[key]

    def _get(self, key: str) -> int:
        return self._counters.get(key, 0)

    def _sadd(self, key: str, member: str) -> int:
        bucket = self._sets.setdefault(key, set())
        bucket.add(member)
        return len(bucket)

    def record_and_score(self, event: CanonicalEvent) -> tuple[int, list[str]]:
        score = 0
        signals: list[str] = []
        event_type = event.event_type.value
        ip = event.context.ip
        user_id = event.user.user_id
        email = event.user.email

        if ip and not is_provider_sourced_event(event.event_type):
            all_ip_count = self._incr(f"vel:all:ip:{ip}")
            if all_ip_count >= get_runtime_config().velocity_thresholds["ip_all_high"]:
                score += 40
                signals.append("extreme_ip_activity")
            elif all_ip_count >= get_runtime_config().velocity_thresholds["ip_all_medium"]:
                score += 20
                signals.append("elevated_ip_activity")

        if event.event_type == EventType.PLAYER_LOGIN and ip:
            login_ip_count = self._incr(f"vel:login:ip:{ip}")
            distinct_users = self._sadd(f"vel:login:ip_users:{ip}", user_id)

            if login_ip_count >= get_runtime_config().velocity_thresholds["login_ip_critical"]:
                score += 80
                signals.append("bulk_login_attack")
            elif login_ip_count >= get_runtime_config().velocity_thresholds["login_ip_high"]:
                score += 60
                signals.append("high_login_ip_velocity")
            elif login_ip_count >= get_runtime_config().velocity_thresholds["login_ip_medium"]:
                score += 35
                signals.append("medium_login_ip_velocity")

            if distinct_users >= get_runtime_config().velocity_thresholds["login_ip_distinct_users_critical"]:
                score += 80
                signals.append("credential_stuffing_suspected")
            elif distinct_users >= get_runtime_config().velocity_thresholds["login_ip_distinct_users_high"]:
                score += 55
                signals.append("multiple_accounts_same_ip_login")

            user_login_count = self._incr(f"vel:login:user:{user_id}")
            if user_login_count >= get_runtime_config().velocity_thresholds["login_user_critical"]:
                score += 70
                signals.append("excessive_user_login_attempts")
            elif user_login_count >= get_runtime_config().velocity_thresholds["login_user_high"]:
                score += 45
                signals.append("high_user_login_velocity")
            elif user_login_count >= get_runtime_config().velocity_thresholds["login_user_medium"]:
                score += 25
                signals.append("medium_user_login_velocity")

        if event.event_type == EventType.PLAYER_SIGNUP:
            if ip:
                signup_ip_count = self._incr(f"vel:signup:ip:{ip}")
                if signup_ip_count >= get_runtime_config().velocity_thresholds["signup_ip_critical"]:
                    score += 80
                    signals.append("bulk_signup_attack")
                # elif signup_ip_count >= get_runtime_config().velocity_thresholds["signup_ip_high"]:
                #     score += 60
                #     signals.append("high_signup_ip_velocity")
                # elif signup_ip_count >= get_runtime_config().velocity_thresholds["signup_ip_medium"]:
                #     score += 30
                #     signals.append("medium_signup_ip_velocity")

            if email and "@" in email:
                domain = email.split("@")[-1]
                domain_count = self._incr(f"vel:signup:domain:{domain}")
                # if domain_count >= get_runtime_config().velocity_thresholds["signup_domain_critical"]:
                #     score += 65
                #     signals.append("mass_signup_same_email_domain")
                # elif domain_count >= get_runtime_config().velocity_thresholds["signup_domain_high"]:
                #     score += 40
                #     signals.append("high_signup_email_domain_velocity")

        fp_score, fp_signals = _fingerprint_velocity(event, self._incr, self._sadd)
        score += fp_score
        signals.extend(fp_signals)

        wm_score, wm_signals = _shared_withdrawal_method_velocity(event, self._sadd)
        score += wm_score
        signals.extend(wm_signals)

        if event.event_type in {EventType.PAYMENT_DEPOSIT, EventType.PAYMENT_WITHDRAW}:
            money_score, money_signals = _money_event_velocity(event, self._incr)
            score += money_score
            signals.extend(money_signals)

        if event.event_type in GAMING_EVENT_TYPES:
            betting_score, betting_signals = betting_pattern_velocity(
                event,
                self._incr,
                self._get,
            )
            score += betting_score
            signals.extend(betting_signals)

        if event.event_type not in MONEY_EVENT_TYPES | GAMING_EVENT_TYPES | {EventType.PLAYER_LOGIN, EventType.PLAYER_SIGNUP} and ip:
            generic_count = self._incr(f"vel:{event_type}:ip:{ip}")
            if generic_count > 10:
                score += 30
                signals.append(f"high_{event_type}_ip_velocity")

        return min(score, 100), signals

    def record_auth_failure(self, event: CanonicalEvent) -> tuple[int, list[str]]:
        return _auth_failure_velocity(event, self._incr)


class RedisVelocityStore:
    def __init__(self, client: redis.Redis, ip_ttl: int, domain_ttl: int) -> None:
        self._client = client
        self._ip_ttl = ip_ttl
        self._domain_ttl = domain_ttl

    def _incr(self, key: str, ttl: int) -> int:
        count = int(self._client.incr(key))
        if count == 1:
            self._client.expire(key, ttl)
        return count

    def _get(self, key: str) -> int:
        value = self._client.get(key)
        return int(value) if value else 0

    def _sadd(self, key: str, member: str, ttl: int) -> int:
        self._client.sadd(key, member)
        self._client.expire(key, ttl)
        return int(self._client.scard(key))

    def record_and_score(self, event: CanonicalEvent) -> tuple[int, list[str]]:
        score = 0
        signals: list[str] = []
        event_type = event.event_type.value
        ip = event.context.ip
        user_id = event.user.user_id
        email = event.user.email

        if ip and not is_provider_sourced_event(event.event_type):
            all_ip_count = self._incr(f"vel:all:ip:{ip}", self._ip_ttl)
            if all_ip_count >= get_runtime_config().velocity_thresholds["ip_all_high"]:
                score += 40
                signals.append("extreme_ip_activity")
            elif all_ip_count >= get_runtime_config().velocity_thresholds["ip_all_medium"]:
                score += 20
                signals.append("elevated_ip_activity")

        if event.event_type == EventType.PLAYER_LOGIN and ip:
            login_ip_count = self._incr(f"vel:login:ip:{ip}", self._ip_ttl)
            distinct_users = self._sadd(f"vel:login:ip_users:{ip}", user_id, self._ip_ttl)

            if login_ip_count >= get_runtime_config().velocity_thresholds["login_ip_critical"]:
                score += 80
                signals.append("bulk_login_attack")
            elif login_ip_count >= get_runtime_config().velocity_thresholds["login_ip_high"]:
                score += 60
                signals.append("high_login_ip_velocity")
            elif login_ip_count >= get_runtime_config().velocity_thresholds["login_ip_medium"]:
                score += 35
                signals.append("medium_login_ip_velocity")

            if distinct_users >= get_runtime_config().velocity_thresholds["login_ip_distinct_users_critical"]:
                score += 80
                signals.append("credential_stuffing_suspected")
            elif distinct_users >= get_runtime_config().velocity_thresholds["login_ip_distinct_users_high"]:
                score += 55
                signals.append("multiple_accounts_same_ip_login")

            user_login_count = self._incr(f"vel:login:user:{user_id}", self._ip_ttl)
            if user_login_count >= get_runtime_config().velocity_thresholds["login_user_critical"]:
                score += 70
                signals.append("excessive_user_login_attempts")
            elif user_login_count >= get_runtime_config().velocity_thresholds["login_user_high"]:
                score += 45
                signals.append("high_user_login_velocity")
            elif user_login_count >= get_runtime_config().velocity_thresholds["login_user_medium"]:
                score += 25
                signals.append("medium_user_login_velocity")

        if event.event_type == EventType.PLAYER_SIGNUP:
            if ip:
                signup_ip_count = self._incr(f"vel:signup:ip:{ip}", self._ip_ttl)
                if signup_ip_count >= get_runtime_config().velocity_thresholds["signup_ip_critical"]:
                    score += 80
                    signals.append("bulk_signup_attack")
                # elif signup_ip_count >= get_runtime_config().velocity_thresholds["signup_ip_high"]:
                #     score += 60
                #     signals.append("high_signup_ip_velocity")
                # elif signup_ip_count >= get_runtime_config().velocity_thresholds["signup_ip_medium"]:
                #     score += 30
                #     signals.append("medium_signup_ip_velocity")

            if email and "@" in email:
                domain = email.split("@")[-1]
                domain_count = self._incr(f"vel:signup:domain:{domain}", self._domain_ttl)
                if domain_count >= get_runtime_config().velocity_thresholds["signup_domain_critical"]:
                    score += 65
                    signals.append("mass_signup_same_email_domain")
                # elif domain_count >= get_runtime_config().velocity_thresholds["signup_domain_high"]:
                #     score += 40
                #     signals.append("high_signup_email_domain_velocity")

        fp_score, fp_signals = _fingerprint_velocity(
            event,
            lambda key: self._incr(key, self._ip_ttl),
            lambda key, member: self._sadd(key, member, self._ip_ttl),
        )
        score += fp_score
        signals.extend(fp_signals)

        wm_score, wm_signals = _shared_withdrawal_method_velocity(
            event,
            lambda key, member: self._sadd(key, member, self._domain_ttl),
        )
        score += wm_score
        signals.extend(wm_signals)

        if event.event_type in {EventType.PAYMENT_DEPOSIT, EventType.PAYMENT_WITHDRAW}:
            money_score, money_signals = _money_event_velocity(
                event,
                lambda key: self._incr(key, self._ip_ttl),
            )
            score += money_score
            signals.extend(money_signals)

        burst_ttl = get_runtime_config().betting_patterns.burst_window_seconds
        if event.event_type in GAMING_EVENT_TYPES:
            betting_score, betting_signals = betting_pattern_velocity(
                event,
                lambda key: self._incr(key, burst_ttl),
                self._get,
            )
            score += betting_score
            signals.extend(betting_signals)

        if event.event_type not in MONEY_EVENT_TYPES | GAMING_EVENT_TYPES | {EventType.PLAYER_LOGIN, EventType.PLAYER_SIGNUP} and ip:
            generic_count = self._incr(f"vel:{event_type}:ip:{ip}", self._ip_ttl)
            if generic_count > 10:
                score += 30
                signals.append(f"high_{event_type}_ip_velocity")

        return min(score, 100), signals

    def record_auth_failure(self, event: CanonicalEvent) -> tuple[int, list[str]]:
        return _auth_failure_velocity(event, lambda key: self._incr(key, self._ip_ttl))


_store: VelocityStore | None = None


def init_velocity_store(
    *,
    redis_enabled: bool,
    redis_client: redis.Redis | None,
    ip_ttl: int,
    domain_ttl: int,
) -> VelocityStore:
    global _store

    if redis_enabled and redis_client is not None:
        _store = RedisVelocityStore(redis_client, ip_ttl, domain_ttl)
    else:
        _store = InMemoryVelocityStore()

    return _store


def get_velocity_store() -> VelocityStore:
    if _store is None:
        return init_velocity_store(
            redis_enabled=False,
            redis_client=None,
            ip_ttl=3600,
            domain_ttl=86400,
        )
    return _store
