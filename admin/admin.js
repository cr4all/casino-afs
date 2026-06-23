const STORAGE_KEY = "afs_admin_api_key";

const TAB_SECTIONS = [
  {
    id: "decision",
    label: "Decision",
    description:
      "Maps the aggregated risk score (0–100) to risk levels and drives allow / challenge / block outcomes. Lower thresholds = stricter.",
    fields: [
      {
        path: "decision_thresholds.challenge",
        label: "Challenge threshold",
        type: "number",
        description:
          "Scores at or above this value become medium risk. Typical outcome: step-up verification (MFA, manual review) instead of a straight allow.",
      },
      {
        path: "decision_thresholds.high",
        label: "High threshold",
        type: "number",
        description:
          "Scores at or above this become high risk. Login/signup may block; money events often block or require extra checks.",
      },
      {
        path: "decision_thresholds.block",
        label: "Block threshold (critical)",
        type: "number",
        description:
          "Scores at or above this become critical and usually result in block, unless a hard-block signal already fired.",
      },
    ],
  },
  {
    id: "operator",
    label: "Operator",
    description:
      "Your casino operator context. Licensed markets define where players are allowed to sign up, deposit, and bet.",
    fields: [
      {
        path: "operator.platform_name",
        label: "Platform name",
        type: "text",
        description: "Internal label for this operator instance (e.g. casino brand). Used for logging and identification.",
      },
      {
        path: "operator.licensed_markets",
        label: "Licensed markets",
        type: "text",
        description:
          "Comma-separated ISO country codes where you hold a gambling licence (e.g. DE,GB,MT). Signups, deposits, and bets from other countries raise unlicensed_jurisdiction signals.",
      },
    ],
  },
  {
    id: "ip_intel",
    label: "IP Intelligence",
    description:
      "Free-tier VPN/proxy/Tor/hosting detection via public IP APIs. Used on login, signup, and withdrawal flows.",
    fields: [
      {
        path: "ip_intel.enabled",
        label: "Enabled",
        type: "checkbox",
        description: "When off, IP intelligence lookups are skipped entirely (no VPN/proxy signals from external APIs).",
      },
      {
        path: "ip_intel.cache_ttl_seconds",
        label: "Cache TTL (seconds)",
        type: "number",
        description: "How long to cache each IP lookup result in Redis or memory. Higher = fewer API calls, slower to reflect IP changes.",
      },
      {
        path: "ip_intel.timeout_seconds",
        label: "Lookup timeout (seconds)",
        type: "number",
        step: "0.1",
        description: "Max wait time per external IP API call. Short timeouts reduce latency; long ones improve lookup success rate.",
      },
      {
        path: "ip_intel.fail_open",
        label: "Fail open on lookup error",
        type: "checkbox",
        description:
          "When on, a failed IP lookup does not penalise the player. When off, lookup failures are treated as high-risk (VPN/proxy suspected).",
      },
    ],
  },
  {
    id: "aml",
    label: "AML & Transactions",
    description:
      "Amount-based rules for deposits, withdrawals, and bets. Amounts are compared in EUR (or your platform's base currency).",
    fields: [
      {
        path: "aml.single_deposit_threshold",
        label: "Single deposit review",
        type: "number",
        description: "Deposits at or above this amount trigger elevated_deposit_aml_review for compliance review.",
      },
      {
        path: "aml.large_deposit_threshold",
        label: "Large deposit review",
        type: "number",
        description: "Deposits at or above this amount trigger large_deposit_aml_review — highest deposit AML tier.",
      },
      {
        path: "aml.withdrawal_review_threshold",
        label: "Withdrawal review",
        type: "number",
        description: "Withdrawals at or above this amount trigger elevated_withdrawal_review and cashout_review_required.",
      },
      {
        path: "aml.structuring_threshold",
        label: "Structuring threshold",
        type: "number",
        description:
          "Deposits just below this amount (90%–100%) trigger structuring_threshold_deposit — pattern used to avoid reporting limits.",
      },
      {
        path: "aml.micro_deposit_max",
        label: "Micro deposit max",
        type: "number",
        description:
          "Deposits below this amount trigger micro_deposit_bonus_farming — common in bonus-abuse and payment testing.",
      },
      {
        path: "aml.high_stake_bet_threshold",
        label: "High stake bet",
        type: "number",
        description: "Single bets at or above this amount trigger high_stake_bet. Bets above 100 (fixed) trigger elevated_stake_bet.",
      },
      {
        path: "aml.blocklist.enabled",
        label: "Blocklist screening enabled",
        type: "checkbox",
        description:
          "Master toggle for AML blocklist checks (sanctioned crypto wallets and blocklisted countries on money events).",
      },
      {
        path: "aml.blocklist.crypto_enabled",
        label: "Crypto wallet screening",
        type: "checkbox",
        description:
          "When on, payment.withdraw and payment.deposit with crypto payout methods are checked against OFAC + manual crypto blocklists.",
      },
      {
        path: "aml.blocklist.bank_enabled",
        label: "Bank account screening",
        type: "checkbox",
        description:
          "When on, bank/IBAN payouts on payment.withdraw and payment.deposit are checked against manual bank blocklist.",
      },
      {
        path: "aml.blocklist.ewallet_enabled",
        label: "E-wallet screening",
        type: "checkbox",
        description:
          "When on, e-wallet payouts are checked against manual e-wallet blocklist.",
      },
      {
        path: "aml.blocklist.card_enabled",
        label: "Card payout screening",
        type: "checkbox",
        description:
          "When on, card payout references are checked against manual card blocklist.",
      },
      {
        path: "aml.blocklist.country_enabled",
        label: "Country blocklist screening",
        type: "checkbox",
        description:
          "When on, signup/login/deposit/withdraw events are checked against synced OFAC countries, Lists tab sanctioned countries, and manual country entries.",
      },
      {
        path: "aml.blocklist.sync_ofac_crypto_enabled",
        label: "Auto-sync OFAC crypto wallets",
        type: "checkbox",
        description:
          "Daily sync from brave-intl/ofac-sanctioned-digital-currency-addresses (U.S. Treasury SDN derivative). Requires outbound HTTPS.",
      },
      {
        path: "aml.blocklist.sync_ofac_countries_enabled",
        label: "Auto-sync OFAC countries",
        type: "checkbox",
        description:
          "Load Treasury-derived OFAC country program list into the blocklist database on each sync.",
      },
      {
        path: "aml.blocklist.sync_interval_hours",
        label: "Sync interval (hours)",
        type: "number",
        description: "How often to refresh OFAC blocklists from third-party sources (default: 24).",
      },
      {
        path: "aml.blocklist.fail_open",
        label: "Fail open if sync unavailable",
        type: "checkbox",
        description:
          "When on, missing or stale blocklist data does not block transactions. When off, treat unsynced blocklist as high risk.",
      },
      {
        path: "aml.blocklist.use_lists_sanctioned_countries",
        label: "Include Lists tab sanctioned countries",
        type: "checkbox",
        description:
          "Merge countries from Lists → sanctioned countries into blocklist country checks.",
      },
      {
        path: "aml.blocklist.crypto_hit_score",
        label: "Payout blocklist hit score",
        type: "number",
        description:
          "Risk score when a payout destination matches OFAC or any manual blocklist (crypto, bank, e-wallet, card). Default: 90.",
      },
      {
        path: "aml.blocklist.country_hit_score",
        label: "Country blocklist hit score",
        type: "number",
        description: "Risk score when player country matches blocklist (default: 90).",
      },
      {
        path: "aml.blocklist.manual_crypto_wallets",
        label: "Manual crypto wallets",
        type: "textarea",
        list: true,
        description:
          "Crypto wallet addresses to block (one per line). Checked with payment_method_type crypto/btc/eth/etc.",
      },
      {
        path: "aml.blocklist.manual_bank_accounts",
        label: "Manual bank accounts",
        type: "textarea",
        list: true,
        description:
          "Bank IBANs or account ids to block (one per line). Checked when payment_method_type is bank (or alias: iban, sepa, wire).",
      },
      {
        path: "aml.blocklist.manual_ewallet_accounts",
        label: "Manual e-wallet accounts",
        type: "textarea",
        list: true,
        description:
          "E-wallet ids or emails to block (one per line). Checked when payment_method_type is ewallet.",
      },
      {
        path: "aml.blocklist.manual_card_accounts",
        label: "Manual card payouts",
        type: "textarea",
        list: true,
        description:
          "Card tokens or payout references to block (one per line). Checked when payment_method_type is card.",
      },
      {
        path: "aml.blocklist.manual_countries",
        label: "Manual blocklisted countries",
        type: "textarea",
        list: true,
        description: "ISO country codes to block (one per line, e.g. IR, KP). Merged with synced and Lists tab countries.",
      },
    ],
    hasBlocklistStatus: true,
  },
  {
    id: "withdrawal_method",
    label: "Withdrawal Methods",
    description:
      "Detects when multiple player accounts share the same payout destination (bank IBAN, crypto wallet, e-wallet, etc.). Applies to payment.withdraw only. Send transaction.payment_method_type and transaction.payment_method_key on each withdrawal evaluate request.",
    fields: [
      {
        path: "withdrawal_method.enabled",
        label: "Enabled",
        type: "checkbox",
        description:
          "When off, shared payout method checks are skipped entirely (no shared_withdrawal_method signals).",
      },
      {
        path: "withdrawal_method.distinct_users_medium",
        label: "Distinct users (medium)",
        type: "number",
        description:
          "Number of different user_ids using the same payout method before shared_withdrawal_method fires (default: 2).",
      },
      {
        path: "withdrawal_method.distinct_users_high",
        label: "Distinct users (high)",
        type: "number",
        description:
          "Distinct users threshold for multiple_accounts_shared_payout_method (default: 3).",
      },
      {
        path: "withdrawal_method.distinct_users_critical",
        label: "Distinct users (critical)",
        type: "number",
        description:
          "Distinct users threshold for multi_account_shared_withdrawal_method — usually forces block (default: 4).",
      },
      {
        path: "withdrawal_method.medium_score",
        label: "Medium score",
        type: "number",
        description: "Risk score added when medium threshold is reached.",
      },
      {
        path: "withdrawal_method.high_score",
        label: "High score",
        type: "number",
        description: "Risk score added when high threshold is reached.",
      },
      {
        path: "withdrawal_method.critical_score",
        label: "Critical score",
        type: "number",
        description: "Risk score added when critical threshold is reached.",
      },
    ],
  },
  {
    id: "betting_patterns",
    label: "Betting patterns",
    description:
      "Detect rapid sequential betting and suspicious win streaks in a rolling window. game.bet covers bonus/free-spin bets; wallet.bet covers real-money bets; wallet.win covers win credits and win-rate checks against recent bet activity.",
    fields: [
      {
        path: "betting_patterns.enabled",
        label: "Enabled",
        type: "checkbox",
        description: "When off, sequential burst and win-rate checks are skipped.",
      },
      {
        path: "betting_patterns.burst_window_seconds",
        label: "Burst window (seconds)",
        type: "number",
        description: "Rolling window for sequential game.bet, wallet.bet, and wallet.win counters (default: 300).",
      },
      {
        path: "betting_patterns.game_bet_burst_medium",
        label: "game.bet burst — medium",
        type: "number",
        description: "Sequential game.bet count before sequential_game_bet_burst (default: 10).",
      },
      {
        path: "betting_patterns.game_bet_burst_high",
        label: "game.bet burst — high",
        type: "number",
      },
      {
        path: "betting_patterns.game_bet_burst_critical",
        label: "game.bet burst — critical",
        type: "number",
      },
      {
        path: "betting_patterns.wallet_bet_burst_medium",
        label: "wallet.bet burst — medium",
        type: "number",
        description: "Sequential wallet.bet count before sequential_wallet_bet_burst (default: 20).",
      },
      {
        path: "betting_patterns.wallet_bet_burst_high",
        label: "wallet.bet burst — high",
        type: "number",
      },
      {
        path: "betting_patterns.wallet_bet_burst_critical",
        label: "wallet.bet burst — critical",
        type: "number",
      },
      {
        path: "betting_patterns.wallet_win_burst_medium",
        label: "wallet.win burst — medium",
        type: "number",
        description: "Sequential wallet.win count before sequential_wallet_win_burst (default: 8).",
      },
      {
        path: "betting_patterns.wallet_win_burst_high",
        label: "wallet.win burst — high",
        type: "number",
      },
      {
        path: "betting_patterns.wallet_win_burst_critical",
        label: "wallet.win burst — critical",
        type: "number",
      },
      {
        path: "betting_patterns.win_rate_min_bets",
        label: "Win rate — min bets",
        type: "number",
        description: "Minimum wallet.bet + game.bet in window before win-rate ratio is evaluated (default: 5).",
      },
      {
        path: "betting_patterns.win_rate_high_ratio",
        label: "Win rate — high ratio",
        type: "number",
        description: "Wins / bets ratio for high_win_rate_in_betting_sequence (default: 0.75).",
      },
      {
        path: "betting_patterns.win_rate_critical_ratio",
        label: "Win rate — critical ratio",
        type: "number",
        description: "Wins / bets ratio for critical_win_rate_in_betting_sequence (default: 0.90).",
      },
    ],
  },
  {
    id: "step_up",
    label: "Step-up (Turnstile)",
    description:
      "After your backend verifies Cloudflare Turnstile (siteverify), send metadata.step_up_verification on the next POST /evaluate. AFS may downgrade challenge to allow and store a grant for the configured number of days.",
    fields: [
      {
        path: "step_up_verification.enabled",
        label: "Enabled",
        type: "checkbox",
        description: "When off, step_up_verification metadata is ignored.",
      },
      {
        path: "step_up_verification.grant_ttl_days",
        label: "Grant duration (days)",
        type: "number",
        description:
          "How long a successful Turnstile verification applies to the same user + device (default: 7).",
      },
      {
        path: "step_up_verification.max_verified_age_minutes",
        label: "Max verified_at age (minutes)",
        type: "number",
        description:
          "metadata.verified_at must be within this many minutes of the evaluate request (default: 5).",
      },
      {
        path: "step_up_verification.downgrade_challenge_to_allow",
        label: "Downgrade challenge to allow",
        type: "checkbox",
        description:
          "When on, an active step-up grant downgrades challenge to allow. Never overrides block.",
      },
      {
        path: "step_up_verification.allowed_hostnames",
        label: "Allowed hostnames",
        type: "textarea",
        list: true,
        description:
          "Optional Cloudflare hostname allowlist (one per line). Empty = skip hostname check.",
      },
      {
        path: "step_up_verification.applicable_event_types",
        label: "Applicable event types",
        type: "textarea",
        list: true,
        description:
          "Event types where step-up applies (one per line), e.g. player.login, player.signup, payment.deposit.",
      },
    ],
  },
  {
    id: "fingerprint",
    label: "Fingerprint",
    description:
      "FingerprintJS visitor ID validation. Fingerprints help detect multi-account abuse and untrusted devices on withdrawals.",
    fields: [
      {
        path: "fingerprint.required_channels",
        label: "Required channels",
        type: "text",
        list: true,
        description:
          "Comma-separated channels where a fingerprint is expected (e.g. web, mobile). Missing fingerprint on these channels raises missing_fingerprint.",
      },
      {
        path: "fingerprint.min_length",
        label: "Min length",
        type: "number",
        description: "Minimum valid FingerprintJS visitorId length. Too short = malformed_fingerprint.",
      },
      {
        path: "fingerprint.max_length",
        label: "Max length",
        type: "number",
        description: "Maximum valid visitorId length. Values outside min–max range are rejected.",
      },
      {
        path: "fingerprint.suspicious_values",
        label: "Suspicious values",
        type: "textarea",
        list: true,
        description:
          "Known fake or placeholder fingerprint strings (one per line). Matching values fail validation and raise invalid_fingerprint.",
      },
    ],
  },
  {
    id: "lists",
    label: "Lists",
    description:
      "Blocklists and pattern lists used by email, identity, device, signup, and gaming engines. One entry per line.",
    fields: [
      {
        path: "lists.disposable_domains",
        label: "Disposable email domains",
        type: "textarea",
        list: true,
        description: "Email domains from throwaway providers (e.g. mailinator.com). Triggers disposable_email — usually a hard block on signup.",
      },
      {
        path: "lists.high_risk_countries",
        label: "High-risk countries",
        type: "textarea",
        list: true,
        description: "ISO country codes with elevated fraud rates. Adds high_risk_country score on IP/geo checks (not an automatic block).",
      },
      {
        path: "lists.sanctioned_countries",
        label: "Sanctioned countries",
        type: "textarea",
        list: true,
        description:
          "ISO codes for sanctioned or gambling-prohibited jurisdictions. Money events and signups from these countries trigger sanctioned_country (hard block).",
      },
      {
        path: "lists.generic_names",
        label: "Generic names",
        type: "textarea",
        list: true,
        description: 'Fake or placeholder display names (e.g. "test", "user", "admin"). Triggers generic_name on signup/identity checks.',
      },
      {
        path: "lists.role_based_email_locals",
        label: "Role-based email locals",
        type: "textarea",
        list: true,
        description: 'Email local parts like admin, support, info. Often not personal accounts — triggers role_based_email.',
      },
      {
        path: "lists.suspicious_email_tlds",
        label: "Suspicious email TLDs",
        type: "textarea",
        list: true,
        description: "Top-level domains associated with spam (e.g. .xyz, .top). Triggers suspicious_email_tld when email ends with these.",
      },
      {
        path: "lists.suspicious_email_local_tokens",
        label: "Suspicious email local tokens",
        type: "textarea",
        list: true,
        description: 'Substrings in the email local part (e.g. temp, spam, bot). Triggers suspicious_email_pattern if found.',
      },
      {
        path: "lists.bot_user_agent_tokens",
        label: "Bot user-agent tokens",
        type: "textarea",
        list: true,
        description: 'Substrings in User-Agent that indicate bots or scripts (curl, python-requests, headless). Triggers bot_user_agent.',
      },
      {
        path: "lists.emulator_ua_tokens",
        label: "Emulator UA tokens",
        type: "textarea",
        list: true,
        description: "User-Agent patterns for Android emulators or virtual devices (e.g. genymotion, bluestacks). Triggers emulator_detected.",
      },
      {
        path: "lists.suspicious_referrers",
        label: "Suspicious referrers",
        type: "textarea",
        list: true,
        description: 'Exact referrer values treated as low-trust on signup (e.g. empty, "direct", "unknown"). Triggers suspicious_referrer.',
      },
      {
        path: "lists.bonus_abuse_referrer_tokens",
        label: "Bonus abuse referrer tokens",
        type: "textarea",
        list: true,
        description:
          "Substrings in signup referrer URL linked to bonus-hunting sites (e.g. free-spins, no-deposit). Triggers bonus_abuse_referrer.",
      },
    ],
  },
  {
    id: "velocity",
    label: "Velocity",
    description:
      "Rate limits per sliding time window (TTL set under Features → Redis). Counts events per IP, user, device, domain, or fingerprint. Keys ending in _medium/_high/_critical set when each tier fires. Example: login_ip_high = max logins from one IP before high_signup_ip_velocity-style signals.",
    fields: [
      {
        path: "velocity_thresholds",
        label: "Velocity thresholds (JSON)",
        type: "json",
        description:
          "JSON map of threshold names to max counts. Groups: login_ip_*, login_user_*, signup_ip_*, signup_domain_*, deposit_user_*, withdrawal_user_*, bet_user_*, ip_all_*, signup_fingerprint_*, login_failed_*, signup_failed_*. Do not remove keys — engines expect them.",
      },
    ],
  },
  {
    id: "signals",
    label: "Critical Signals",
    description:
      "If any of these signal names appear in an evaluation, the decision is forced to block regardless of score.",
    fields: [
      {
        path: "critical_signals",
        label: "Hard-block signals",
        type: "textarea",
        list: true,
        description:
          "One signal name per line (e.g. disposable_email, bulk_login_attack, new_device_on_withdrawal). Must match exact signal strings emitted by engines.",
      },
    ],
  },
  {
    id: "features",
    label: "Features & Messaging",
    description:
      "Integration toggles for Redis, RabbitMQ, audit logging, and sync API behaviour. Connection URLs stay in .env / docker-compose — only behaviour flags are here.",
    fields: [
      {
        path: "features.sync_publish_audit",
        label: "Publish audit on sync /evaluate",
        type: "checkbox",
        description:
          "When on, synchronous POST /evaluate results are also published to RabbitMQ for the Orchestrator audit trail.",
      },
      {
        path: "features.decision_cache_ttl_seconds",
        label: "Decision cache TTL (seconds)",
        type: "number",
        description:
          "How long to cache identical event_id decisions in Redis. Requires Redis enabled. 0 = no caching.",
      },
      {
        path: "features.redis_enabled",
        label: "Redis enabled",
        type: "checkbox",
        note: "Requires restart",
        description:
          "Use Redis for velocity counters and optional decision cache. When off, velocity uses in-memory counters (single-instance only).",
      },
      {
        path: "features.redis_velocity_ip_ttl",
        label: "Redis IP velocity TTL",
        type: "number",
        description: "Seconds until IP-based velocity counters expire in Redis (sliding window length for IP keys).",
      },
      {
        path: "features.redis_velocity_domain_ttl",
        label: "Redis domain velocity TTL",
        type: "number",
        description: "Seconds until email-domain velocity counters expire (signup domain rate limits).",
      },
      {
        path: "features.rabbitmq_enabled",
        label: "RabbitMQ consumer enabled",
        type: "checkbox",
        note: "Requires restart",
        description: "Start the async consumer that scores events from the casino platform exchange/queue.",
      },
      {
        path: "features.rabbitmq_publish_results",
        label: "Publish results to Orchestrator",
        type: "checkbox",
        note: "Requires restart",
        description: "Send scored results to the risk.results queue for Orchestrator audit and action publishing.",
      },
      {
        path: "features.rabbitmq_events_exchange",
        label: "Events exchange",
        type: "text",
        note: "Requires restart",
        description: "Topic exchange name the casino platform publishes to (e.g. casino.events). Leave empty for legacy queue-only mode.",
      },
      {
        path: "features.rabbitmq_events_exchange_type",
        label: "Exchange type",
        type: "text",
        note: "Requires restart",
        description: "RabbitMQ exchange type — usually topic for routing-key based casino events.",
      },
      {
        path: "features.rabbitmq_events_queue",
        label: "Events queue",
        type: "text",
        note: "Requires restart",
        description: "Queue AFS consumes from after binding to the platform exchange (e.g. casino.afs).",
      },
      {
        path: "features.rabbitmq_events_binding_key",
        label: "Binding key",
        type: "text",
        note: "Requires restart",
        description: "Routing key pattern for the queue binding. # = all events; use player.* to filter.",
      },
      {
        path: "features.rabbitmq_prefetch",
        label: "Prefetch count",
        type: "number",
        note: "Requires restart",
        description: "Max unacked messages per consumer channel. Higher = more throughput, more memory use.",
      },
      {
        path: "features.rabbitmq_results_queue",
        label: "Results queue",
        type: "text",
        note: "Requires restart",
        description: "Outbound queue where scored EvaluateResponse messages are published (default: risk.results).",
      },
    ],
  },
];

const LOGS_SECTION = {
  id: "logs",
  label: "Logs",
  isLogsViewer: true,
  description:
    "View detailed sync (/evaluate) and async (RabbitMQ) request/response logs stored in PostgreSQL. Toggle logging per channel below — changes apply immediately after Save.",
};

let logsState = { offset: 0, limit: 50, total: 0 };

let config = null;
let apiKey = sessionStorage.getItem(STORAGE_KEY) || "";

const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const loginError = document.getElementById("login-error");
const statusBanner = document.getElementById("status-banner");

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function setByPath(obj, path, value) {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i += 1) {
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

function listToText(value) {
  if (Array.isArray(value)) {
    return value.join("\n");
  }
  return String(value ?? "");
}

function textToList(text) {
  if (!text.trim()) {
    return [];
  }
  return text
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function showBanner(message, type = "success") {
  statusBanner.textContent = message;
  statusBanner.className = `banner ${type}`;
  statusBanner.classList.remove("hidden");
  window.setTimeout(() => statusBanner.classList.add("hidden"), 4000);
}

async function api(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (options.auth !== false && apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`/api/admin${path}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body.detail;
    const message = typeof detail === "string" ? detail : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
}

function appendDescription(parent, text) {
  if (!text) {
    return;
  }
  const description = document.createElement("p");
  description.className = "field-description";
  description.textContent = text;
  parent.appendChild(description);
}

function buildLogsViewerPanel(panel) {
  const settingsTitle = document.createElement("h3");
  settingsTitle.className = "section-title";
  settingsTitle.textContent = "Logging settings";
  panel.appendChild(settingsTitle);

  [
    {
      path: "logging.sync_enabled",
      label: "Sync request/response logging",
      description:
        "Log full request and response payloads for POST /evaluate (sync HTTP API).",
    },
    {
      path: "logging.async_enabled",
      label: "Async request/response logging",
      description:
        "Log RabbitMQ events: scored, skipped, rejected, and failed messages with payloads where available.",
    },
  ].forEach((field) => {
    const wrapper = document.createElement("div");
    wrapper.className = "field";
    const label = document.createElement("label");
    label.htmlFor = field.path;
    label.textContent = field.label;
    wrapper.appendChild(label);
    appendDescription(wrapper, field.description);
    const row = document.createElement("div");
    row.className = "field-checkbox-row";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = field.path;
    input.dataset.path = field.path;
    input.dataset.type = "checkbox";
    row.appendChild(input);
    row.appendChild(document.createTextNode("Enable"));
    wrapper.appendChild(row);
    panel.appendChild(wrapper);
  });

  const viewerTitle = document.createElement("h3");
  viewerTitle.className = "section-title";
  viewerTitle.textContent = "Log viewer";
  panel.appendChild(viewerTitle);

  const filters = document.createElement("div");
  filters.className = "log-filters";
  filters.innerHTML = `
    <label>Channel<select id="log-filter-channel"><option value="">All</option><option value="sync">Sync</option><option value="async">Async</option></select></label>
    <label>Status<select id="log-filter-status"><option value="">All</option><option value="scored">Scored</option><option value="skipped">Skipped</option><option value="rejected">Rejected</option><option value="failed">Failed</option></select></label>
    <label>Event ID<input id="log-filter-event-id" type="text" placeholder="Search event_id"></label>
    <button type="button" id="log-refresh-btn" class="secondary">Refresh</button>
  `;
  panel.appendChild(filters);

  const meta = document.createElement("p");
  meta.id = "log-meta";
  meta.className = "hint";
  panel.appendChild(meta);

  const tableWrap = document.createElement("div");
  tableWrap.className = "log-table-wrap";
  tableWrap.innerHTML = `<table class="log-table"><thead><tr><th>Time</th><th>Channel</th><th>Status</th><th>Event</th><th>Summary</th><th></th></tr></thead><tbody id="log-table-body"></tbody></table>`;
  panel.appendChild(tableWrap);

  const pager = document.createElement("div");
  pager.className = "log-pager";
  pager.innerHTML = `<button type="button" id="log-prev-btn" class="secondary">Previous</button><span id="log-page-info"></span><button type="button" id="log-next-btn" class="secondary">Next</button>`;
  panel.appendChild(pager);

  const detail = document.createElement("pre");
  detail.id = "log-detail";
  detail.className = "log-detail hidden";
  panel.appendChild(detail);

  panel.querySelector("#log-refresh-btn").addEventListener("click", () => {
    logsState.offset = 0;
    loadEvaluateLogs();
  });
  panel.querySelector("#log-prev-btn").addEventListener("click", () => {
    logsState.offset = Math.max(0, logsState.offset - logsState.limit);
    loadEvaluateLogs();
  });
  panel.querySelector("#log-next-btn").addEventListener("click", () => {
    if (logsState.offset + logsState.limit < logsState.total) {
      logsState.offset += logsState.limit;
      loadEvaluateLogs();
    }
  });
  ["log-filter-channel", "log-filter-status", "log-filter-event-id"].forEach((id) => {
    const el = panel.querySelector(`#${id}`);
    el.addEventListener("change", () => {
      logsState.offset = 0;
      loadEvaluateLogs();
    });
    if (id === "log-filter-event-id") {
      el.addEventListener("input", () => {
        logsState.offset = 0;
        loadEvaluateLogs();
      });
    }
  });
}

async function loadEvaluateLogs() {
  const channel = document.getElementById("log-filter-channel")?.value || "";
  const status = document.getElementById("log-filter-status")?.value || "";
  const eventId = document.getElementById("log-filter-event-id")?.value.trim() || "";
  const params = new URLSearchParams({
    limit: String(logsState.limit),
    offset: String(logsState.offset),
  });
  if (channel) params.set("channel", channel);
  if (status) params.set("status", status);
  if (eventId) params.set("event_id", eventId);

  const data = await api(`/logs?${params.toString()}`);
  logsState.total = data.total;

  const tbody = document.getElementById("log-table-body");
  const detail = document.getElementById("log-detail");
  if (!tbody || !detail) {
    return;
  }
  tbody.innerHTML = "";
  detail.classList.add("hidden");

  if (!data.entries.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="log-empty">No log entries found. Enable sync/async logging above, save, then generate traffic.</td></tr>`;
  } else {
    data.entries.forEach((entry) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${formatLogTime(entry.logged_at)}</td>
        <td><span class="log-badge log-badge-${entry.channel}">${entry.channel}</span></td>
        <td><span class="log-badge log-badge-${entry.status}">${entry.status}</span></td>
        <td>${escapeHtml(entry.event_type || "-")}<br><small>${escapeHtml(entry.event_id || "-")}</small></td>
        <td class="log-summary">${escapeHtml(entry.summary)}</td>
        <td><button type="button" class="secondary log-view-btn" data-id="${entry.id}">View</button></td>
      `;
      row.querySelector(".log-view-btn").addEventListener("click", () => showLogDetail(entry.id));
      tbody.appendChild(row);
    });
  }

  const from = data.total ? logsState.offset + 1 : 0;
  const to = Math.min(logsState.offset + data.entries.length, data.total);
  document.getElementById("log-meta").textContent = `Showing ${from}–${to} of ${data.total} entries`;
  document.getElementById("log-page-info").textContent = `Page ${Math.floor(logsState.offset / logsState.limit) + 1}`;
  document.getElementById("log-prev-btn").disabled = logsState.offset === 0;
  document.getElementById("log-next-btn").disabled = logsState.offset + logsState.limit >= data.total;
}

async function showLogDetail(logId) {
  const entry = await api(`/logs/${logId}`);
  const detail = document.getElementById("log-detail");
  detail.textContent = JSON.stringify(entry, null, 2);
  detail.classList.remove("hidden");
  detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function formatLogTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildBlocklistStatusPanel(panel) {
  const title = document.createElement("h3");
  title.className = "section-title";
  title.textContent = "Blocklist sync status";
  panel.appendChild(title);

  const statusBox = document.createElement("div");
  statusBox.id = "blocklist-status-box";
  statusBox.className = "hint";
  statusBox.textContent = "Loading blocklist status…";
  panel.appendChild(statusBox);

  const actions = document.createElement("div");
  actions.className = "log-filters";
  const syncBtn = document.createElement("button");
  syncBtn.type = "button";
  syncBtn.className = "secondary";
  syncBtn.id = "blocklist-sync-btn";
  syncBtn.textContent = "Sync OFAC lists now";
  syncBtn.addEventListener("click", async () => {
    syncBtn.disabled = true;
    syncBtn.textContent = "Syncing…";
    try {
      await api("/blocklist/sync", { method: "POST" });
      await loadBlocklistStatus();
    } catch (err) {
      statusBox.textContent = `Sync failed: ${err.message}`;
    } finally {
      syncBtn.disabled = false;
      syncBtn.textContent = "Sync OFAC lists now";
    }
  });
  actions.appendChild(syncBtn);
  panel.appendChild(actions);
}

async function loadBlocklistStatus() {
  const box = document.getElementById("blocklist-status-box");
  if (!box) {
    return;
  }
  try {
    const status = await api("/blocklist/status");
    const lastSync = status.last_sync_at ? formatLogTime(status.last_sync_at) : "never";
    box.innerHTML = `
      <strong>Last sync:</strong> ${escapeHtml(lastSync)}
      (${status.last_sync_ok ? "OK" : "failed"})<br>
      <strong>DB entries:</strong> ${status.crypto_entries_in_db} crypto wallets,
      ${status.country_entries_in_db} countries<br>
      <strong>Manual overrides:</strong>
      ${status.manual_crypto_wallets} crypto,
      ${status.manual_bank_accounts} bank,
      ${status.manual_ewallet_accounts} e-wallet,
      ${status.manual_card_accounts} card,
      ${status.manual_countries} countries<br>
      <strong>Source:</strong> ${escapeHtml(status.source || "-")}
      ${status.last_error ? `<br><strong>Last error:</strong> ${escapeHtml(status.last_error)}` : ""}
    `;
  } catch (err) {
    box.textContent = `Could not load blocklist status: ${err.message}`;
  }
}

function buildTabs() {
  const tabsEl = document.getElementById("tabs");
  const panelsEl = document.getElementById("panels");
  tabsEl.innerHTML = "";
  panelsEl.innerHTML = "";

  const allSections = [...TAB_SECTIONS, LOGS_SECTION];

  allSections.forEach((section, index) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = `tab${index === 0 ? " active" : ""}`;
    tab.textContent = section.label;
    tab.dataset.panel = section.id;
    tab.addEventListener("click", () => activateTab(section.id));
    tabsEl.appendChild(tab);

    const panel = document.createElement("div");
    panel.className = `panel${index === 0 ? " active" : ""}`;
    panel.id = `panel-${section.id}`;

    if (section.description) {
      const panelIntro = document.createElement("p");
      panelIntro.className = "panel-description";
      panelIntro.textContent = section.description;
      panel.appendChild(panelIntro);
    }

    if (section.isLogsViewer) {
      buildLogsViewerPanel(panel);
      panelsEl.appendChild(panel);
      return;
    }

    section.fields.forEach((field) => {
      const wrapper = document.createElement("div");
      wrapper.className = "field";

      const label = document.createElement("label");
      label.htmlFor = field.path;
      label.textContent = field.label;
      wrapper.appendChild(label);
      appendDescription(wrapper, field.description);

      if (field.type === "checkbox") {
        const row = document.createElement("div");
        row.className = "field-checkbox-row";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = field.path;
        input.dataset.path = field.path;
        input.dataset.type = field.type;
        row.appendChild(input);
        row.appendChild(document.createTextNode("Enable"));
        wrapper.appendChild(row);
      } else {
        let input;
        if (field.type === "textarea" || field.type === "json") {
          input = document.createElement("textarea");
          input.rows = field.type === "json" ? 18 : 6;
        } else {
          input = document.createElement("input");
          input.type = field.type;
          if (field.step) {
            input.step = field.step;
          }
        }
        input.id = field.path;
        input.dataset.path = field.path;
        input.dataset.type = field.type;
        input.dataset.list = field.list ? "true" : "false";
        wrapper.appendChild(input);
      }

      if (field.note) {
        const note = document.createElement("p");
        note.className = "field-note";
        note.textContent = field.note;
        wrapper.appendChild(note);
      }

      panel.appendChild(wrapper);
    });

    if (section.hasBlocklistStatus) {
      buildBlocklistStatusPanel(panel);
    }

    panelsEl.appendChild(panel);
  });
}

function activateTab(panelId) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.panel === panelId);
  });
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${panelId}`);
  });
  if (panelId === "logs" && document.getElementById("log-table-body")) {
    loadEvaluateLogs().catch((error) => showBanner(error.message, "error"));
  }
  if (panelId === "aml" && document.getElementById("blocklist-status-box")) {
    loadBlocklistStatus().catch((error) => showBanner(error.message, "error"));
  }
}

function populateForm() {
  document.querySelectorAll("[data-path]").forEach((input) => {
    const path = input.dataset.path;
    const value = getByPath(config, path);

    if (input.dataset.type === "checkbox") {
      input.checked = Boolean(value);
      return;
    }

    if (input.dataset.type === "json") {
      input.value = JSON.stringify(value ?? {}, null, 2);
      return;
    }

    if (input.dataset.list === "true") {
      input.value = listToText(value);
      return;
    }

    input.value = value ?? "";
  });
}

function collectForm() {
  const next = structuredClone(config);

  document.querySelectorAll("[data-path]").forEach((input) => {
    const path = input.dataset.path;
    let value;

    if (input.dataset.type === "checkbox") {
      value = input.checked;
    } else if (input.dataset.type === "json") {
      value = JSON.parse(input.value || "{}");
    } else if (input.dataset.list === "true") {
      value = textToList(input.value);
    } else if (input.dataset.type === "number") {
      value = Number(input.value);
    } else {
      value = input.value;
    }

    setByPath(next, path, value);
  });

  return next;
}

async function loadAudit() {
  const data = await api("/config/audit?limit=20");
  const container = document.getElementById("audit-log");
  container.innerHTML = "";

  if (!data.entries.length) {
    container.textContent = "No changes recorded yet.";
    return;
  }

  data.entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "audit-entry";
    row.textContent = `${entry.updated_at} — ${entry.updated_by || "unknown"} — ${entry.summary}`;
    container.appendChild(row);
  });
}

async function loadConfig() {
  config = await api("/config");
  populateForm();
  await loadAudit();
  if (document.getElementById("blocklist-status-box")) {
    await loadBlocklistStatus();
  }
}

function showApp() {
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
}

function showLogin(message = "") {
  appScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  if (message) {
    loginError.textContent = message;
    loginError.classList.remove("hidden");
  } else {
    loginError.classList.add("hidden");
  }
}

async function connect() {
  apiKey = document.getElementById("api-key-input").value.trim();
  if (!apiKey) {
    showLogin("Enter an admin API key.");
    return;
  }

  try {
    const status = await api("/status", { auth: false });
    if (!status.admin_enabled) {
      showLogin(
        "Admin API is disabled on the server. Set ADMIN_API_KEY in Risk/.env and restart the Risk service."
      );
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, apiKey);
    buildTabs();
    await loadConfig();
    showApp();
  } catch (error) {
    sessionStorage.removeItem(STORAGE_KEY);
    if (error.message.includes("Invalid or missing admin API key")) {
      showLogin(
        "Invalid admin API key. Use the exact key from docker-compose.yml (Docker) or Risk/.env (local), then hard-refresh this page (Ctrl+F5)."
      );
    } else {
      showLogin(error.message);
    }
  }
}

document.getElementById("login-btn").addEventListener("click", connect);
document.getElementById("api-key-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    connect();
  }
});

document.getElementById("reload-btn").addEventListener("click", async () => {
  try {
    await loadConfig();
    showBanner("Configuration reloaded.");
  } catch (error) {
    showBanner(error.message, "error");
  }
});

document.getElementById("save-btn").addEventListener("click", async () => {
  try {
    const payload = collectForm();
    config = await api("/config", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    populateForm();
    await loadAudit();
    showBanner("Configuration saved. Most changes apply immediately; RabbitMQ/Redis toggles need a restart.");
  } catch (error) {
    showBanner(error.message, "error");
  }
});

document.getElementById("reset-btn").addEventListener("click", async () => {
  if (!window.confirm("Reset all runtime configuration to factory defaults?")) {
    return;
  }
  try {
    config = await api("/config/reset", { method: "POST" });
    populateForm();
    await loadAudit();
    showBanner("Configuration reset to defaults.");
  } catch (error) {
    showBanner(error.message, "error");
  }
});

buildTabs();
showLogin();
