from unittest.mock import MagicMock, patch

import pytest

from app.infrastructure.aml_blocklist import AmlBlocklistService


def test_fetch_ofac_crypto_wallets_uses_sanctioned_addresses_filename():
    service = AmlBlocklistService(session_factory=MagicMock())
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = "0xabc123def4567890abcdef1234567890abcdef12\n"
    mock_response.raise_for_status = MagicMock()

    with patch("app.infrastructure.aml_blocklist.httpx.Client") as client_cls:
        client = MagicMock()
        client.__enter__ = MagicMock(return_value=client)
        client.__exit__ = MagicMock(return_value=False)
        client.get.return_value = mock_response
        client_cls.return_value = client

        addresses = service._fetch_ofac_crypto_wallets()

    assert "0xabc123def4567890abcdef1234567890abcdef12" in addresses
    first_url = client.get.call_args_list[0].args[0]
    assert "sanctioned_addresses_XBT.txt" in first_url
    assert "/lists/XBT.txt" not in first_url


def test_fetch_ofac_crypto_wallets_aborts_on_http_500():
    service = AmlBlocklistService(session_factory=MagicMock())
    ok_response = MagicMock()
    ok_response.status_code = 200
    ok_response.text = "0xabc123def4567890abcdef1234567890abcdef12\n"
    error_response = MagicMock()
    error_response.status_code = 500
    error_response.text = "Internal Server Error"

    with patch("app.infrastructure.aml_blocklist.httpx.Client") as client_cls:
        client = MagicMock()
        client.__enter__ = MagicMock(return_value=client)
        client.__exit__ = MagicMock(return_value=False)
        client.get.side_effect = [ok_response, error_response]
        client_cls.return_value = client

        with pytest.raises(RuntimeError, match="HTTP 500"):
            service._fetch_ofac_crypto_wallets()

    assert client.get.call_count == 2


def test_fetch_ofac_crypto_wallets_aborts_on_http_400():
    service = AmlBlocklistService(session_factory=MagicMock())
    error_response = MagicMock()
    error_response.status_code = 400
    error_response.text = "Bad Request"

    with patch("app.infrastructure.aml_blocklist.httpx.Client") as client_cls:
        client = MagicMock()
        client.__enter__ = MagicMock(return_value=client)
        client.__exit__ = MagicMock(return_value=False)
        client.get.return_value = error_response
        client_cls.return_value = client

        with pytest.raises(RuntimeError, match="HTTP 400"):
            service._fetch_ofac_crypto_wallets()

    assert client.get.call_count == 1
