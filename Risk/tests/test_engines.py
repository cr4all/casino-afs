from app.engines import email, phone, ip, identity, device, signup, login, transaction
from tests.factories import build_event


def test_email_clean_signup():
    score, signals = email.evaluate(build_event(event_type="player.signup"))
    assert score == 0
    assert signals == []


def test_email_disposable_signup():
    event = build_event(
        user={"user_id": "u1", "email": "bad@mailinator.com", "phone": None, "name": "John"},
    )
    score, signals = email.evaluate(event)
    assert score >= 70
    assert "disposable_email" in signals


def test_email_missing_on_signup():
    event = build_event(user={"user_id": "u1", "email": None, "phone": None, "name": "John"})
    score, signals = email.evaluate(event)
    assert score == 85
    assert signals == ["missing_email_on_signup"]


def test_email_missing_on_login():
    event = build_event(
        event_type="player.login",
        user={"user_id": "u1", "email": None, "phone": "+4912345678", "name": "John"},
    )
    score, signals = email.evaluate(event)
    assert score == 40
    assert "missing_email_on_login" in signals


def test_email_invalid_format():
    event = build_event(user={"user_id": "u1", "email": "not-an-email", "phone": None, "name": "John"})
    score, signals = email.evaluate(event)
    assert score == 70
    assert "invalid_email_format" in signals


def test_email_suspicious_tld_and_role_based():
    event = build_event(
        user={"user_id": "u1", "email": "admin@company.xyz", "phone": None, "name": "John"},
    )
    score, signals = email.evaluate(event)
    assert "suspicious_email_tld" in signals
    assert "role_based_email" in signals


def test_email_skipped_for_deposit():
    event = build_event(event_type="payment.deposit", transaction={"amount": 100, "currency": "EUR"})
    score, signals = email.evaluate(event)
    assert score == 0
    assert signals == []


def test_phone_valid_signup():
    score, signals = phone.evaluate(build_event(event_type="player.signup"))
    assert score == 0
    assert signals == []


def test_phone_invalid_format():
    event = build_event(
        user={"user_id": "u1", "email": "a@b.com", "phone": "abc-phone", "name": "John"},
    )
    score, signals = phone.evaluate(event)
    assert "invalid_phone_format" in signals


def test_phone_repeated_digits():
    event = build_event(
        user={"user_id": "u1", "email": "a@b.com", "phone": "1111111111", "name": "John"},
    )
    score, signals = phone.evaluate(event)
    assert "repeated_digit_phone" in signals


def test_phone_missing_on_signup():
    event = build_event(
        user={"user_id": "u1", "email": "a@b.com", "phone": None, "name": "John"},
    )
    score, signals = phone.evaluate(event)
    assert "missing_phone_on_signup" in signals


def test_ip_clean():
    score, signals = ip.evaluate(build_event())
    assert score == 0
    assert signals == []


def test_ip_vpn_detected(mock_ip_intelligence):
    from app.infrastructure.ip_intelligence import IpIntelResult

    mock_ip_intelligence._result_by_ip["185.220.101.1"] = IpIntelResult(
        ip="185.220.101.1",
        is_vpn=True,
        is_proxy=True,
        provider="mock",
    )
    event = build_event(
        context={
            "ip": "185.220.101.1",
            "user_agent": "Mozilla/5.0",
            "device_id": "d1",
            "country": "DE",
        },
    )
    score, signals = ip.evaluate(event)
    assert "vpn_detected" in signals
    assert "vpn_or_proxy_detected" in signals


def test_ip_missing_on_signup():
    event = build_event(context={"ip": None, "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "DE"})
    score, signals = ip.evaluate(event)
    assert score == 35
    assert "missing_ip" in signals


def test_ip_high_risk_country():
    event = build_event(context={"ip": "203.0.113.1", "user_agent": "Mozilla/5.0", "device_id": "d1", "country": "NG"})
    score, signals = ip.evaluate(event)
    assert "high_risk_country" in signals


def test_identity_clean():
    score, signals = identity.evaluate(build_event())
    assert score == 0
    assert signals == []


def test_identity_generic_name():
    event = build_event(user={"user_id": "u1", "email": "a@b.com", "phone": "+49123", "name": "test"})
    score, signals = identity.evaluate(event)
    assert "generic_name" in signals


def test_identity_missing_name_on_signup():
    event = build_event(user={"user_id": "u1", "email": "a@b.com", "phone": "+49123", "name": None})
    score, signals = identity.evaluate(event)
    assert "missing_name_on_signup" in signals


def test_identity_name_equals_email():
    event = build_event(user={"user_id": "u1", "email": "john@gmail.com", "phone": "+49123", "name": "john@gmail.com"})
    score, signals = identity.evaluate(event)
    assert "name_equals_email" in signals


def test_device_clean_login():
    score, signals = device.evaluate(build_event(event_type="player.login"))
    assert score == 0
    assert signals == []


def test_device_bot_user_agent():
    event = build_event(
        event_type="player.login",
        context={"ip": "203.0.113.1", "user_agent": "python-requests/2.0", "device_id": "d1", "country": "DE"},
    )
    score, signals = device.evaluate(event)
    assert "bot_user_agent" in signals


def test_device_skipped_for_deposit():
    event = build_event(event_type="payment.deposit", transaction={"amount": 50, "currency": "EUR"})
    score, signals = device.evaluate(event)
    assert score == 0
    assert signals == []


def test_signup_suspicious_referrer():
    event = build_event(metadata={"channel": "web", "session_id": "s1", "referrer": "unknown"})
    score, signals = signup.evaluate(event)
    assert "suspicious_referrer" in signals


def test_signup_skipped_for_login():
    score, signals = signup.evaluate(build_event(event_type="player.login"))
    assert score == 0
    assert signals == []


def test_login_automated_attempt():
    event = build_event(
        event_type="player.login",
        context={"ip": "203.0.113.1", "user_agent": "curl/8.0", "device_id": "d1", "country": "DE"},
        metadata={"channel": "web", "session_id": None, "referrer": "google.com"},
    )
    score, signals = login.evaluate(event)
    assert "automated_login_attempt" in signals


def test_login_missing_identifier():
    event = build_event(
        event_type="player.login",
        user={"user_id": "u1", "email": None, "phone": None, "name": "John"},
    )
    score, signals = login.evaluate(event)
    assert "missing_login_identifier" in signals


def test_login_skipped_for_signup():
    score, signals = login.evaluate(build_event(event_type="player.signup"))
    assert score == 0
    assert signals == []


def test_transaction_high_amount():
    event = build_event(
        event_type="payment.withdraw",
        transaction={"amount": 15000, "currency": "EUR"},
    )
    score, signals = transaction.evaluate(event)
    assert "large_withdrawal_review" in signals
    assert "cashout_review_required" in signals


def test_transaction_missing_amount():
    event = build_event(event_type="payment.deposit", transaction={"amount": None, "currency": "EUR"})
    score, signals = transaction.evaluate(event)
    assert score == 25
    assert signals == ["missing_transaction_amount"]


def test_transaction_skipped_for_signup():
    score, signals = transaction.evaluate(build_event(event_type="player.signup"))
    assert score == 0
    assert signals == []
