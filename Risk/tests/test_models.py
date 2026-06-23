import pytest

from tests.factories import build_event


@pytest.mark.parametrize(
    ("event_type", "expected"),
    [
        ("player.signup", "player.signup"),
        ("player.signup.failed", "player.signup.failed"),
        ("player.login", "player.login"),
        ("player.login.failed", "player.login.failed"),
        ("payment.deposit", "payment.deposit"),
        ("payment.withdraw", "payment.withdraw"),
        ("wallet.bet", "wallet.bet"),
        ("game.bet", "game.bet"),
        ("bonus.created", "bonus.created"),
    ],
)
def test_event_type_enum(event_type, expected):
    event = build_event(event_type=event_type)
    assert event.event_type.value == expected
