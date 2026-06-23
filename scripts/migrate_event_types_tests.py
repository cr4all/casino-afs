from pathlib import Path

REPLACEMENTS = [
    ('event_type="signup_failed"', 'event_type="player.signup.failed"'),
    ('event_type="login_failed"', 'event_type="player.login.failed"'),
    ('event_type="signup"', 'event_type="player.signup"'),
    ('event_type="login"', 'event_type="player.login"'),
    ('event_type="withdrawal"', 'event_type="payment.withdraw"'),
    ('event_type="deposit"', 'event_type="payment.deposit"'),
    ('event_type="bet"', 'event_type="wallet.bet"'),
    ('"event_type": "signup_failed"', '"event_type": "player.signup.failed"'),
    ('"event_type": "login_failed"', '"event_type": "player.login.failed"'),
    ('"event_type": "signup"', '"event_type": "player.signup"'),
    ('"event_type": "login"', '"event_type": "player.login"'),
    ('"event_type": "withdrawal"', '"event_type": "payment.withdraw"'),
    ('"event_type": "deposit"', '"event_type": "payment.deposit"'),
    ('"event_type": "bet"', '"event_type": "wallet.bet"'),
    ('("signup", "signup")', '("player.signup", "player.signup")'),
    ('("signup_failed", "signup_failed")', '("player.signup.failed", "player.signup.failed")'),
    ('("login", "login")', '("player.login", "player.login")'),
    ('("login_failed", "login_failed")', '("player.login.failed", "player.login.failed")'),
    ('("deposit", "deposit")', '("payment.deposit", "payment.deposit")'),
    ('("withdrawal", "withdrawal")', '("payment.withdraw", "payment.withdraw")'),
    ('("bet", "bet")', '("wallet.bet", "wallet.bet")'),
    ('("allow", "login", "allow")', '("allow", "player.login", "allow")'),
    ('("block", "withdrawal", "hold_withdrawal")', '("block", "payment.withdraw", "hold_withdrawal")'),
    ('("block", "login_failed", "rate_limit_ip")', '("block", "player.login.failed", "rate_limit_ip")'),
    ('("block", "signup", "reject_signup")', '("block", "player.signup", "reject_signup")'),
    ('("challenge", "login", "require_mfa")', '("challenge", "player.login", "require_mfa")'),
    ('("challenge", "withdrawal", "manual_review_withdrawal")', '("challenge", "payment.withdraw", "manual_review_withdrawal")'),
    ('assert "signup" in body["event_types"]', 'assert "player.signup" in body["event_types"]'),
    ('assert event.event_type.value == "login"', 'assert event.event_type.value == "player.login"'),
    ('"signup",\n        "login"', '"player.signup",\n        "player.login"'),
]

for root in [Path("Risk/tests"), Path("Orchestrator/tests")]:
    for path in root.rglob("*.py"):
        text = path.read_text(encoding="utf-8")
        orig = text
        for old, new in REPLACEMENTS:
            text = text.replace(old, new)
        if text != orig:
            path.write_text(text, encoding="utf-8")
            print("updated", path)
