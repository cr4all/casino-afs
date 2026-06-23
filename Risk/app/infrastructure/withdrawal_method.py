import hashlib
import re

from app.models import TransactionData


def normalize_payment_method_type(value: str | None) -> str | None:
    if not value or not value.strip():
        return None
    normalized = value.strip().lower().replace(" ", "_").replace("-", "_")
    aliases = {
        "bank_transfer": "bank",
        "wire": "bank",
        "iban": "bank",
        "sepa": "bank",
        "cryptocurrency": "crypto",
        "bitcoin": "crypto",
        "ethereum": "crypto",
        "e_wallet": "ewallet",
        "digital_wallet": "ewallet",
    }
    return aliases.get(normalized, normalized)


def normalize_payment_method_key(method_type: str, method_key: str) -> str:
    key = method_key.strip()
    if method_type == "bank":
        return re.sub(r"\s+", "", key.upper())
    if method_type == "crypto":
        return key.lower()
    return key.lower()


def withdrawal_method_storage_key(transaction: TransactionData | None) -> str | None:
    if transaction is None:
        return None

    method_type = normalize_payment_method_type(transaction.payment_method_type)
    raw_key = (transaction.payment_method_key or "").strip()
    if not method_type or not raw_key:
        return None

    normalized = normalize_payment_method_key(method_type, raw_key)
    digest = hashlib.sha256(f"{method_type}:{normalized}".encode()).hexdigest()
    return f"{method_type}:{digest[:32]}"
