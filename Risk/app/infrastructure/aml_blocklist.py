from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone

import httpx
from sqlalchemy.orm import sessionmaker

from app import config as static_config
from app.infrastructure.withdrawal_method import (
    normalize_payment_method_key,
    normalize_payment_method_type,
)
from app.models import EventType
from app.runtime_config import get_runtime_config
from shared.db.models import AmlBlocklistEntry

logger = logging.getLogger(__name__)

CRYPTO_METHOD_TYPES = frozenset(
    {"crypto", "cryptocurrency", "bitcoin", "btc", "eth", "ethereum", "usdt", "trx", "tron"}
)
MONEY_BLOCKLIST_EVENT_TYPES = frozenset({EventType.PAYMENT_DEPOSIT, EventType.PAYMENT_WITHDRAW})
COUNTRY_BLOCKLIST_EVENT_TYPES = frozenset(
    {
        EventType.PLAYER_SIGNUP,
        EventType.PLAYER_LOGIN,
        EventType.PAYMENT_DEPOSIT,
        EventType.PAYMENT_WITHDRAW,
    }
)


@dataclass
class BlocklistSyncStatus:
    last_sync_at: datetime | None = None
    last_sync_ok: bool = False
    crypto_count: int = 0
    country_count: int = 0
    last_error: str | None = None


@dataclass
class PayoutBlocklistHit:
    matched: bool
    source: str | None = None


# Backward-compatible alias
CryptoBlocklistHit = PayoutBlocklistHit


def normalize_crypto_wallet(value: str) -> str:
    cleaned = value.strip()
    if cleaned.lower().startswith("0x"):
        return cleaned.lower()
    return cleaned


def is_crypto_payment_method(method_type: str | None) -> bool:
    if not method_type:
        return False
    normalized = normalize_payment_method_type(method_type)
    if not normalized:
        return False
    return (
        normalized in CRYPTO_METHOD_TYPES
        or "crypto" in normalized
        or normalized in {"btc", "eth", "usdt", "trx"}
    )


def _manual_payout_set(method_type: str, values: list[str]) -> set[str]:
    return {
        normalize_payment_method_key(method_type, value)
        for value in values
        if value.strip()
    }


class AmlBlocklistService:
    def __init__(self, session_factory: sessionmaker) -> None:
        self._session_factory = session_factory
        self.sync_status = BlocklistSyncStatus()

    def is_payout_blocked(self, method_type: str | None, method_key: str | None) -> PayoutBlocklistHit:
        config = get_runtime_config().aml.blocklist
        if not config.enabled or not method_type or not method_key:
            return PayoutBlocklistHit(matched=False)

        normalized_type = normalize_payment_method_type(method_type)
        if not normalized_type:
            return PayoutBlocklistHit(matched=False)

        if is_crypto_payment_method(method_type):
            if not config.crypto_enabled:
                return PayoutBlocklistHit(matched=False)
            return self._check_crypto_payout(method_key)

        if normalized_type == "bank":
            if not config.bank_enabled:
                return PayoutBlocklistHit(matched=False)
            return self._check_manual_payout("bank", method_key, config.manual_bank_accounts)

        if normalized_type == "ewallet":
            if not config.ewallet_enabled:
                return PayoutBlocklistHit(matched=False)
            return self._check_manual_payout("ewallet", method_key, config.manual_ewallet_accounts)

        if normalized_type == "card":
            if not config.card_enabled:
                return PayoutBlocklistHit(matched=False)
            return self._check_manual_payout("card", method_key, config.manual_card_accounts)

        return PayoutBlocklistHit(matched=False)

    def is_crypto_blocked(self, wallet: str) -> PayoutBlocklistHit:
        config = get_runtime_config().aml.blocklist
        if not config.enabled or not config.crypto_enabled:
            return PayoutBlocklistHit(matched=False)
        return self._check_crypto_payout(wallet)

    def _check_manual_payout(
        self,
        method_type: str,
        method_key: str,
        manual_values: list[str],
    ) -> PayoutBlocklistHit:
        normalized_key = normalize_payment_method_key(method_type, method_key)
        if not normalized_key:
            return PayoutBlocklistHit(matched=False)
        manual = _manual_payout_set(method_type, manual_values)
        if normalized_key in manual:
            return PayoutBlocklistHit(matched=True, source="manual")
        return PayoutBlocklistHit(matched=False)

    def _check_crypto_payout(self, wallet: str) -> PayoutBlocklistHit:
        config = get_runtime_config().aml.blocklist
        normalized = normalize_crypto_wallet(wallet)
        if not normalized:
            return PayoutBlocklistHit(matched=False)

        manual = {normalize_crypto_wallet(v) for v in config.manual_crypto_wallets if v.strip()}
        if normalized in manual:
            return PayoutBlocklistHit(matched=True, source="manual")

        with self._session_factory() as session:
            row = (
                session.query(AmlBlocklistEntry)
                .filter(
                    AmlBlocklistEntry.entry_type == "crypto_wallet",
                    AmlBlocklistEntry.value_normalized == normalized,
                )
                .first()
            )
            if row is not None:
                return PayoutBlocklistHit(matched=True, source=row.source)

        if not self.sync_status.last_sync_ok and config.fail_open:
            return PayoutBlocklistHit(matched=False)

        return PayoutBlocklistHit(matched=False)

    def is_country_blocked(self, country_code: str) -> bool:
        config = get_runtime_config().aml.blocklist
        if not config.enabled or not config.country_enabled:
            return False

        country = country_code.strip().upper()
        if not country:
            return False

        manual = {code.strip().upper() for code in config.manual_countries if code.strip()}
        if country in manual:
            return True

        if config.use_lists_sanctioned_countries:
            if country in get_runtime_config().list_set("sanctioned_countries"):
                return True

        with self._session_factory() as session:
            row = (
                session.query(AmlBlocklistEntry)
                .filter(
                    AmlBlocklistEntry.entry_type == "country",
                    AmlBlocklistEntry.value_normalized == country,
                )
                .first()
            )
            if row is not None:
                return True

        if not self.sync_status.last_sync_ok and config.fail_open:
            return False

        return False

    def sync_ofac_lists(self) -> BlocklistSyncStatus:
        config = get_runtime_config().aml.blocklist
        now = datetime.now(timezone.utc)
        crypto_addresses: set[str] = set()
        countries: set[str] = set()
        crypto_error: str | None = None

        if config.sync_ofac_crypto_enabled:
            try:
                crypto_addresses = self._fetch_ofac_crypto_wallets()
            except Exception as exc:
                crypto_error = str(exc)
                logger.exception("OFAC crypto wallet sync failed")

        if config.sync_ofac_countries_enabled:
            countries = set(static_config.OFAC_SANCTIONED_COUNTRIES)

        return self._persist_ofac_sync(
            config=config,
            now=now,
            crypto_addresses=crypto_addresses,
            countries=countries,
            crypto_error=crypto_error,
        )

    async def sync_ofac_lists_async(self) -> BlocklistSyncStatus:
        config = get_runtime_config().aml.blocklist
        now = datetime.now(timezone.utc)
        crypto_addresses: set[str] = set()
        countries: set[str] = set()
        crypto_error: str | None = None

        if config.sync_ofac_crypto_enabled:
            try:
                crypto_addresses = await self._fetch_ofac_crypto_wallets_async()
            except Exception as exc:
                crypto_error = str(exc)
                logger.exception("OFAC crypto wallet sync failed")

        if config.sync_ofac_countries_enabled:
            countries = set(static_config.OFAC_SANCTIONED_COUNTRIES)

        return self._persist_ofac_sync(
            config=config,
            now=now,
            crypto_addresses=crypto_addresses,
            countries=countries,
            crypto_error=crypto_error,
        )

    def _persist_ofac_sync(
        self,
        *,
        config,
        now: datetime,
        crypto_addresses: set[str],
        countries: set[str],
        crypto_error: str | None,
    ) -> BlocklistSyncStatus:
        try:
            with self._session_factory() as session:
                if config.sync_ofac_crypto_enabled and crypto_addresses:
                    session.query(AmlBlocklistEntry).filter(
                        AmlBlocklistEntry.entry_type == "crypto_wallet",
                        AmlBlocklistEntry.source == "ofac",
                    ).delete(synchronize_session=False)
                    for address in sorted(crypto_addresses):
                        session.add(
                            AmlBlocklistEntry(
                                entry_type="crypto_wallet",
                                value_normalized=address,
                                source="ofac",
                                updated_at=now,
                            )
                        )

                if config.sync_ofac_countries_enabled:
                    session.query(AmlBlocklistEntry).filter(
                        AmlBlocklistEntry.entry_type == "country",
                        AmlBlocklistEntry.source == "ofac",
                    ).delete(synchronize_session=False)
                    for country in sorted(countries):
                        session.add(
                            AmlBlocklistEntry(
                                entry_type="country",
                                value_normalized=country,
                                source="ofac",
                                updated_at=now,
                            )
                        )

                session.commit()

            crypto_ok = not config.sync_ofac_crypto_enabled or bool(crypto_addresses)
            countries_ok = not config.sync_ofac_countries_enabled or bool(countries)
            sync_ok = crypto_ok and countries_ok and crypto_error is None

            self.sync_status = BlocklistSyncStatus(
                last_sync_at=now,
                last_sync_ok=sync_ok,
                crypto_count=len(crypto_addresses),
                country_count=len(countries),
                last_error=crypto_error,
            )
            logger.info(
                "AML blocklist sync complete (ok=%s): %s crypto wallets, %s countries",
                sync_ok,
                len(crypto_addresses),
                len(countries),
            )
            return self.sync_status
        except Exception as exc:
            logger.exception("AML blocklist DB update failed")
            self.sync_status = BlocklistSyncStatus(
                last_sync_at=now,
                last_sync_ok=False,
                crypto_count=self.sync_status.crypto_count,
                country_count=self.sync_status.country_count,
                last_error=str(exc),
            )
            return self.sync_status

    def get_status(self) -> dict:
        with self._session_factory() as session:
            crypto_db = (
                session.query(AmlBlocklistEntry)
                .filter(AmlBlocklistEntry.entry_type == "crypto_wallet")
                .count()
            )
            country_db = (
                session.query(AmlBlocklistEntry)
                .filter(AmlBlocklistEntry.entry_type == "country")
                .count()
            )

        config = get_runtime_config().aml.blocklist
        return {
            "enabled": config.enabled,
            "crypto_enabled": config.crypto_enabled,
            "bank_enabled": config.bank_enabled,
            "ewallet_enabled": config.ewallet_enabled,
            "card_enabled": config.card_enabled,
            "country_enabled": config.country_enabled,
            "sync_ofac_crypto_enabled": config.sync_ofac_crypto_enabled,
            "sync_ofac_countries_enabled": config.sync_ofac_countries_enabled,
            "last_sync_at": self.sync_status.last_sync_at.isoformat() if self.sync_status.last_sync_at else None,
            "last_sync_ok": self.sync_status.last_sync_ok,
            "last_error": self.sync_status.last_error,
            "crypto_entries_in_db": crypto_db,
            "country_entries_in_db": country_db,
            "manual_crypto_wallets": len(config.manual_crypto_wallets),
            "manual_bank_accounts": len(config.manual_bank_accounts),
            "manual_ewallet_accounts": len(config.manual_ewallet_accounts),
            "manual_card_accounts": len(config.manual_card_accounts),
            "manual_countries": len(config.manual_countries),
            "source": "brave-intl/ofac-sanctioned-digital-currency-addresses (Treasury SDN derivative)",
        }

    @staticmethod
    def _parse_ofac_list_response(response, asset: str, url: str) -> set[str]:
        if response.status_code == 404:
            logger.debug("OFAC list not found for asset %s (%s)", asset, url)
            return set()

        if 400 <= response.status_code < 600:
            raise RuntimeError(
                f"OFAC crypto list fetch failed for {asset}: HTTP {response.status_code} from {url}"
            )

        addresses: set[str] = set()
        for line in response.text.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            addresses.add(normalize_crypto_wallet(line))
        return addresses

    def _fetch_ofac_crypto_wallets(self) -> set[str]:
        addresses: set[str] = set()
        timeout = httpx.Timeout(30.0, connect=10.0)

        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            for asset in static_config.OFAC_CRYPTO_LIST_ASSETS:
                url = static_config.ofac_crypto_list_url(asset)
                response = client.get(url)
                addresses |= self._parse_ofac_list_response(response, asset, url)

        if not addresses:
            raise RuntimeError(
                "No OFAC crypto wallet addresses fetched from third-party lists "
                f"(attempted {len(static_config.OFAC_CRYPTO_LIST_ASSETS)} assets). "
                "Check outbound HTTPS to raw.githubusercontent.com."
            )

        return addresses

    async def _fetch_ofac_crypto_wallets_async(self) -> set[str]:
        addresses: set[str] = set()
        timeout = httpx.Timeout(30.0, connect=10.0)

        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            for asset in static_config.OFAC_CRYPTO_LIST_ASSETS:
                url = static_config.ofac_crypto_list_url(asset)
                response = await client.get(url)
                addresses |= self._parse_ofac_list_response(response, asset, url)

        if not addresses:
            raise RuntimeError(
                "No OFAC crypto wallet addresses fetched from third-party lists "
                f"(attempted {len(static_config.OFAC_CRYPTO_LIST_ASSETS)} assets). "
                "Check outbound HTTPS to raw.githubusercontent.com."
            )

        return addresses


_service: AmlBlocklistService | None = None


def init_aml_blocklist_service(session_factory: sessionmaker) -> AmlBlocklistService:
    global _service
    _service = AmlBlocklistService(session_factory)
    return _service


def get_aml_blocklist_service() -> AmlBlocklistService:
    if _service is None:
        raise RuntimeError("AML blocklist service is not initialized")
    return _service
