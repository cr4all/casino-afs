from app.infrastructure.fingerprint_validator import is_valid_fingerprint
from app.infrastructure.user_agent_parser import parse_user_agent
from app.engines import fingerprint as fingerprint_engine
from tests.factories import build_event


def test_is_valid_fingerprint_accepts_fingerprintjs_format():
    assert is_valid_fingerprint("a1b2c3d4e5f6789012345678abcdef01") is True
    assert is_valid_fingerprint("test") is False
    assert is_valid_fingerprint("unknown") is False


def test_parse_user_agent_detects_emulator():
    parsed = parse_user_agent(
        "Mozilla/5.0 (Linux; Android 11; sdk_gphone64_x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
    )
    assert parsed.is_emulator is True
    assert parsed.is_mobile is True


def test_fingerprint_missing_on_web_signup():
    event = build_event(
        context={
            "ip": "203.0.113.10",
            "user_agent": "Mozilla/5.0 Chrome/120",
            "device_id": "d1",
            "country": "DE",
            "fingerprint": None,
        },
    )
    score, signals = fingerprint_engine.evaluate(event)
    assert "missing_fingerprint" in signals


def test_fingerprint_invalid_value():
    event = build_event(
        context={
            "ip": "203.0.113.10",
            "user_agent": "Mozilla/5.0 Chrome/120",
            "device_id": "d1",
            "country": "DE",
            "fingerprint": "bad",
        },
    )
    score, signals = fingerprint_engine.evaluate(event)
    assert "invalid_fingerprint" in signals


def test_fingerprint_platform_mismatch():
    event = build_event(
        context={
            "ip": "203.0.113.10",
            "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
            "device_id": "d1",
            "country": "DE",
            "fingerprint": "a1b2c3d4e5f6789012345678abcdef01",
            "platform": "Win32",
        },
    )
    score, signals = fingerprint_engine.evaluate(event)
    assert "platform_user_agent_mismatch" in signals


def test_device_emulator_signal():
    from app.engines import device as device_engine

    event = build_event(
        context={
            "ip": "203.0.113.10",
            "user_agent": "Mozilla/5.0 (Linux; Android 11; sdk_gphone64_x86_64) Chrome/120.0.0.0 Mobile",
            "device_id": "d1",
            "country": "DE",
            "fingerprint": "a1b2c3d4e5f6789012345678abcdef01",
        },
    )
    score, signals = device_engine.evaluate(event)
    assert "emulator_detected" in signals


def test_velocity_multi_account_same_fingerprint():
    from app.engines import velocity

    fp = "fp_shared_abuse_case_1234567890ab"
    for index in range(5):
        velocity.evaluate(
            build_event(
                event_id=f"fp_signup_{index}",
                event_type="player.signup",
                user={"user_id": f"u{index}", "email": f"u{index}@gmail.com", "phone": None, "name": "User"},
                context={
                    "ip": f"203.0.113.{index}",
                    "user_agent": "Mozilla/5.0 Chrome/120",
                    "device_id": f"d{index}",
                    "country": "DE",
                    "fingerprint": fp,
                },
            ),
        )

    score, signals = velocity.evaluate(
        build_event(
            event_id="fp_signup_final",
            event_type="player.signup",
            user={"user_id": "u_final", "email": "final@gmail.com", "phone": None, "name": "User"},
            context={
                "ip": "203.0.113.99",
                "user_agent": "Mozilla/5.0 Chrome/120",
                "device_id": "d_final",
                "country": "DE",
                "fingerprint": fp,
            },
        ),
    )
    assert "multi_account_fingerprint_abuse" in signals
