import re

from app.runtime_config import get_runtime_config


def normalize_text(value: str | None) -> str:
    return (value or "").strip()


def is_bot_user_agent(user_agent: str | None) -> bool:
    if not user_agent:
        return False

    lowered = user_agent.lower()
    return any(token in lowered for token in get_runtime_config().list_set("bot_user_agent_tokens"))


def is_missing_user_agent(user_agent: str | None) -> bool:
    return not normalize_text(user_agent)


def is_valid_email_format(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))


def split_email(email: str) -> tuple[str, str]:
    local, domain = email.rsplit("@", 1)
    return local, domain


def is_numeric_only(value: str) -> bool:
    return bool(value) and value.isdigit()


def name_matches_email_local(name: str, email: str | None) -> bool:
    if not email or "@" not in email:
        return False

    local = email.split("@", 1)[0].lower()
    return name.lower().replace(" ", "") == local.replace(".", "")


def is_private_ip(ip: str) -> bool:
    if ip.startswith("10.") or ip.startswith("192.168.") or ip.startswith("127."):
        return True

    if ip.startswith("172."):
        parts = ip.split(".")
        if len(parts) >= 2 and parts[1].isdigit() and 16 <= int(parts[1]) <= 31:
            return True

    return ip == "::1"
