import pytest

from app.engines.utils import (
    is_bot_user_agent,
    is_missing_user_agent,
    is_numeric_only,
    is_private_ip,
    is_valid_email_format,
    name_matches_email_local,
)
from tests.factories import build_event


@pytest.mark.parametrize(
    ("email", "expected"),
    [
        ("valid@gmail.com", True),
        ("bad@", False),
        ("@bad.com", False),
        ("spaces @bad.com", False),
    ],
)
def test_is_valid_email_format(email, expected):
    assert is_valid_email_format(email) is expected


@pytest.mark.parametrize(
    ("user_agent", "expected"),
    [
        ("Mozilla/5.0 Chrome/120", False),
        ("python-requests/2.31", True),
        ("Googlebot/2.1", True),
        ("HeadlessChrome/120", True),
    ],
)
def test_is_bot_user_agent(user_agent, expected):
    assert is_bot_user_agent(user_agent) is expected


def test_is_missing_user_agent():
    assert is_missing_user_agent(None) is True
    assert is_missing_user_agent("  ") is True
    assert is_missing_user_agent("Mozilla/5.0") is False


@pytest.mark.parametrize(
    ("ip", "expected"),
    [
        ("192.168.1.1", True),
        ("10.0.0.5", True),
        ("127.0.0.1", True),
        ("172.16.0.1", True),
        ("203.0.113.10", False),
    ],
)
def test_is_private_ip(ip, expected):
    assert is_private_ip(ip) is expected


def test_name_matches_email_local():
    assert name_matches_email_local("John Doe", "john.doe@gmail.com") is True
    assert name_matches_email_local("Jane", "jane@gmail.com") is True
    assert name_matches_email_local("Other", "john@gmail.com") is False


def test_is_numeric_only():
    assert is_numeric_only("12345") is True
    assert is_numeric_only("abc") is False


def test_build_event_factory():
    event = build_event(event_type="player.login", event_id="x1")
    assert event.event_id == "x1"
    assert event.event_type.value == "player.login"
