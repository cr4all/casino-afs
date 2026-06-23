import re

from app.runtime_config import get_runtime_config
from app.engines.utils import is_valid_email_format, split_email
from app.models import CanonicalEvent, EventType


def evaluate(event: CanonicalEvent) -> tuple[int, list[str]]:
    email = event.user.email
    score = 0
    signals: list[str] = []

    signup_or_login = event.event_type in {EventType.PLAYER_SIGNUP, EventType.PLAYER_LOGIN}

    if not email:
        if event.event_type == EventType.PLAYER_SIGNUP:
            return 85, ["missing_email_on_signup"]
        if event.event_type == EventType.PLAYER_LOGIN:
            return 40, ["missing_email_on_login"]
        return 0, []

    email = email.lower().strip()

    if not is_valid_email_format(email):
        return 70, ["invalid_email_format"]

    local, domain = split_email(email)
    config = get_runtime_config()
    disposable_domains = config.list_set("disposable_domains")
    suspicious_email_tlds = config.list_set("suspicious_email_tlds")
    role_based_email_locals = config.list_set("role_based_email_locals")
    suspicious_email_local_tokens = config.list_set("suspicious_email_local_tokens")

    if domain in disposable_domains:
        score += 75
        signals.append("disposable_email")

    if any(domain.endswith(tld) for tld in suspicious_email_tlds):
        score += 25
        signals.append("suspicious_email_tld")

    if local in role_based_email_locals:
        score += 30
        signals.append("role_based_email")

    if any(token in local for token in suspicious_email_local_tokens):
        score += 25
        signals.append("suspicious_email_pattern")

    if len(local) > 12 and sum(char.isdigit() for char in local) >= 4:
        score += 30
        signals.append("random_email_pattern")

    if local.count("+") > 1:
        score += 20
        signals.append("email_alias_abuse")

    if ".." in email or email.startswith(".") or "@" not in email[1:]:
        score += 40
        signals.append("malformed_email_structure")

    if signup_or_login and len(local) <= 2:
        score += 20
        signals.append("short_email_local_part")

    if event.event_type == EventType.PLAYER_SIGNUP and re.fullmatch(r"[a-z0-9._-]+", local) and sum(c.isdigit() for c in local) >= len(local) // 2:
        score += 20
        signals.append("auto_generated_email")

    return min(score, 100), signals
