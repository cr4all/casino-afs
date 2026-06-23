import re

from app.runtime_config import get_runtime_config

# FingerprintJS OSS visitorId: alphanumeric + underscores/hyphens
FINGERPRINT_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")


def is_valid_fingerprint(value: str | None) -> bool:
    if not value:
        return False

    fingerprint = get_runtime_config().fingerprint
    normalized = value.strip()
    suspicious_values = {item.lower() for item in fingerprint.suspicious_values}
    if normalized.lower() in suspicious_values:
        return False

    if not (fingerprint.min_length <= len(normalized) <= fingerprint.max_length):
        return False

    return bool(FINGERPRINT_PATTERN.match(normalized))


def normalize_fingerprint(value: str | None) -> str | None:
    if not value:
        return None
    return value.strip()
