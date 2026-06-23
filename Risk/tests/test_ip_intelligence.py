from unittest.mock import MagicMock, patch

from app.infrastructure.ip_intelligence import IpIntelligenceService
from app.settings import Settings


def _mock_response(payload: dict, status_code: int = 200) -> MagicMock:
    response = MagicMock()
    response.status_code = status_code
    response.json.return_value = payload
    return response


def test_ip_api_provider_parses_vpn_proxy():
    service = IpIntelligenceService(Settings(ip_intel_enabled=True))

    with patch(
        "app.infrastructure.ip_intelligence.httpx.get",
        return_value=_mock_response(
            {"status": "success", "proxy": True, "hosting": False, "countryCode": "NL", "query": "185.1.1.1"},
        ),
    ):
        result = service._lookup_ip_api("185.1.1.1")

    assert result.is_vpn is True
    assert result.is_proxy is True
    assert result.country_code == "NL"
    assert result.provider == "ip-api"


def test_ippriv_provider_parses_explicit_vpn():
    service = IpIntelligenceService(Settings(ip_intel_enabled=True))

    with patch(
        "app.infrastructure.ip_intelligence.httpx.get",
        return_value=_mock_response(
            {
                "ip": "185.2.2.2",
                "isVPN": True,
                "isProxy": False,
                "isTor": False,
                "isHosting": False,
            },
        ),
    ):
        result = service._lookup_ippriv("185.2.2.2")

    assert result.is_vpn is True
    assert result.is_proxy is False
    assert result.provider == "ippriv"


def test_lookup_uses_cache_on_second_call():
    service = IpIntelligenceService(Settings(ip_intel_enabled=True, ip_intel_cache_ttl_seconds=3600))

    with patch(
        "app.infrastructure.ip_intelligence.httpx.get",
        return_value=_mock_response(
            {"status": "success", "proxy": False, "hosting": True, "countryCode": "US", "query": "8.8.8.8"},
        ),
    ) as mocked_get:
        first = service.lookup("8.8.8.8")
        second = service.lookup("8.8.8.8")

    assert mocked_get.call_count == 1
    assert first.provider == "ip-api"
    assert second.provider == "ip-api"
    assert second.is_hosting is True


def test_lookup_fail_open():
    service = IpIntelligenceService(Settings(ip_intel_enabled=True, ip_intel_fail_open=True))

    with patch("app.infrastructure.ip_intelligence.httpx.get", side_effect=TimeoutError("timeout")):
        result = service.lookup("203.0.113.55")

    assert result.lookup_failed is True
    assert result.is_vpn is False
    assert result.provider == "fail_open"


def test_lookup_skips_private_ip():
    service = IpIntelligenceService(Settings(ip_intel_enabled=True))
    result = service.lookup("192.168.1.50")
    assert result.provider == "skipped"


def test_ip_engine_scores_tor(mock_ip_intelligence):
    from app.engines import ip as ip_engine
    from app.infrastructure.ip_intelligence import IpIntelResult
    from tests.factories import build_event

    mock_ip_intelligence._result_by_ip["185.3.3.3"] = IpIntelResult(
        ip="185.3.3.3",
        is_tor=True,
        provider="mock",
    )
    score, signals = ip_engine.evaluate(
        build_event(context={"ip": "185.3.3.3", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "DE"}),
    )
    assert "tor_exit_node" in signals
    assert score >= 70
