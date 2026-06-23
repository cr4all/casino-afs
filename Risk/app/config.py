# --- iGaming / casino platform configuration ---

DISPOSABLE_DOMAINS = {
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "yopmail.com",
    "trashmail.com",
    "getnada.com",
    "sharklasers.com",
    "dispostable.com",
}

VPN_IPS = set()  # Deprecated — use IP intelligence API in infrastructure/ip_intelligence.py

GENERIC_NAMES = {
    "test",
    "user",
    "admin",
    "demo",
    "fake",
    "guest",
    "anonymous",
    "null",
    "undefined",
    "nobody",
}

ROLE_BASED_EMAIL_LOCALS = {
    "admin",
    "support",
    "info",
    "contact",
    "sales",
    "help",
    "noreply",
    "no-reply",
}

SUSPICIOUS_EMAIL_TLDS = {
    ".xyz",
    ".top",
    ".click",
    ".work",
    ".buzz",
    ".icu",
    ".cam",
    ".rest",
}

SUSPICIOUS_EMAIL_LOCAL_TOKENS = {
    "test",
    "user",
    "admin",
    "fake",
    "temp",
    "spam",
    "trash",
    "bot",
    "null",
}

# Countries with elevated fraud rates in iGaming
HIGH_RISK_COUNTRIES = {
    "NG",
}

# Sanctioned or gambling-prohibited jurisdictions — hard block on money events
SANCTIONED_COUNTRIES = {
    "IR",
}

# Default licensed markets for the operator (override via LICENSED_MARKETS env)
DEFAULT_LICENSED_MARKETS = {
    "DE",
    "MT",
    "GB",
    "SE",
    "FI",
    "NL",
    "AT",
    "IE",
}

BOT_USER_AGENT_TOKENS = {
    "bot",
    "crawler",
    "spider",
    "curl",
    "wget",
    "python-requests",
    "scrapy",
    "headless",
    "phantomjs",
    "selenium",
    "httpclient",
    "java/",
    "libwww",
}

# Emulator / virtual device patterns in user-agent (free heuristic detection)
EMULATOR_UA_TOKENS = {
    "sdk_gphone",
    "emulator",
    "genymotion",
    "bluestacks",
    "nox",
    "virtualbox",
    "andywin",
    "memu",
}

# Channels where FingerprintJS OSS fingerprint is expected from web clients
FINGERPRINT_REQUIRED_CHANNELS = {"web", "mobile"}

# FingerprintJS open-source visitorId format (v3/v4)
FINGERPRINT_MIN_LENGTH = 16
FINGERPRINT_MAX_LENGTH = 64

SUSPICIOUS_FINGERPRINT_VALUES = {
    "",
    "unknown",
    "null",
    "undefined",
    "00000000000000000000000000000000",
    "test",
}

SUSPICIOUS_REFERRERS = {
    "",
    "direct",
    "unknown",
    "null",
}

# Bonus hunting / affiliate fraud patterns common in casino signups
BONUS_ABUSE_REFERRER_TOKENS = {
    "free-spins",
    "no-deposit",
    "casino-bonus",
    "bonus-hunter",
    "promo-code",
    "free-money",
    "matched-bonus",
    "welcome-bonus",
}

# AML-style reporting thresholds (EUR equivalent)
AML_SINGLE_DEPOSIT_THRESHOLD = 2_000
AML_LARGE_DEPOSIT_THRESHOLD = 10_000
AML_WITHDRAWAL_REVIEW_THRESHOLD = 1_000
AML_STRUCTURING_THRESHOLD = 3_000

MICRO_DEPOSIT_MAX = 10
HIGH_STAKE_BET_THRESHOLD = 500

# Velocity thresholds (per sliding window TTL configured in settings)
VELOCITY_THRESHOLDS = {
    # Login — bulk / credential stuffing (account takeover before cashout)
    "login_ip_medium": 5,
    "login_ip_high": 15,
    "login_ip_critical": 30,
    "login_ip_distinct_users_high": 8,
    "login_ip_distinct_users_critical": 15,
    "login_user_medium": 5,
    "login_user_high": 12,
    "login_user_critical": 25,
    # Signup — multi-account / bonus abuse farms
    "signup_ip_medium": 2,
    "signup_ip_high": 5,
    "signup_ip_critical": 10,
    "signup_domain_high": 5,
    "signup_domain_critical": 10,
    # Casino money events
    "deposit_user_medium": 3,
    "deposit_user_high": 6,
    "deposit_user_critical": 12,
    "withdrawal_user_medium": 2,
    "withdrawal_user_high": 4,
    "withdrawal_user_critical": 8,
    "withdrawal_ip_high": 5,
    "bet_user_high": 50,
    "bet_user_critical": 100,
    # Generic IP velocity (all event types)
    "ip_all_medium": 20,
    "ip_all_high": 50,
    # FingerprintJS / device fingerprint velocity
    "signup_fingerprint_high": 3,
    "signup_fingerprint_critical": 6,
    "fingerprint_distinct_users_high": 4,
    "fingerprint_distinct_users_critical": 8,
    # Auth failure — brute force
    "login_failed_ip_medium": 5,
    "login_failed_ip_high": 10,
    "login_failed_ip_critical": 20,
    "login_failed_user_medium": 3,
    "login_failed_user_high": 8,
    "login_failed_user_critical": 15,
    "signup_failed_ip_high": 5,
    "signup_failed_ip_critical": 10,
}

SCORE_WEIGHTS = {
    "critical": 80,
    "high": 60,
    "medium": 35,
    "low": 15,
}

# Shared withdrawal payout destination (bank / crypto / e-wallet)
WITHDRAWAL_METHOD_ENABLED = True
WITHDRAWAL_METHOD_DISTINCT_USERS_MEDIUM = 2
WITHDRAWAL_METHOD_DISTINCT_USERS_HIGH = 3
WITHDRAWAL_METHOD_DISTINCT_USERS_CRITICAL = 4
WITHDRAWAL_METHOD_MEDIUM_SCORE = 35
WITHDRAWAL_METHOD_HIGH_SCORE = 55
WITHDRAWAL_METHOD_CRITICAL_SCORE = 80

# Sequential betting-pattern detection (bonus/free-spin bursts, rapid wallet bets, win streaks).
BETTING_PATTERNS_ENABLED = True
BETTING_BURST_WINDOW_SECONDS = 300
GAME_BET_BURST_MEDIUM = 10
GAME_BET_BURST_HIGH = 20
GAME_BET_BURST_CRITICAL = 35
GAME_BET_MEDIUM_SCORE = 25
GAME_BET_HIGH_SCORE = 40
GAME_BET_CRITICAL_SCORE = 60
WALLET_BET_BURST_MEDIUM = 20
WALLET_BET_BURST_HIGH = 40
WALLET_BET_BURST_CRITICAL = 70
WALLET_BET_MEDIUM_SCORE = 20
WALLET_BET_HIGH_SCORE = 35
WALLET_BET_CRITICAL_SCORE = 50
WALLET_WIN_BURST_MEDIUM = 8
WALLET_WIN_BURST_HIGH = 15
WALLET_WIN_BURST_CRITICAL = 25
WALLET_WIN_MEDIUM_SCORE = 25
WALLET_WIN_HIGH_SCORE = 45
WALLET_WIN_CRITICAL_SCORE = 65
WIN_RATE_MIN_BETS = 5
WIN_RATE_HIGH_RATIO = 0.75
WIN_RATE_CRITICAL_RATIO = 0.90
WIN_RATE_HIGH_SCORE = 40
WIN_RATE_CRITICAL_SCORE = 65

# OFAC comprehensive / country-program sanctions (ISO 3166-1 alpha-2).
# Synced into aml_blocklist_entries when aml.blocklist.sync_ofac_countries_enabled is on.
# Source: U.S. Treasury OFAC sanctions programs (derived list; review periodically).
OFAC_SANCTIONED_COUNTRIES = {
    "AF", "BY", "CF", "CD", "CU", "ET", "HK", "IR", "IQ", "KP", "LB", "LY",
    "ML", "MM", "NI", "RU", "SD", "SO", "SS", "SY", "UA", "VE", "YE", "ZW",
}

# Brave-maintained OFAC crypto address lists (Treasury SDN derivative).
OFAC_CRYPTO_LIST_ASSETS = (
    "XBT", "ETH", "TRX", "USDT", "LTC", "XRP", "SOL", "BSC", "USDC",
    "XMR", "BCH", "DASH", "ZEC", "ETC", "BSV", "XVG", "ARB", "BNB", "BTG",
)
OFAC_CRYPTO_LIST_BASE_URL = (
    "https://raw.githubusercontent.com/brave-intl/"
    "ofac-sanctioned-digital-currency-addresses/lists/sanctioned_addresses"
)


def ofac_crypto_list_url(asset: str) -> str:
    return f"{OFAC_CRYPTO_LIST_BASE_URL}_{asset}.txt"

AML_BLOCKLIST_ENABLED = True
AML_BLOCKLIST_CRYPTO_ENABLED = True
AML_BLOCKLIST_COUNTRY_ENABLED = True
AML_BLOCKLIST_SYNC_OFAC_CRYPTO = True
AML_BLOCKLIST_SYNC_OFAC_COUNTRIES = True
AML_BLOCKLIST_SYNC_INTERVAL_HOURS = 24
AML_BLOCKLIST_FAIL_OPEN = True
AML_BLOCKLIST_USE_LISTS_SANCTIONED = True
AML_BLOCKLIST_CRYPTO_HIT_SCORE = 90
AML_BLOCKLIST_COUNTRY_HIT_SCORE = 90

STEP_UP_VERIFICATION_ENABLED = True
STEP_UP_VERIFICATION_GRANT_TTL_DAYS = 7
STEP_UP_VERIFICATION_MAX_VERIFIED_AGE_MINUTES = 5
STEP_UP_VERIFICATION_DOWNGRADE_CHALLENGE = True
STEP_UP_VERIFICATION_EVENT_TYPES = (
    "player.login",
    "player.signup",
    "payment.deposit",
)
