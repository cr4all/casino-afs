import json
import logging
import time
from dataclasses import asdict, dataclass, field

import httpx
import redis

from app.runtime_config import get_runtime_config
from app.settings import Settings

logger = logging.getLogger(__name__)

IP_API_URL = "http://ip-api.com/json/{ip}?fields=status,message,proxy,hosting,countryCode,query"
IPPRIV_SECURITY_URL = "https://api.ippriv.com/api/security/{ip}"


@dataclass
class IpIntelResult:
    ip: str
    is_vpn: bool = False
    is_proxy: bool = False
    is_tor: bool = False
    is_hosting: bool = False
    country_code: str | None = None
    provider: str = "none"
    lookup_failed: bool = False

    @property
    def is_anonymous(self) -> bool:
        return self.is_vpn or self.is_proxy or self.is_tor


@dataclass
class _CacheEntry:
    result: IpIntelResult
    expires_at: float


class IpIntelligenceService:
    """Lookup VPN/proxy/hosting signals using free public IP intelligence APIs."""

    def __init__(self, settings: Settings, redis_client: redis.Redis | None = None) -> None:
        self._settings = settings
        self._redis = redis_client
        self._memory_cache: dict[str, _CacheEntry] = {}

    def lookup(self, ip: str) -> IpIntelResult:
        ip_intel = get_runtime_config().ip_intel
        if not ip_intel.enabled:
            return IpIntelResult(ip=ip, provider="disabled")

        if self._is_non_public_ip(ip):
            return IpIntelResult(ip=ip, provider="skipped")

        cached = self._get_cached(ip)
        if cached is not None:
            return cached

        result = self._lookup_live(ip)
        self._set_cached(ip, result)
        return result

    def _lookup_live(self, ip: str) -> IpIntelResult:
        try:
            result = self._lookup_ip_api(ip)
            if not result.lookup_failed:
                return result
        except Exception:
            logger.exception("Primary IP intelligence provider failed for %s", ip)

        try:
            return self._lookup_ippriv(ip)
        except Exception:
            logger.exception("Fallback IP intelligence provider failed for %s", ip)
            if get_runtime_config().ip_intel.fail_open:
                return IpIntelResult(ip=ip, provider="fail_open", lookup_failed=True)
            return IpIntelResult(
                ip=ip,
                is_vpn=True,
                is_proxy=True,
                provider="fail_closed",
                lookup_failed=True,
            )

    def _lookup_ip_api(self, ip: str) -> IpIntelResult:
        ip_intel = get_runtime_config().ip_intel
        response = httpx.get(
            IP_API_URL.format(ip=ip),
            timeout=ip_intel.timeout_seconds,
        )
        if response.status_code != 200:
            logger.warning("ip-api.com HTTP %s for %s", response.status_code, ip)
            return IpIntelResult(ip=ip, provider="ip-api", lookup_failed=True)

        payload = response.json()

        if payload.get("status") != "success":
            message = payload.get("message", "unknown error")
            logger.warning("ip-api.com lookup failed for %s: %s", ip, message)
            return IpIntelResult(ip=ip, provider="ip-api", lookup_failed=True)

        is_proxy = bool(payload.get("proxy"))
        is_hosting = bool(payload.get("hosting"))

        return IpIntelResult(
            ip=ip,
            is_vpn=is_proxy,
            is_proxy=is_proxy,
            is_hosting=is_hosting,
            country_code=payload.get("countryCode"),
            provider="ip-api",
        )

    def _lookup_ippriv(self, ip: str) -> IpIntelResult:
        ip_intel = get_runtime_config().ip_intel
        response = httpx.get(
            IPPRIV_SECURITY_URL.format(ip=ip),
            timeout=ip_intel.timeout_seconds,
        )
        if response.status_code != 200:
            logger.warning("ippriv.com HTTP %s for %s", response.status_code, ip)
            return IpIntelResult(ip=ip, provider="ippriv", lookup_failed=True)

        payload = response.json()

        return IpIntelResult(
            ip=ip,
            is_vpn=bool(payload.get("isVPN")),
            is_proxy=bool(payload.get("isProxy")),
            is_tor=bool(payload.get("isTor")),
            is_hosting=bool(payload.get("isHosting")),
            provider="ippriv",
        )

    def _cache_key(self, ip: str) -> str:
        return f"ip_intel:{ip}"

    def _get_cached(self, ip: str) -> IpIntelResult | None:
        if self._redis is not None:
            cached = self._redis.get(self._cache_key(ip))
            if cached:
                return IpIntelResult(**json.loads(cached))

        entry = self._memory_cache.get(ip)
        if entry and entry.expires_at > time.time():
            return entry.result

        return None

    def _set_cached(self, ip: str, result: IpIntelResult) -> None:
        ttl = get_runtime_config().ip_intel.cache_ttl_seconds
        payload = json.dumps(asdict(result))

        if self._redis is not None:
            self._redis.setex(self._cache_key(ip), ttl, payload)
            return

        self._memory_cache[ip] = _CacheEntry(
            result=result,
            expires_at=time.time() + ttl,
        )

    @staticmethod
    def _is_non_public_ip(ip: str) -> bool:
        if ip.startswith("127.") or ip == "::1":
            return True
        if ip.startswith("10.") or ip.startswith("192.168."):
            return True
        if ip.startswith("172."):
            parts = ip.split(".")
            if len(parts) >= 2 and parts[1].isdigit() and 16 <= int(parts[1]) <= 31:
                return True
        return False


_service: IpIntelligenceService | None = None


def init_ip_intelligence_service(settings: Settings, redis_client: redis.Redis | None = None) -> IpIntelligenceService:
    global _service
    _service = IpIntelligenceService(settings, redis_client)
    return _service


def get_ip_intelligence_service() -> IpIntelligenceService:
    if _service is None:
        from app.settings import settings

        return init_ip_intelligence_service(settings)
    return _service
