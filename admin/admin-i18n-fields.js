/* Auto-generated — do not edit by hand. Run: node admin/scripts/build-field-i18n.mjs */
(function () {
  const FIELD_BUNDLES = {
  "en": {
    "decision_thresholds.challenge": {
      "label": "Challenge threshold",
      "description": "Minimum score for medium risk. Outcome is usually challenge (Turnstile, MFA, manual review) instead of allow.",
      "example": "40 — a player with score 39 is allow; score 40+ is challenge unless a hard-block signal fired."
    },
    "decision_thresholds.high": {
      "label": "High threshold",
      "description": "Minimum score for high risk. Login/signup often block; deposits/withdrawals/bets may block or need extra checks.",
      "example": "61 — score 60 stays medium/challenge; score 61+ is high risk."
    },
    "decision_thresholds.block": {
      "label": "Block threshold (critical)",
      "description": "Minimum score for critical risk. Usually results in block unless a hard-block signal on the Decision tab already forced block.",
      "example": "85 — score 84 may still be high; score 85+ is critical/block."
    },
    "operator.platform_name": {
      "label": "Platform name",
      "description": "Internal label for this operator instance. Used in logs and audit entries — not sent to players.",
      "example": "DoveBet EU",
      "signal": "unlicensed_jurisdiction (when country not in licensed markets)"
    },
    "operator.licensed_markets": {
      "label": "Licensed markets",
      "description": "Countries where you hold a gambling licence. Select from the list — checked on signup, deposit, and bet using player country or IP geo.",
      "example": "Select DE, GB, MT, SE — a player from FR with no licence raises unlicensed_jurisdiction.",
      "signal": "unlicensed_jurisdiction"
    },
    "ip_intel.enabled": {
      "label": "Enabled",
      "description": "Master toggle. When off, no external IP lookups run and no vpn/proxy/tor/hosting signals are emitted.",
      "example": "Off during local dev if you don't want outbound API calls.",
      "signal": "vpn_detected, proxy_detected, tor_exit_node, hosting_provider_ip"
    },
    "ip_intel.cache_ttl_seconds": {
      "label": "Cache TTL (seconds)",
      "description": "How long each IP lookup result is cached in Redis or memory before re-fetching.",
      "example": "3600 — same IP checked once per hour; lowers API usage but VPN toggles may lag up to 1 hour."
    },
    "ip_intel.timeout_seconds": {
      "label": "Lookup timeout (seconds)",
      "description": "Max wait per external IP API request. Affects evaluate latency when cache misses.",
      "example": "2.0 — fail or fail-open quickly; 5.0 — more time for slow APIs."
    },
    "ip_intel.fail_open": {
      "label": "Fail open on lookup error",
      "description": "When on, API timeout/error does not add risk. When off, lookup failure is treated as suspicious (VPN/proxy suspected).",
      "example": "On in production if IP API downtime must not block logins; off if you prefer strict behaviour."
    },
    "aml.single_deposit_threshold": {
      "label": "Single deposit review",
      "description": "Single payment.deposit at or above this amount triggers compliance review tier 1.",
      "example": "2000 — deposit of €2,000 raises elevated_deposit_aml_review.",
      "signal": "elevated_deposit_aml_review"
    },
    "aml.large_deposit_threshold": {
      "label": "Large deposit review",
      "description": "Highest deposit AML tier — for very large single deposits.",
      "example": "10000 — deposit of €10,000 raises large_deposit_aml_review.",
      "signal": "large_deposit_aml_review"
    },
    "aml.withdrawal_review_threshold": {
      "label": "Withdrawal review",
      "description": "Single payment.withdraw at or above this amount triggers cashout review signals.",
      "example": "1000 — withdrawal of €1,000 raises elevated_withdrawal_review and cashout_review_required.",
      "signal": "elevated_withdrawal_review, cashout_review_required"
    },
    "aml.structuring_threshold": {
      "label": "Structuring threshold",
      "description": "Flags deposits between 90% and 100% of this amount — pattern used to stay just under reporting limits.",
      "example": "3000 — deposit of €2,850 (95% of 3000) raises structuring_threshold_deposit.",
      "signal": "structuring_threshold_deposit"
    },
    "aml.micro_deposit_max": {
      "label": "Micro deposit max",
      "description": "Deposits strictly below this amount trigger bonus-farming / payment-testing detection.",
      "example": "10 — deposit of €5 raises micro_deposit_bonus_farming.",
      "signal": "micro_deposit_bonus_farming"
    },
    "aml.high_stake_bet_threshold": {
      "label": "High stake bet",
      "description": "Single wallet.bet / game.bet at or above this amount. Bets above €100 (fixed engine rule) also raise elevated_stake_bet.",
      "example": "500 — bet of €500 raises high_stake_bet.",
      "signal": "high_stake_bet, elevated_stake_bet"
    },
    "aml.blocklist.enabled": {
      "label": "Blocklist screening enabled",
      "description": "Master toggle for all AML blocklist engines (crypto, bank, country, etc.).",
      "example": "Off only if you run blocklist checks entirely outside AFS."
    },
    "aml.blocklist.crypto_enabled": {
      "label": "Crypto wallet screening",
      "description": "Check crypto payout addresses on payment.withdraw / payment.deposit against OFAC sync + manual list.",
      "example": "Send payment_method_type: crypto and payment_method_key: 0xabc… on withdraw evaluate.",
      "signal": "ofac_sanctioned_wallet, blocklisted_payout_address"
    },
    "aml.blocklist.bank_enabled": {
      "label": "Bank account screening",
      "description": "Check IBAN/bank account ids on bank payouts.",
      "example": "payment_method_type: bank, payment_method_key: DE89370400440532013000",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.ewallet_enabled": {
      "label": "E-wallet screening",
      "description": "Check e-wallet ids or emails on e-wallet payouts.",
      "example": "payment_method_type: ewallet, payment_method_key: skrill_user@email.com",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.card_enabled": {
      "label": "Card payout screening",
      "description": "Check card tokens or payout references on card withdrawals.",
      "example": "payment_method_type: card, payment_method_key: card_token_abc123",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.country_enabled": {
      "label": "Country blocklist screening",
      "description": "Block signup/login/deposit/withdraw when player country matches OFAC sync, Lists tab, or manual countries.",
      "example": "Player country KP with country blocklist enabled → blocklisted_country.",
      "signal": "blocklisted_country"
    },
    "aml.blocklist.sync_ofac_crypto_enabled": {
      "label": "Auto-sync OFAC crypto wallets",
      "description": "Pull U.S. Treasury SDN crypto addresses daily. Requires outbound HTTPS from Risk container.",
      "example": "Use Sync OFAC lists now button below after enabling."
    },
    "aml.blocklist.sync_ofac_countries_enabled": {
      "label": "Auto-sync OFAC countries",
      "description": "Load Treasury-derived sanctioned country ISO codes into Postgres on each sync.",
      "example": "Runs on schedule (sync interval) and on manual sync."
    },
    "aml.blocklist.sync_interval_hours": {
      "label": "Sync interval (hours)",
      "description": "How often the background job refreshes OFAC crypto and country lists.",
      "example": "24 — sync once per day; 6 for more frequent updates."
    },
    "aml.blocklist.fail_open": {
      "label": "Fail open if sync unavailable",
      "description": "When on, empty/stale blocklist DB does not block payouts. When off, missing sync data is treated as high risk.",
      "example": "On for production resilience; off for maximum compliance strictness."
    },
    "aml.blocklist.use_lists_sanctioned_countries": {
      "label": "Include Lists tab sanctioned countries",
      "description": "Merge Lists → sanctioned countries into country blocklist checks (in addition to OFAC sync and manual).",
      "example": "Add IR in Lists tab + enable this → Iranian players hit sanctioned_country.",
      "signal": "sanctioned_country"
    },
    "aml.blocklist.crypto_hit_score": {
      "label": "Payout blocklist hit score",
      "description": "Risk score added when any payout destination (crypto/bank/e-wallet/card) matches a blocklist entry.",
      "example": "90 — usually pushes decision toward block when combined with other signals."
    },
    "aml.blocklist.country_hit_score": {
      "label": "Country blocklist hit score",
      "description": "Risk score when player country matches blocklist.",
      "example": "90 — default; lower to 70 if you prefer challenge over block."
    },
    "aml.blocklist.manual_crypto_wallets": {
      "label": "Manual crypto wallets",
      "description": "Extra wallet addresses to block — one per line. Checked on crypto payouts in addition to OFAC sync.",
      "example": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    "aml.blocklist.manual_bank_accounts": {
      "label": "Manual bank accounts",
      "description": "IBANs or bank account identifiers to block — one per line.",
      "example": "DE89370400440532013000\\nGB82WEST12345698765432"
    },
    "aml.blocklist.manual_ewallet_accounts": {
      "label": "Manual e-wallet accounts",
      "description": "E-wallet ids or emails to block — one per line.",
      "example": "skrill:fraud_ring_01\\nneteller:abuse@test.com"
    },
    "aml.blocklist.manual_card_accounts": {
      "label": "Manual card payouts",
      "description": "Card tokens or payout references to block — one per line.",
      "example": "card_token_stolen_batch_42\\nvisa_payout_ref_99102"
    },
    "aml.blocklist.manual_countries": {
      "label": "Manual blocklisted countries",
      "description": "Countries to block on signup/login/deposit/withdraw. Merged with OFAC sync and Lists tab.",
      "example": "Select IR, KP, SY — players from those countries hit blocklisted_country when screening is on.",
      "signal": "blocklisted_country"
    },
    "withdrawal_method.enabled": {
      "label": "Enabled",
      "description": "When off, shared payout destination checks are skipped.",
      "example": "Requires payment_method_type + payment_method_key on every payment.withdraw evaluate.",
      "signal": "shared_withdrawal_method, multiple_accounts_shared_payout_method, multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_medium": {
      "label": "Distinct users (medium)",
      "description": "How many different user_ids must withdraw to the same payout key before medium tier fires.",
      "example": "2 — user A and user B both withdraw to IBAN DE89… → shared_withdrawal_method.",
      "signal": "shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_high": {
      "label": "Distinct users (high)",
      "description": "Distinct users threshold for high tier multi-account payout abuse.",
      "example": "3 — three accounts sharing one Skrill email.",
      "signal": "multiple_accounts_shared_payout_method"
    },
    "withdrawal_method.distinct_users_critical": {
      "label": "Distinct users (critical)",
      "description": "Distinct users threshold for critical tier — usually forces block when listed as a hard-block signal on the Decision tab.",
      "example": "4 — four accounts, same crypto wallet → multi_account_shared_withdrawal_method (hard block).",
      "signal": "multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.medium_score": {
      "label": "Medium score",
      "description": "Risk score added when distinct-users medium threshold is reached.",
      "example": "35 — combined with other engines to reach challenge/high."
    },
    "withdrawal_method.high_score": {
      "label": "High score",
      "description": "Risk score added when distinct-users high threshold is reached.",
      "example": "55"
    },
    "withdrawal_method.critical_score": {
      "label": "Critical score",
      "description": "Risk score added when distinct-users critical threshold is reached.",
      "example": "80 — often enough alone to block if decision threshold is ≤80."
    },
    "betting_patterns.enabled": {
      "label": "Enabled",
      "description": "Master toggle for sequential burst counters and win-rate ratio checks.",
      "example": "Off disables all signals in this tab."
    },
    "betting_patterns.burst_window_seconds": {
      "label": "Burst window (seconds)",
      "description": "Rolling time window for all burst counters and win-rate calculation.",
      "example": "300 — 10 game.bets in 5 minutes counts toward burst; window slides on each event."
    },
    "betting_patterns.game_bet_burst_medium": {
      "label": "game.bet burst — medium",
      "description": "Sequential game.bet events in window before medium burst signal.",
      "example": "10 — 10 bonus spins placed back-to-back within 300s.",
      "signal": "sequential_game_bet_burst"
    },
    "betting_patterns.game_bet_burst_high": {
      "label": "game.bet burst — high",
      "description": "Sequential game.bet count for high tier burst.",
      "example": "20",
      "signal": "sequential_game_bet_burst (higher score tier)"
    },
    "betting_patterns.game_bet_burst_critical": {
      "label": "game.bet burst — critical",
      "description": "Sequential game.bet count for critical tier burst.",
      "example": "35",
      "signal": "sequential_game_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_bet_burst_medium": {
      "label": "wallet.bet burst — medium",
      "description": "Sequential wallet.bet (real-money) events in window before medium burst.",
      "example": "20 — rapid live-casino betting bot pattern.",
      "signal": "sequential_wallet_bet_burst"
    },
    "betting_patterns.wallet_bet_burst_high": {
      "label": "wallet.bet burst — high",
      "description": "Sequential wallet.bet count for high tier.",
      "example": "40",
      "signal": "sequential_wallet_bet_burst (higher score tier)"
    },
    "betting_patterns.wallet_bet_burst_critical": {
      "label": "wallet.bet burst — critical",
      "description": "Sequential wallet.bet count for critical tier.",
      "example": "60",
      "signal": "sequential_wallet_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_win_burst_medium": {
      "label": "wallet.win burst — medium",
      "description": "Sequential wallet.win credits in window before medium win burst.",
      "example": "8 — many wins credited in quick succession.",
      "signal": "sequential_wallet_win_burst"
    },
    "betting_patterns.wallet_win_burst_high": {
      "label": "wallet.win burst — high",
      "description": "Sequential wallet.win count for high tier.",
      "example": "15",
      "signal": "sequential_wallet_win_burst (higher score tier)"
    },
    "betting_patterns.wallet_win_burst_critical": {
      "label": "wallet.win burst — critical",
      "description": "Sequential wallet.win count for critical tier.",
      "example": "25",
      "signal": "sequential_wallet_win_burst (critical score tier)"
    },
    "betting_patterns.win_rate_min_bets": {
      "label": "Win rate — min bets",
      "description": "Minimum wallet.bet + game.bet count in window before win-rate ratio is evaluated.",
      "example": "5 — need at least 5 bets; 4 wins / 4 bets is ignored until 5th bet arrives."
    },
    "betting_patterns.win_rate_high_ratio": {
      "label": "Win rate — high ratio",
      "description": "Wins ÷ bets ratio that triggers high win-rate signal (0–1).",
      "example": "0.75 — 6 wins out of 8 bets (75%) in window raises high_win_rate_in_betting_sequence.",
      "signal": "high_win_rate_in_betting_sequence"
    },
    "betting_patterns.win_rate_critical_ratio": {
      "label": "Win rate — critical ratio",
      "description": "Wins ÷ bets ratio for critical win-rate tier.",
      "example": "0.90 — 9 wins out of 10 bets raises critical_win_rate_in_betting_sequence.",
      "signal": "critical_win_rate_in_betting_sequence"
    },
    "hedge_betting.enabled": {
      "label": "Enabled",
      "description": "Master toggle for hedged-round detection and volume-washing ratio.",
      "example": "Off if you do not send metadata.game.selection and round_id yet."
    },
    "hedge_betting.window_seconds": {
      "label": "Stats window (seconds)",
      "description": "Rolling window for counting repeated hedged rounds and gross volume ratio.",
      "example": "3600 — count hedged rounds in the last hour per user."
    },
    "hedge_betting.round_leg_ttl_seconds": {
      "label": "Round leg TTL (seconds)",
      "description": "How long the first bet leg is stored while waiting for the opposite side on the same round_id.",
      "example": "600 — banker bet at 12:00:00; player bet at 12:09:59 still matches; at 12:10:01 leg expires."
    },
    "hedge_betting.time_pair_window_seconds": {
      "label": "Time-pair window (seconds)",
      "description": "Fallback grouping bucket when round_id is missing but table_id is present — bets within this window on same table may pair.",
      "example": "15 — only used if require_round_id is off and round_id absent."
    },
    "hedge_betting.require_round_id": {
      "label": "Require round_id",
      "description": "When on, hedge checks run only if metadata.game.round_id is present. Recommended once your backend sends round_id.",
      "example": "On in production — avoids false positives from time-pair fallback."
    },
    "hedge_betting.opposite_selection_groups": {
      "label": "Opposite selection groups",
      "description": "JSON array of groups. Selections in the same inner array are treated as opposites on the same round.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.amount_match_tolerance_percent": {
      "label": "Amount match tolerance (%)",
      "description": "Opposite legs must have stakes within this percentage of each other.",
      "example": "10 — banker €1000 + player €950 matches; player €800 does not."
    },
    "hedge_betting.opposite_side_same_round_score": {
      "label": "Score — opposite sides same round",
      "description": "Risk score when a single hedged round (opposite sides, matching amounts) is detected.",
      "example": "50 — fires on first detected banker+player pair.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.hedged_round_medium": {
      "label": "Hedged rounds — medium",
      "description": "Distinct hedged rounds in stats window before repeated-pattern signal (medium tier).",
      "example": "3 — three separate hedged hands in one hour.",
      "signal": "repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_high": {
      "label": "Hedged rounds — high",
      "description": "Distinct hedged rounds for high tier.",
      "example": "8",
      "signal": "high_repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_critical": {
      "label": "Hedged rounds — critical",
      "description": "Distinct hedged rounds for critical tier.",
      "example": "15",
      "signal": "critical_hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_enabled": {
      "label": "Volume washing check",
      "description": "When on, compare hedged gross bet volume to total gross bet volume in the stats window.",
      "example": "Player bets €6000 hedged + €4000 normal in 1h → 60% hedged share.",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.min_gross_volume": {
      "label": "Volume washing — min gross",
      "description": "Minimum total bet volume in window before volume-washing ratio is evaluated.",
      "example": "5000 — ignore ratio until player has at least €5000 gross bets in window."
    },
    "hedge_betting.min_hedged_gross_ratio": {
      "label": "Volume washing — min hedged ratio",
      "description": "Minimum hedged_gross ÷ total_gross ratio (0–1) to trigger volume washing signal.",
      "example": "0.5 — 50% or more of gross volume is hedged → hedged_bet_volume_washing (hard block if listed on Decision tab).",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_score": {
      "label": "Score — volume washing",
      "description": "Risk score added when volume-washing ratio threshold is met.",
      "example": "55 — combine with opposite_side score for higher total."
    },
    "step_up_verification.enabled": {
      "label": "Enabled",
      "description": "When off, step_up_verification metadata is ignored and challenge outcomes are not downgraded.",
      "example": "On when your frontend shows Turnstile on challenge responses."
    },
    "step_up_verification.grant_ttl_days": {
      "label": "Grant duration (days)",
      "description": "How long a successful verification grant lasts for the same user_id + device fingerprint.",
      "example": "7 — player passes Turnstile once; subsequent logins allow for 7 days on same device."
    },
    "step_up_verification.max_verified_age_minutes": {
      "label": "Max verified_at age (minutes)",
      "description": "metadata.verified_at must be within this many minutes of the evaluate request timestamp.",
      "example": "5 — siteverify at 12:00, evaluate at 12:06 → grant rejected as stale."
    },
    "step_up_verification.downgrade_challenge_to_allow": {
      "label": "Downgrade challenge to allow",
      "description": "When on, active grant changes challenge decision to allow. Never overrides block or critical signals.",
      "example": "On — typical production setting after Turnstile pass."
    },
    "step_up_verification.allowed_hostnames": {
      "label": "Allowed hostnames",
      "description": "Optional Cloudflare hostname allowlist from siteverify response — one per line. Empty = skip check.",
      "example": "casino.example.com\\nwww.casino.example.com"
    },
    "step_up_verification.applicable_event_types": {
      "label": "Applicable event types",
      "description": "Event types where step-up grant can downgrade challenge — one per line.",
      "example": "player.login\\nplayer.signup\\npayment.deposit"
    },
    "fingerprint.required_channels": {
      "label": "Required channels",
      "description": "Channels where context.fingerprint is expected. Missing value on these channels raises missing_fingerprint.",
      "example": "web,mobile — signup on web without visitorId → missing_fingerprint.",
      "signal": "missing_fingerprint"
    },
    "fingerprint.min_length": {
      "label": "Min length",
      "description": "Minimum valid FingerprintJS visitorId character length.",
      "example": "10 — abc123 (6 chars) → malformed_fingerprint.",
      "signal": "malformed_fingerprint"
    },
    "fingerprint.max_length": {
      "label": "Max length",
      "description": "Maximum valid visitorId length. Values outside min–max are rejected.",
      "example": "64",
      "signal": "malformed_fingerprint, invalid_fingerprint"
    },
    "fingerprint.suspicious_values": {
      "label": "Suspicious values",
      "description": "Known fake or placeholder fingerprint strings — one per line. Exact match fails validation.",
      "example": "undefined\\nnull\\n00000000-0000-0000-0000-000000000000",
      "signal": "invalid_fingerprint"
    },
    "lists.disposable_domains": {
      "label": "Disposable email domains",
      "description": "Throwaway email provider domains. Signup with these domains is usually hard-blocked.",
      "example": "mailinator.com\\n10minutemail.com\\nguerrillamail.com",
      "signal": "disposable_email"
    },
    "lists.high_risk_countries": {
      "label": "High-risk countries",
      "description": "Countries with elevated fraud rates. Adds score on geo/IP checks — not an automatic block.",
      "example": "Select NG, GH, PK — raises high_risk_country on matching geo/IP context.",
      "signal": "high_risk_country"
    },
    "lists.sanctioned_countries": {
      "label": "Sanctioned countries",
      "description": "Sanctioned or gambling-prohibited jurisdictions. Used when AML blocklist includes Lists tab.",
      "example": "Select IR, KP, CU — raises sanctioned_country on money events and login.",
      "signal": "sanctioned_country"
    },
    "lists.generic_names": {
      "label": "Generic names",
      "description": "Placeholder display names on signup/identity — one per line, case-insensitive.",
      "example": "test\\nuser\\nadmin\\nPlayer",
      "signal": "generic_name"
    },
    "lists.role_based_email_locals": {
      "label": "Role-based email locals",
      "description": "Email local parts (before @) that indicate non-personal accounts.",
      "example": "admin\\nsupport\\ninfo\\nnoreply",
      "signal": "role_based_email"
    },
    "lists.suspicious_email_tlds": {
      "label": "Suspicious email TLDs",
      "description": "Top-level domains associated with spam. Match when email ends with these TLDs.",
      "example": ".xyz\\n.top\\n.click",
      "signal": "suspicious_email_tld"
    },
    "lists.suspicious_email_local_tokens": {
      "label": "Suspicious email local tokens",
      "description": "Substrings in email local part that suggest throwaway or bot accounts.",
      "example": "temp\\nspam\\nbot\\nfake",
      "signal": "suspicious_email_pattern"
    },
    "lists.bot_user_agent_tokens": {
      "label": "Bot user-agent tokens",
      "description": "Substrings in User-Agent header indicating scripts or automation.",
      "example": "curl\\npython-requests\\nheadless\\nscrapy",
      "signal": "bot_user_agent"
    },
    "lists.emulator_ua_tokens": {
      "label": "Emulator UA tokens",
      "description": "User-Agent patterns for Android emulators or virtual devices.",
      "example": "genymotion\\nbluestacks\\nsdk_gphone",
      "signal": "emulator_detected"
    },
    "lists.suspicious_referrers": {
      "label": "Suspicious referrers",
      "description": "Exact referrer values treated as low-trust on signup.",
      "example": "direct\\nunknown\\n(empty line for blank referrer)",
      "signal": "suspicious_referrer"
    },
    "lists.bonus_abuse_referrer_tokens": {
      "label": "Bonus abuse referrer tokens",
      "description": "Substrings in signup referrer URL linked to bonus-hunting or affiliate abuse sites.",
      "example": "free-spins\\nno-deposit\\nbonus-hunter",
      "signal": "bonus_abuse_referrer"
    },
    "velocity_thresholds": {
      "label": "Velocity thresholds (JSON)",
      "description": "Map of threshold name → max count. Suffix _medium/_high/_critical selects tier. Do not delete keys — engines expect the full set.",
      "example": "{\\n  \"login_ip_medium\": 5,\\n  \"login_ip_high\": 15,\\n  \"login_ip_critical\": 30,\\n  \"signup_ip_critical\": 10,\\n  \"deposit_user_high\": 6\\n}",
      "signal": "medium_login_ip_velocity, bulk_login_attack, bulk_signup_attack, rapid_deposit_activity, …"
    },
    "critical_signals": {
      "label": "Hard-block signals",
      "description": "Exact signal name strings emitted by engines — one per line. Must match case exactly.",
      "example": "disposable_email\\nbulk_login_attack\\nhedged_bet_volume_washing\\nmulti_account_shared_withdrawal_method"
    },
    "features.sync_publish_audit": {
      "label": "Publish audit on sync /evaluate",
      "description": "When on, synchronous POST /evaluate results are also published to RabbitMQ for Orchestrator audit.",
      "example": "On when Orchestrator must see sync API decisions in the same pipeline as async events."
    },
    "features.decision_cache_ttl_seconds": {
      "label": "Decision cache TTL (seconds)",
      "description": "Cache identical event_id decisions in Redis to avoid re-scoring duplicates. Requires Redis enabled.",
      "example": "300 — same event_id within 5 minutes returns cached decision; 0 = disabled."
    },
    "features.redis_enabled": {
      "label": "Redis enabled",
      "description": "Use Redis for velocity counters, hedge/betting stores, and optional decision cache.",
      "example": "Off for single-instance dev (in-memory counters); on for production multi-instance."
    },
    "features.redis_velocity_ip_ttl": {
      "label": "Redis IP velocity TTL",
      "description": "Sliding window length (seconds) for IP-based velocity keys in Redis.",
      "example": "3600 — login_ip_high counts logins from one IP in the last hour."
    },
    "features.redis_velocity_domain_ttl": {
      "label": "Redis domain velocity TTL",
      "description": "Sliding window length for email-domain signup velocity counters.",
      "example": "86400 — signup_domain_* counts signups per domain in 24h."
    },
    "features.rabbitmq_enabled": {
      "label": "RabbitMQ consumer enabled",
      "description": "Start async consumer that scores events from the casino platform exchange/queue.",
      "example": "On when platform publishes wallet.bet, player.login, etc. to casino.events."
    },
    "features.rabbitmq_publish_results": {
      "label": "Publish results to Orchestrator",
      "description": "Publish scored EvaluateResponse messages to the results queue after async scoring.",
      "example": "On when Orchestrator subscribes to risk.results for audit/actions."
    },
    "features.rabbitmq_events_exchange": {
      "label": "Events exchange",
      "description": "Topic exchange the casino platform publishes to. Empty = legacy direct queue mode.",
      "example": "casino.events"
    },
    "features.rabbitmq_events_exchange_type": {
      "label": "Exchange type",
      "description": "RabbitMQ exchange type declared/bound by AFS consumer.",
      "example": "topic"
    },
    "features.rabbitmq_events_queue": {
      "label": "Events queue",
      "description": "Queue AFS consumes from after binding to the platform exchange.",
      "example": "casino.afs"
    },
    "features.rabbitmq_events_binding_key": {
      "label": "Binding key",
      "description": "Routing key pattern for queue binding. # = all messages on exchange.",
      "example": "# — all events; player.* — only player routing keys."
    },
    "features.rabbitmq_prefetch": {
      "label": "Prefetch count",
      "description": "Max unacknowledged messages per consumer channel.",
      "example": "10 — conservative; 50 — higher throughput, more memory."
    },
    "features.rabbitmq_results_queue": {
      "label": "Results queue",
      "description": "Outbound queue name for scored async results.",
      "example": "risk.results"
    },
    "logging.sync_enabled": {
      "label": "Sync request/response logging",
      "description": "Store full request and response payloads for POST /evaluate in Postgres. View under Log viewer below.",
      "example": "Enable during integration testing; disable in high-volume production if storage is a concern."
    },
    "logging.async_enabled": {
      "label": "Async request/response logging",
      "description": "Store RabbitMQ scored/skipped/rejected/failed messages with payloads where available.",
      "example": "Enable to debug casino.events → AFS pipeline without tailing container logs."
    }
  },
  "es": {
    "decision_thresholds.challenge": {
      "label": "Umbral de desafío",
      "description": "Puntuación mínima para riesgo medio. El resultado suele ser challenge (Turnstile, MFA, revisión manual) en lugar de allow.",
      "example": "40 — un jugador con puntuación 39 recibe allow; puntuación 40+ es challenge salvo que se haya activado una señal de bloqueo duro."
    },
    "decision_thresholds.high": {
      "label": "Umbral alto",
      "description": "Puntuación mínima para riesgo alto. Login/signup suelen bloquearse; depósitos/retiros/apuestas pueden bloquearse o requerir comprobaciones adicionales.",
      "example": "61 — puntuación 60 permanece en medio/challenge; puntuación 61+ es riesgo alto."
    },
    "decision_thresholds.block": {
      "label": "Umbral de bloqueo (crítico)",
      "description": "Puntuación mínima para riesgo crítico. Suele resultar en block salvo que una señal en la pestaña Decision ya haya forzado block.",
      "example": "85 — puntuación 84 puede seguir siendo alta; puntuación 85+ es crítico/block."
    },
    "operator.platform_name": {
      "label": "Nombre de la plataforma",
      "description": "Etiqueta interna de esta instancia de operador. Se usa en registros y entradas de auditoría — no se envía a los jugadores.",
      "example": "DoveBet EU",
      "signal": "unlicensed_jurisdiction (cuando el país no está en mercados con licencia)"
    },
    "operator.licensed_markets": {
      "label": "Mercados con licencia",
      "description": "Códigos de país ISO 3166-1 alpha-2 donde dispone de licencia de juego. Se comprueban en signup, deposit y bet usando el país del jugador o geolocalización IP.",
      "example": "DE,GB,MT,SE — jugador de FR sin licencia activa unlicensed_jurisdiction.",
      "signal": "unlicensed_jurisdiction"
    },
    "ip_intel.enabled": {
      "label": "Activado",
      "description": "Interruptor maestro. Si está desactivado, no se ejecutan consultas IP externas ni se emiten señales vpn/proxy/tor/hosting.",
      "example": "Desactivado en desarrollo local si no desea llamadas API salientes.",
      "signal": "vpn_detected, proxy_detected, tor_exit_node, hosting_provider_ip"
    },
    "ip_intel.cache_ttl_seconds": {
      "label": "TTL de caché (segundos)",
      "description": "Tiempo que se almacena en caché en Redis o memoria cada resultado de consulta IP antes de volver a obtenerlo.",
      "example": "3600 — la misma IP se comprueba una vez por hora; los cambios de VPN pueden retrasarse hasta 1 hora."
    },
    "ip_intel.timeout_seconds": {
      "label": "Tiempo de espera de consulta (segundos)",
      "description": "Espera máxima por solicitud a la API IP externa. Afecta la latencia de evaluate cuando hay fallos de caché.",
      "example": "2.0 — fallar o fail-open rápido; 5.0 — más tiempo para APIs lentas."
    },
    "ip_intel.fail_open": {
      "label": "Fail open ante error de consulta",
      "description": "Si está activado, un timeout/error de API no añade riesgo. Si está desactivado, el fallo de consulta se trata como sospechoso (VPN/proxy presunto).",
      "example": "Activado en producción si la caída de la API IP no debe bloquear logins; desactivado si prefiere comportamiento estricto."
    },
    "aml.single_deposit_threshold": {
      "label": "Revisión de depósito único",
      "description": "Un payment.deposit igual o superior a este importe activa la revisión de cumplimiento nivel 1.",
      "example": "2000 — depósito de €2.000 activa elevated_deposit_aml_review.",
      "signal": "elevated_deposit_aml_review"
    },
    "aml.large_deposit_threshold": {
      "label": "Revisión de depósito grande",
      "description": "Nivel AML de depósito más alto — para depósitos únicos muy grandes.",
      "example": "10000 — depósito de €10.000 activa large_deposit_aml_review.",
      "signal": "large_deposit_aml_review"
    },
    "aml.withdrawal_review_threshold": {
      "label": "Revisión de retiro",
      "description": "Un payment.withdraw igual o superior a este importe activa señales de revisión de cashout.",
      "example": "1000 — retiro de €1.000 activa elevated_withdrawal_review y cashout_review_required.",
      "signal": "elevated_withdrawal_review, cashout_review_required"
    },
    "aml.structuring_threshold": {
      "label": "Umbral de estructuración",
      "description": "Marca depósitos entre el 90 % y el 100 % de este importe — patrón usado para quedar justo por debajo de los límites de declaración.",
      "example": "3000 — depósito de €2.850 (95 % de 3000) activa structuring_threshold_deposit.",
      "signal": "structuring_threshold_deposit"
    },
    "aml.micro_deposit_max": {
      "label": "Máximo de microdepósito",
      "description": "Depósitos estrictamente inferiores a este importe activan detección de bonus-farming / pruebas de pago.",
      "example": "10 — depósito de €5 activa micro_deposit_bonus_farming.",
      "signal": "micro_deposit_bonus_farming"
    },
    "aml.high_stake_bet_threshold": {
      "label": "Apuesta de alto importe",
      "description": "Un wallet.bet / game.bet igual o superior a este importe. Apuestas por encima de €100 (regla fija del motor) también activan elevated_stake_bet.",
      "example": "500 — apuesta de €500 activa high_stake_bet.",
      "signal": "high_stake_bet, elevated_stake_bet"
    },
    "aml.blocklist.enabled": {
      "label": "Filtrado de blocklist activado",
      "description": "Interruptor maestro para todos los motores de blocklist AML (crypto, banco, país, etc.).",
      "example": "Desactivado solo si ejecuta comprobaciones de blocklist totalmente fuera de AFS."
    },
    "aml.blocklist.crypto_enabled": {
      "label": "Filtrado de monedero crypto",
      "description": "Comprueba direcciones crypto de pago en payment.withdraw / payment.deposit frente a sincronización OFAC + lista manual.",
      "example": "Envíe payment_method_type: crypto y payment_method_key: 0xabc… en evaluate de retiro.",
      "signal": "ofac_sanctioned_wallet, blocklisted_payout_address"
    },
    "aml.blocklist.bank_enabled": {
      "label": "Filtrado de cuenta bancaria",
      "description": "Comprueba IBAN/identificadores de cuenta bancaria en pagos bancarios.",
      "example": "payment_method_type: bank, payment_method_key: DE89370400440532013000",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.ewallet_enabled": {
      "label": "Filtrado de monedero electrónico",
      "description": "Comprueba identificadores o correos de monedero electrónico en pagos e-wallet.",
      "example": "payment_method_type: ewallet, payment_method_key: skrill_user@email.com",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.card_enabled": {
      "label": "Filtrado de pago con tarjeta",
      "description": "Comprueba tokens de tarjeta o referencias de pago en retiros con tarjeta.",
      "example": "payment_method_type: card, payment_method_key: card_token_abc123",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.country_enabled": {
      "label": "Filtrado de blocklist por país",
      "description": "Bloquea signup/login/deposit/withdraw cuando el país del jugador coincide con sincronización OFAC, pestaña Lists o países manuales.",
      "example": "País del jugador KP con blocklist de países activada → blocklisted_country.",
      "signal": "blocklisted_country"
    },
    "aml.blocklist.sync_ofac_crypto_enabled": {
      "label": "Auto-sincronizar monederos crypto OFAC",
      "description": "Obtiene diariamente direcciones crypto SDN del Tesoro de EE. UU. Requiere HTTPS saliente desde el contenedor Risk.",
      "example": "Use el botón Sync OFAC lists now abajo tras activar."
    },
    "aml.blocklist.sync_ofac_countries_enabled": {
      "label": "Auto-sincronizar países OFAC",
      "description": "Carga códigos ISO de países sancionados derivados del Tesoro en Postgres en cada sincronización.",
      "example": "Se ejecuta según programación (intervalo de sync) y en sync manual."
    },
    "aml.blocklist.sync_interval_hours": {
      "label": "Intervalo de sincronización (horas)",
      "description": "Con qué frecuencia el trabajo en segundo plano actualiza listas crypto y de países OFAC.",
      "example": "24 — sync una vez al día; 6 para actualizaciones más frecuentes."
    },
    "aml.blocklist.fail_open": {
      "label": "Fail open si sync no disponible",
      "description": "Si está activado, una BD de blocklist vacía/obsoleta no bloquea pagos. Si está desactivado, datos de sync ausentes se tratan como alto riesgo.",
      "example": "Activado para resiliencia en producción; desactivado para máximo cumplimiento estricto."
    },
    "aml.blocklist.use_lists_sanctioned_countries": {
      "label": "Incluir países sancionados de pestaña Lists",
      "description": "Fusiona Lists → sanctioned countries en comprobaciones de blocklist por país (además de sync OFAC y manual).",
      "example": "Añada IR en pestaña Lists + active esto → jugadores iraníes activan sanctioned_country.",
      "signal": "sanctioned_country"
    },
    "aml.blocklist.crypto_hit_score": {
      "label": "Puntuación de coincidencia en blocklist de pago",
      "description": "Puntuación de riesgo añadida cuando cualquier destino de pago (crypto/banco/e-wallet/tarjeta) coincide con una entrada de blocklist.",
      "example": "90 — suele empujar la decisión hacia block combinado con otras señales."
    },
    "aml.blocklist.country_hit_score": {
      "label": "Puntuación de coincidencia en blocklist por país",
      "description": "Puntuación de riesgo cuando el país del jugador coincide con la blocklist.",
      "example": "90 — predeterminado; baje a 70 si prefiere challenge en lugar de block."
    },
    "aml.blocklist.manual_crypto_wallets": {
      "label": "Monederos crypto manuales",
      "description": "Direcciones de monedero adicionales a bloquear — una por línea. Se comprueban en pagos crypto además de sync OFAC.",
      "example": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    "aml.blocklist.manual_bank_accounts": {
      "label": "Cuentas bancarias manuales",
      "description": "IBAN o identificadores de cuenta bancaria a bloquear — uno por línea.",
      "example": "DE89370400440532013000\\nGB82WEST12345698765432"
    },
    "aml.blocklist.manual_ewallet_accounts": {
      "label": "Cuentas e-wallet manuales",
      "description": "Identificadores o correos de monedero electrónico a bloquear — uno por línea.",
      "example": "skrill:fraud_ring_01\\nneteller:abuse@test.com"
    },
    "aml.blocklist.manual_card_accounts": {
      "label": "Pagos con tarjeta manuales",
      "description": "Tokens de tarjeta o referencias de pago a bloquear — uno por línea.",
      "example": "card_token_stolen_batch_42\\nvisa_payout_ref_99102"
    },
    "aml.blocklist.manual_countries": {
      "label": "Países en blocklist manual",
      "description": "Códigos ISO 3166-1 alpha-2 a bloquear — uno por línea. Se fusionan con sync OFAC y pestaña Lists.",
      "example": "IR\\nKP\\nSY",
      "signal": "blocklisted_country"
    },
    "withdrawal_method.enabled": {
      "label": "Activado",
      "description": "Si está desactivado, se omiten las comprobaciones compartidas de destino de pago.",
      "example": "Requiere payment_method_type + payment_method_key en cada evaluate de payment.withdraw.",
      "signal": "shared_withdrawal_method, multiple_accounts_shared_payout_method, multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_medium": {
      "label": "Usuarios distintos (medio)",
      "description": "Cuántos user_ids distintos deben retirar a la misma clave de pago antes de que se active el nivel medio.",
      "example": "2 — usuario A y usuario B retiran al IBAN DE89… → shared_withdrawal_method.",
      "signal": "shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_high": {
      "label": "Usuarios distintos (alto)",
      "description": "Umbral de usuarios distintos para abuso de pago multi-cuenta de nivel alto.",
      "example": "3 — tres cuentas comparten un correo Skrill.",
      "signal": "multiple_accounts_shared_payout_method"
    },
    "withdrawal_method.distinct_users_critical": {
      "label": "Usuarios distintos (crítico)",
      "description": "Umbral de usuarios distintos para nivel crítico — suele forzar block vía pestaña Decision.",
      "example": "4 — cuatro cuentas, mismo monedero crypto → multi_account_shared_withdrawal_method (bloqueo duro).",
      "signal": "multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.medium_score": {
      "label": "Puntuación media",
      "description": "Puntuación de riesgo añadida cuando se alcanza el umbral medio de usuarios distintos.",
      "example": "35 — combinada con otros motores para alcanzar challenge/high."
    },
    "withdrawal_method.high_score": {
      "label": "Puntuación alta",
      "description": "Puntuación de riesgo añadida cuando se alcanza el umbral alto de usuarios distintos.",
      "example": "55"
    },
    "withdrawal_method.critical_score": {
      "label": "Puntuación crítica",
      "description": "Puntuación de riesgo añadida cuando se alcanza el umbral crítico de usuarios distintos.",
      "example": "80 — a menudo suficiente sola para block si el umbral de decisión es ≤80."
    },
    "betting_patterns.enabled": {
      "label": "Activado",
      "description": "Interruptor maestro para contadores de ráfaga secuencial y comprobaciones de ratio de victorias.",
      "example": "Desactivado deshabilita todas las señales de esta pestaña."
    },
    "betting_patterns.burst_window_seconds": {
      "label": "Ventana de ráfaga (segundos)",
      "description": "Ventana temporal móvil para todos los contadores de ráfaga y cálculo de ratio de victorias.",
      "example": "300 — 10 game.bets en 5 minutos cuentan para la ráfaga; la ventana se desplaza en cada evento."
    },
    "betting_patterns.game_bet_burst_medium": {
      "label": "Ráfaga game.bet — medio",
      "description": "Eventos game.bet secuenciales en la ventana antes de la señal de ráfaga media.",
      "example": "10 — 10 giros de bono colocados seguidos en 300 s.",
      "signal": "sequential_game_bet_burst"
    },
    "betting_patterns.game_bet_burst_high": {
      "label": "Ráfaga game.bet — alto",
      "description": "Recuento secuencial de game.bet para ráfaga de nivel alto.",
      "example": "20",
      "signal": "sequential_game_bet_burst (higher score tier)"
    },
    "betting_patterns.game_bet_burst_critical": {
      "label": "Ráfaga game.bet — crítico",
      "description": "Recuento secuencial de game.bet para ráfaga de nivel crítico.",
      "example": "35",
      "signal": "sequential_game_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_bet_burst_medium": {
      "label": "Ráfaga wallet.bet — medio",
      "description": "Eventos wallet.bet (dinero real) secuenciales en la ventana antes de ráfaga media.",
      "example": "20 — patrón de bot de apuestas rápidas en casino en vivo.",
      "signal": "sequential_wallet_bet_burst"
    },
    "betting_patterns.wallet_bet_burst_high": {
      "label": "Ráfaga wallet.bet — alto",
      "description": "Recuento secuencial de wallet.bet para nivel alto.",
      "example": "40",
      "signal": "sequential_wallet_bet_burst (higher score tier)"
    },
    "betting_patterns.wallet_bet_burst_critical": {
      "label": "Ráfaga wallet.bet — crítico",
      "description": "Recuento secuencial de wallet.bet para nivel crítico.",
      "example": "60",
      "signal": "sequential_wallet_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_win_burst_medium": {
      "label": "Ráfaga wallet.win — medio",
      "description": "Créditos wallet.win secuenciales en la ventana antes de ráfaga de victorias media.",
      "example": "8 — muchas victorias acreditadas en rápida sucesión.",
      "signal": "sequential_wallet_win_burst"
    },
    "betting_patterns.wallet_win_burst_high": {
      "label": "Ráfaga wallet.win — alto",
      "description": "Recuento secuencial de wallet.win para nivel alto.",
      "example": "15",
      "signal": "sequential_wallet_win_burst (higher score tier)"
    },
    "betting_patterns.wallet_win_burst_critical": {
      "label": "Ráfaga wallet.win — crítico",
      "description": "Recuento secuencial de wallet.win para nivel crítico.",
      "example": "25",
      "signal": "sequential_wallet_win_burst (critical score tier)"
    },
    "betting_patterns.win_rate_min_bets": {
      "label": "Ratio de victorias — apuestas mín.",
      "description": "Recuento mínimo de wallet.bet + game.bet en la ventana antes de evaluar el ratio de victorias.",
      "example": "5 — se necesitan al menos 5 apuestas; 4 victorias / 4 apuestas se ignoran hasta la 5.ª apuesta."
    },
    "betting_patterns.win_rate_high_ratio": {
      "label": "Ratio de victorias — ratio alto",
      "description": "Ratio victorias ÷ apuestas que activa la señal de ratio alto de victorias (0–1).",
      "example": "0.75 — 6 victorias de 8 apuestas (75 %) en la ventana activa high_win_rate_in_betting_sequence.",
      "signal": "high_win_rate_in_betting_sequence"
    },
    "betting_patterns.win_rate_critical_ratio": {
      "label": "Ratio de victorias — ratio crítico",
      "description": "Ratio victorias ÷ apuestas para nivel crítico de ratio de victorias.",
      "example": "0.90 — 9 victorias de 10 apuestas activa critical_win_rate_in_betting_sequence.",
      "signal": "critical_win_rate_in_betting_sequence"
    },
    "hedge_betting.enabled": {
      "label": "Activado",
      "description": "Interruptor maestro para detección de rondas cubiertas y ratio de lavado de volumen.",
      "example": "Desactivado si aún no envía metadata.game.selection y round_id."
    },
    "hedge_betting.window_seconds": {
      "label": "Ventana de estadísticas (segundos)",
      "description": "Ventana móvil para contar rondas cubiertas repetidas y ratio de volumen bruto.",
      "example": "3600 — contar rondas cubiertas en la última hora por usuario."
    },
    "hedge_betting.round_leg_ttl_seconds": {
      "label": "TTL de pierna de ronda (segundos)",
      "description": "Tiempo que se almacena la primera pierna de apuesta mientras se espera el lado opuesto en el mismo round_id.",
      "example": "600 — apuesta banker a las 12:00:00; apuesta player a las 12:09:59 aún coincide; a las 12:10:01 la pierna expira."
    },
    "hedge_betting.time_pair_window_seconds": {
      "label": "Ventana de emparejamiento temporal (segundos)",
      "description": "Bucket de agrupación alternativo cuando falta round_id pero existe table_id — apuestas en esta ventana en la misma mesa pueden emparejarse.",
      "example": "15 — solo se usa si require_round_id está desactivado y round_id ausente."
    },
    "hedge_betting.require_round_id": {
      "label": "Requerir round_id",
      "description": "Si está activado, las comprobaciones de cobertura solo se ejecutan si metadata.game.round_id está presente. Recomendado cuando su backend envía round_id.",
      "example": "Activado en producción — evita falsos positivos del emparejamiento temporal alternativo."
    },
    "hedge_betting.opposite_selection_groups": {
      "label": "Grupos de selección opuesta",
      "description": "Array JSON de grupos. Las selecciones en el mismo array interno se tratan como opuestas en la misma ronda.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.amount_match_tolerance_percent": {
      "label": "Tolerancia de coincidencia de importe (%)",
      "description": "Las piernas opuestas deben tener stakes dentro de este porcentaje entre sí.",
      "example": "10 — banker €1000 + player €950 coincide; player €800 no."
    },
    "hedge_betting.opposite_side_same_round_score": {
      "label": "Puntuación — lados opuestos misma ronda",
      "description": "Puntuación de riesgo cuando se detecta una ronda cubierta (lados opuestos, importes coincidentes).",
      "example": "50 — se activa en el primer par banker+player detectado.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.hedged_round_medium": {
      "label": "Rondas cubiertas — medio",
      "description": "Rondas cubiertas distintas en la ventana de estadísticas antes de la señal de patrón repetido (nivel medio).",
      "example": "3 — tres manos cubiertas separadas en una hora.",
      "signal": "repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_high": {
      "label": "Rondas cubiertas — alto",
      "description": "Rondas cubiertas distintas para nivel alto.",
      "example": "8",
      "signal": "high_repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_critical": {
      "label": "Rondas cubiertas — crítico",
      "description": "Rondas cubiertas distintas para nivel crítico.",
      "example": "15",
      "signal": "critical_hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_enabled": {
      "label": "Comprobación de lavado de volumen",
      "description": "Si está activado, compara el volumen bruto de apuestas cubiertas con el volumen bruto total en la ventana de estadísticas.",
      "example": "Jugador apuesta €6000 cubiertas + €4000 normales en 1 h → 60 % de participación cubierta.",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.min_gross_volume": {
      "label": "Lavado de volumen — bruto mín.",
      "description": "Volumen total mínimo de apuestas en la ventana antes de evaluar el ratio de lavado de volumen.",
      "example": "5000 — ignorar ratio hasta que el jugador tenga al menos €5000 de apuestas brutas en la ventana."
    },
    "hedge_betting.min_hedged_gross_ratio": {
      "label": "Lavado de volumen — ratio cubierto mín.",
      "description": "Ratio mínimo hedged_gross ÷ total_gross (0–1) para activar la señal de lavado de volumen.",
      "example": "0.5 — 50 % o más del volumen bruto está cubierto → hedged_bet_volume_washing (bloqueo duro si está en Decision).",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_score": {
      "label": "Puntuación — lavado de volumen",
      "description": "Puntuación de riesgo añadida cuando se cumple el umbral de ratio de lavado de volumen.",
      "example": "55 — combinar con puntuación opposite_side para total más alto."
    },
    "step_up_verification.enabled": {
      "label": "Activado",
      "description": "Si está desactivado, se ignora metadata step_up_verification y los resultados challenge no se degradan.",
      "example": "Activado cuando su frontend muestra Turnstile en respuestas challenge."
    },
    "step_up_verification.grant_ttl_days": {
      "label": "Duración de concesión (días)",
      "description": "Tiempo que dura una concesión de verificación exitosa para el mismo user_id + device fingerprint.",
      "example": "7 — el jugador pasa Turnstile una vez; logins posteriores permitidos 7 días en el mismo dispositivo."
    },
    "step_up_verification.max_verified_age_minutes": {
      "label": "Edad máx. de verified_at (minutos)",
      "description": "metadata.verified_at debe estar dentro de estos minutos respecto a la marca temporal de la solicitud evaluate.",
      "example": "5 — siteverify a las 12:00, evaluate a las 12:06 → concesión rechazada por obsoleta."
    },
    "step_up_verification.downgrade_challenge_to_allow": {
      "label": "Degradar challenge a allow",
      "description": "Si está activado, una concesión activa cambia la decisión challenge a allow. Nunca anula block ni señales críticas.",
      "example": "Activado — configuración típica de producción tras pasar Turnstile."
    },
    "step_up_verification.allowed_hostnames": {
      "label": "Nombres de host permitidos",
      "description": "Lista blanca opcional de nombres de host Cloudflare de la respuesta siteverify — uno por línea. Vacío = omitir comprobación.",
      "example": "casino.example.com\\nwww.casino.example.com"
    },
    "step_up_verification.applicable_event_types": {
      "label": "Tipos de evento aplicables",
      "description": "Tipos de evento donde la concesión step-up puede degradar challenge — uno por línea.",
      "example": "player.login\\nplayer.signup\\npayment.deposit"
    },
    "fingerprint.required_channels": {
      "label": "Canales requeridos",
      "description": "Canales donde se espera context.fingerprint. Un valor ausente en estos canales activa missing_fingerprint.",
      "example": "web,mobile — signup en web sin visitorId → missing_fingerprint.",
      "signal": "missing_fingerprint"
    },
    "fingerprint.min_length": {
      "label": "Longitud mínima",
      "description": "Longitud mínima de caracteres válida del visitorId de FingerprintJS.",
      "example": "10 — abc123 (6 caracteres) → malformed_fingerprint.",
      "signal": "malformed_fingerprint"
    },
    "fingerprint.max_length": {
      "label": "Longitud máxima",
      "description": "Longitud máxima válida de visitorId. Valores fuera de min–max se rechazan.",
      "example": "64",
      "signal": "malformed_fingerprint, invalid_fingerprint"
    },
    "fingerprint.suspicious_values": {
      "label": "Valores sospechosos",
      "description": "Cadenas de huella digital falsas o de marcador de posición conocidas — una por línea. Coincidencia exacta falla la validación.",
      "example": "undefined\\nnull\\n00000000-0000-0000-0000-000000000000",
      "signal": "invalid_fingerprint"
    },
    "lists.disposable_domains": {
      "label": "Dominios de correo desechable",
      "description": "Dominios de proveedores de correo temporal. Signup con estos dominios suele bloquearse de forma dura.",
      "example": "mailinator.com\\n10minutemail.com\\nguerrillamail.com",
      "signal": "disposable_email"
    },
    "lists.high_risk_countries": {
      "label": "Países de alto riesgo",
      "description": "Códigos de país ISO con tasas elevadas de fraude. Añade puntuación en comprobaciones geo/IP — no es bloqueo automático.",
      "example": "NG\\nGH\\nPK",
      "signal": "high_risk_country"
    },
    "lists.sanctioned_countries": {
      "label": "Países sancionados",
      "description": "Códigos ISO de jurisdicciones sancionadas o con juego prohibido. Se usan cuando la blocklist AML incluye la pestaña Lists.",
      "example": "IR\\nKP\\nCU",
      "signal": "sanctioned_country"
    },
    "lists.generic_names": {
      "label": "Nombres genéricos",
      "description": "Nombres para mostrar de marcador de posición en signup/identidad — uno por línea, sin distinguir mayúsculas.",
      "example": "test\\nuser\\nadmin\\nPlayer",
      "signal": "generic_name"
    },
    "lists.role_based_email_locals": {
      "label": "Partes locales de correo por rol",
      "description": "Partes locales del correo (antes de @) que indican cuentas no personales.",
      "example": "admin\\nsupport\\ninfo\\nnoreply",
      "signal": "role_based_email"
    },
    "lists.suspicious_email_tlds": {
      "label": "TLD de correo sospechosos",
      "description": "Dominios de nivel superior asociados a spam. Coinciden cuando el correo termina con estos TLD.",
      "example": ".xyz\\n.top\\n.click",
      "signal": "suspicious_email_tld"
    },
    "lists.suspicious_email_local_tokens": {
      "label": "Tokens locales de correo sospechosos",
      "description": "Subcadenas en la parte local del correo que sugieren cuentas temporales o de bot.",
      "example": "temp\\nspam\\nbot\\nfake",
      "signal": "suspicious_email_pattern"
    },
    "lists.bot_user_agent_tokens": {
      "label": "Tokens User-Agent de bot",
      "description": "Subcadenas en la cabecera User-Agent que indican scripts o automatización.",
      "example": "curl\\npython-requests\\nheadless\\nscrapy",
      "signal": "bot_user_agent"
    },
    "lists.emulator_ua_tokens": {
      "label": "Tokens UA de emulador",
      "description": "Patrones User-Agent de emuladores Android o dispositivos virtuales.",
      "example": "genymotion\\nbluestacks\\nsdk_gphone",
      "signal": "emulator_detected"
    },
    "lists.suspicious_referrers": {
      "label": "Referentes sospechosos",
      "description": "Valores exactos de referente tratados como poca confianza en signup.",
      "example": "direct\\nunknown\\n(línea vacía para referente en blanco)",
      "signal": "suspicious_referrer"
    },
    "lists.bonus_abuse_referrer_tokens": {
      "label": "Tokens de referente de abuso de bono",
      "description": "Subcadenas en la URL de referente de signup vinculadas a sitios de caza de bonos o abuso de afiliados.",
      "example": "free-spins\\nno-deposit\\nbonus-hunter",
      "signal": "bonus_abuse_referrer"
    },
    "velocity_thresholds": {
      "label": "Umbrales de velocidad (JSON)",
      "description": "Mapa de nombre de umbral → recuento máx. El sufijo _medium/_high/_critical selecciona el nivel. No elimine claves — los motores esperan el conjunto completo.",
      "example": "{\\n  \"login_ip_medium\": 5,\\n  \"login_ip_high\": 15,\\n  \"login_ip_critical\": 30,\\n  \"signup_ip_critical\": 10,\\n  \"deposit_user_high\": 6\\n}",
      "signal": "medium_login_ip_velocity, bulk_login_attack, bulk_signup_attack, rapid_deposit_activity, …"
    },
    "critical_signals": {
      "label": "Señales de bloqueo duro",
      "description": "Cadenas exactas de nombres de señal emitidas por los motores — una por línea. Deben coincidir exactamente en mayúsculas/minúsculas.",
      "example": "disposable_email\\nbulk_login_attack\\nhedged_bet_volume_washing\\nmulti_account_shared_withdrawal_method"
    },
    "features.sync_publish_audit": {
      "label": "Publicar auditoría en sync /evaluate",
      "description": "Si está activado, los resultados síncronos POST /evaluate también se publican en RabbitMQ para auditoría del Orchestrator.",
      "example": "Activado cuando el Orchestrator debe ver decisiones de API sync en el mismo pipeline que eventos async."
    },
    "features.decision_cache_ttl_seconds": {
      "label": "TTL de caché de decisión (segundos)",
      "description": "Almacena en caché decisiones idénticas de event_id en Redis para evitar re-puntuar duplicados. Requiere Redis activado.",
      "example": "300 — mismo event_id en 5 minutos devuelve decisión en caché; 0 = desactivado."
    },
    "features.redis_enabled": {
      "label": "Redis activado",
      "description": "Usa Redis para contadores de velocidad, almacenes hedge/betting y caché de decisión opcional.",
      "example": "Desactivado para dev de instancia única (contadores en memoria); activado para producción multi-instancia."
    },
    "features.redis_velocity_ip_ttl": {
      "label": "TTL de velocidad IP en Redis",
      "description": "Longitud de ventana deslizante (segundos) para claves de velocidad basadas en IP en Redis.",
      "example": "3600 — login_ip_high cuenta logins desde una IP en la última hora."
    },
    "features.redis_velocity_domain_ttl": {
      "label": "TTL de velocidad de dominio en Redis",
      "description": "Longitud de ventana deslizante para contadores de velocidad de signup por dominio de correo.",
      "example": "86400 — signup_domain_* cuenta signups por dominio en 24 h."
    },
    "features.rabbitmq_enabled": {
      "label": "Consumidor RabbitMQ activado",
      "description": "Inicia consumidor async que puntúa eventos del exchange/cola de la plataforma de casino.",
      "example": "Activado cuando la plataforma publica wallet.bet, player.login, etc. en casino.events."
    },
    "features.rabbitmq_publish_results": {
      "label": "Publicar resultados al Orchestrator",
      "description": "Publica mensajes EvaluateResponse puntuados en la cola de resultados tras puntuación async.",
      "example": "Activado cuando el Orchestrator se suscribe a risk.results para auditoría/acciones."
    },
    "features.rabbitmq_events_exchange": {
      "label": "Exchange de eventos",
      "description": "Exchange topic al que publica la plataforma de casino. Vacío = modo cola directa heredado.",
      "example": "casino.events"
    },
    "features.rabbitmq_events_exchange_type": {
      "label": "Tipo de exchange",
      "description": "Tipo de exchange RabbitMQ declarado/enlazado por el consumidor AFS.",
      "example": "topic"
    },
    "features.rabbitmq_events_queue": {
      "label": "Cola de eventos",
      "description": "Cola desde la que AFS consume tras enlazar al exchange de la plataforma.",
      "example": "casino.afs"
    },
    "features.rabbitmq_events_binding_key": {
      "label": "Clave de enlace",
      "description": "Patrón de routing key para enlace de cola. # = todos los mensajes en el exchange.",
      "example": "# — todos los eventos; player.* — solo routing keys player."
    },
    "features.rabbitmq_prefetch": {
      "label": "Recuento prefetch",
      "description": "Máximo de mensajes sin confirmar por canal de consumidor.",
      "example": "10 — conservador; 50 — mayor rendimiento, más memoria."
    },
    "features.rabbitmq_results_queue": {
      "label": "Cola de resultados",
      "description": "Nombre de cola saliente para resultados async puntuados.",
      "example": "risk.results"
    },
    "logging.sync_enabled": {
      "label": "Registro de solicitud/respuesta sync",
      "description": "Almacena cargas completas de solicitud y respuesta para POST /evaluate en Postgres. Ver en Log viewer abajo.",
      "example": "Activar durante pruebas de integración; desactivar en producción de alto volumen si el almacenamiento es una preocupación."
    },
    "logging.async_enabled": {
      "label": "Registro de solicitud/respuesta async",
      "description": "Almacena mensajes RabbitMQ puntuados/omitidos/rechazados/fallidos con cargas cuando estén disponibles.",
      "example": "Activar para depurar pipeline casino.events → AFS sin seguir logs del contenedor."
    }
  },
  "ru": {
    "decision_thresholds.challenge": {
      "label": "Порог challenge",
      "description": "Минимальный балл для среднего риска. Результат обычно challenge (Turnstile, MFA, ручная проверка) вместо allow.",
      "example": "40 — игрок с баллом 39 получает allow; балл 40+ — challenge, если не сработал сигнал жёсткой блокировки."
    },
    "decision_thresholds.high": {
      "label": "Высокий порог",
      "description": "Минимальный балл для высокого риска. Login/signup часто блокируются; депозиты/выводы/ставки могут блокироваться или требовать дополнительных проверок.",
      "example": "61 — балл 60 остаётся средним/challenge; балл 61+ — высокий риск."
    },
    "decision_thresholds.block": {
      "label": "Порог блокировки (критический)",
      "description": "Минимальный балл для критического риска. Обычно приводит к block, если сигнал на вкладке Decision ещё не принудил block.",
      "example": "85 — балл 84 может оставаться высоким; балл 85+ — критический/block."
    },
    "operator.platform_name": {
      "label": "Название платформы",
      "description": "Внутренняя метка этого экземпляра оператора. Используется в логах и записях аудита — не отправляется игрокам.",
      "example": "DoveBet EU",
      "signal": "unlicensed_jurisdiction (когда страна не в лицензированных рынках)"
    },
    "operator.licensed_markets": {
      "label": "Лицензированные рынки",
      "description": "Коды стран ISO 3166-1 alpha-2, где у вас есть лицензия на азартные игры. Проверяются при signup, deposit и bet по стране игрока или IP-геолокации.",
      "example": "DE,GB,MT,SE — игрок из FR без лицензии вызывает unlicensed_jurisdiction.",
      "signal": "unlicensed_jurisdiction"
    },
    "ip_intel.enabled": {
      "label": "Включено",
      "description": "Главный переключатель. При выключении внешние IP-запросы не выполняются и сигналы vpn/proxy/tor/hosting не генерируются.",
      "example": "Выключено при локальной разработке, если не нужны исходящие API-вызовы.",
      "signal": "vpn_detected, proxy_detected, tor_exit_node, hosting_provider_ip"
    },
    "ip_intel.cache_ttl_seconds": {
      "label": "TTL кэша (секунды)",
      "description": "Как долго результат IP-запроса хранится в Redis или памяти перед повторным получением.",
      "example": "3600 — один IP проверяется раз в час; переключение VPN может отставать до 1 часа."
    },
    "ip_intel.timeout_seconds": {
      "label": "Таймаут запроса (секунды)",
      "description": "Максимальное ожидание на внешний IP API-запрос. Влияет на задержку evaluate при промахе кэша.",
      "example": "2.0 — быстрый fail или fail-open; 5.0 — больше времени для медленных API."
    },
    "ip_intel.fail_open": {
      "label": "Fail open при ошибке запроса",
      "description": "При включении таймаут/ошибка API не добавляет риск. При выключении сбой запроса трактуется как подозрительный (предполагается VPN/proxy).",
      "example": "Включено в production, если простой IP API не должен блокировать login; выключено для строгого поведения."
    },
    "aml.single_deposit_threshold": {
      "label": "Проверка одиночного депозита",
      "description": "Один payment.deposit на эту сумму или выше запускает compliance review уровня 1.",
      "example": "2000 — депозит €2 000 вызывает elevated_deposit_aml_review.",
      "signal": "elevated_deposit_aml_review"
    },
    "aml.large_deposit_threshold": {
      "label": "Проверка крупного депозита",
      "description": "Высший AML-уровень депозита — для очень крупных одиночных депозитов.",
      "example": "10000 — депозит €10 000 вызывает large_deposit_aml_review.",
      "signal": "large_deposit_aml_review"
    },
    "aml.withdrawal_review_threshold": {
      "label": "Проверка вывода",
      "description": "Один payment.withdraw на эту сумму или выше запускает сигналы проверки cashout.",
      "example": "1000 — вывод €1 000 вызывает elevated_withdrawal_review и cashout_review_required.",
      "signal": "elevated_withdrawal_review, cashout_review_required"
    },
    "aml.structuring_threshold": {
      "label": "Порог структурирования",
      "description": "Помечает депозиты от 90% до 100% этой суммы — схема для удержания чуть ниже лимитов отчётности.",
      "example": "3000 — депозит €2 850 (95% от 3000) вызывает structuring_threshold_deposit.",
      "signal": "structuring_threshold_deposit"
    },
    "aml.micro_deposit_max": {
      "label": "Макс. микродепозита",
      "description": "Депозиты строго ниже этой суммы запускают обнаружение bonus-farming / тестирования платежей.",
      "example": "10 — депозит €5 вызывает micro_deposit_bonus_farming.",
      "signal": "micro_deposit_bonus_farming"
    },
    "aml.high_stake_bet_threshold": {
      "label": "Ставка с высокой суммой",
      "description": "Один wallet.bet / game.bet на эту сумму или выше. Ставки выше €100 (фиксированное правило движка) также вызывают elevated_stake_bet.",
      "example": "500 — ставка €500 вызывает high_stake_bet.",
      "signal": "high_stake_bet, elevated_stake_bet"
    },
    "aml.blocklist.enabled": {
      "label": "Скрининг blocklist включён",
      "description": "Главный переключатель для всех AML blocklist-движков (crypto, банк, страна и т.д.).",
      "example": "Выключено только если проверки blocklist полностью выполняются вне AFS."
    },
    "aml.blocklist.crypto_enabled": {
      "label": "Скрининг crypto-кошельков",
      "description": "Проверка crypto-адресов выплат при payment.withdraw / payment.deposit по OFAC sync + ручному списку.",
      "example": "Отправьте payment_method_type: crypto и payment_method_key: 0xabc… при evaluate вывода.",
      "signal": "ofac_sanctioned_wallet, blocklisted_payout_address"
    },
    "aml.blocklist.bank_enabled": {
      "label": "Скрининг банковских счетов",
      "description": "Проверка IBAN/идентификаторов банковских счетов при банковских выплатах.",
      "example": "payment_method_type: bank, payment_method_key: DE89370400440532013000",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.ewallet_enabled": {
      "label": "Скрининг e-wallet",
      "description": "Проверка идентификаторов или email e-wallet при выплатах на e-wallet.",
      "example": "payment_method_type: ewallet, payment_method_key: skrill_user@email.com",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.card_enabled": {
      "label": "Скрининг выплат на карту",
      "description": "Проверка токенов карт или ссылок на выплату при выводе на карту.",
      "example": "payment_method_type: card, payment_method_key: card_token_abc123",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.country_enabled": {
      "label": "Скрининг blocklist по странам",
      "description": "Блокирует signup/login/deposit/withdraw, если страна игрока совпадает с OFAC sync, вкладкой Lists или ручными странами.",
      "example": "Страна игрока KP при включённом country blocklist → blocklisted_country.",
      "signal": "blocklisted_country"
    },
    "aml.blocklist.sync_ofac_crypto_enabled": {
      "label": "Авто-синхронизация OFAC crypto-кошельков",
      "description": "Ежедневная загрузка crypto-адресов SDN Минфина США. Требуется исходящий HTTPS из контейнера Risk.",
      "example": "Используйте кнопку Sync OFAC lists now ниже после включения."
    },
    "aml.blocklist.sync_ofac_countries_enabled": {
      "label": "Авто-синхронизация OFAC стран",
      "description": "Загрузка ISO-кодов санкционированных стран из данных Минфина в Postgres при каждой синхронизации.",
      "example": "Выполняется по расписанию (интервал sync) и при ручной синхронизации."
    },
    "aml.blocklist.sync_interval_hours": {
      "label": "Интервал синхронизации (часы)",
      "description": "Как часто фоновая задача обновляет OFAC crypto и списки стран.",
      "example": "24 — sync раз в сутки; 6 — для более частых обновлений."
    },
    "aml.blocklist.fail_open": {
      "label": "Fail open при недоступности sync",
      "description": "При включении пустая/устаревшая БД blocklist не блокирует выплаты. При выключении отсутствие данных sync трактуется как высокий риск.",
      "example": "Включено для устойчивости в production; выключено для максимальной строгости compliance."
    },
    "aml.blocklist.use_lists_sanctioned_countries": {
      "label": "Включить санкционированные страны из вкладки Lists",
      "description": "Объединяет Lists → sanctioned countries в проверки country blocklist (дополнительно к OFAC sync и ручным).",
      "example": "Добавьте IR на вкладке Lists + включите это → иранские игроки получают sanctioned_country.",
      "signal": "sanctioned_country"
    },
    "aml.blocklist.crypto_hit_score": {
      "label": "Балл попадания в blocklist выплат",
      "description": "Балл риска при совпадении любого назначения выплаты (crypto/банк/e-wallet/карта) с записью blocklist.",
      "example": "90 — обычно толкает решение к block в сочетании с другими сигналами."
    },
    "aml.blocklist.country_hit_score": {
      "label": "Балл попадания в country blocklist",
      "description": "Балл риска, когда страна игрока совпадает с blocklist.",
      "example": "90 — по умолчанию; снизьте до 70, если предпочитаете challenge вместо block."
    },
    "aml.blocklist.manual_crypto_wallets": {
      "label": "Ручные crypto-кошельки",
      "description": "Дополнительные адреса кошельков для блокировки — по одному на строку. Проверяются при crypto-выплатах дополнительно к OFAC sync.",
      "example": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    "aml.blocklist.manual_bank_accounts": {
      "label": "Ручные банковские счета",
      "description": "IBAN или идентификаторы банковских счетов для блокировки — по одному на строку.",
      "example": "DE89370400440532013000\\nGB82WEST12345698765432"
    },
    "aml.blocklist.manual_ewallet_accounts": {
      "label": "Ручные e-wallet счета",
      "description": "Идентификаторы или email e-wallet для блокировки — по одному на строку.",
      "example": "skrill:fraud_ring_01\\nneteller:abuse@test.com"
    },
    "aml.blocklist.manual_card_accounts": {
      "label": "Ручные выплаты на карту",
      "description": "Токены карт или ссылки на выплату для блокировки — по одному на строку.",
      "example": "card_token_stolen_batch_42\\nvisa_payout_ref_99102"
    },
    "aml.blocklist.manual_countries": {
      "label": "Ручные заблокированные страны",
      "description": "Коды ISO 3166-1 alpha-2 для блокировки — по одному на строку. Объединяются с OFAC sync и вкладкой Lists.",
      "example": "IR\\nKP\\nSY",
      "signal": "blocklisted_country"
    },
    "withdrawal_method.enabled": {
      "label": "Включено",
      "description": "При выключении общие проверки назначения выплат пропускаются.",
      "example": "Требует payment_method_type + payment_method_key при каждом evaluate payment.withdraw.",
      "signal": "shared_withdrawal_method, multiple_accounts_shared_payout_method, multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_medium": {
      "label": "Различные пользователи (средний)",
      "description": "Сколько разных user_ids должны вывести на один payout key до срабатывания среднего уровня.",
      "example": "2 — пользователь A и B выводят на IBAN DE89… → shared_withdrawal_method.",
      "signal": "shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_high": {
      "label": "Различные пользователи (высокий)",
      "description": "Порог различных пользователей для высокого уровня злоупотребления общим payout multi-account.",
      "example": "3 — три аккаунта с одним email Skrill.",
      "signal": "multiple_accounts_shared_payout_method"
    },
    "withdrawal_method.distinct_users_critical": {
      "label": "Различные пользователи (критический)",
      "description": "Порог различных пользователей для критического уровня — обычно принудительный block через вкладку Decision.",
      "example": "4 — четыре аккаунта, один crypto-кошелёк → multi_account_shared_withdrawal_method (жёсткая блокировка).",
      "signal": "multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.medium_score": {
      "label": "Средний балл",
      "description": "Балл риска при достижении среднего порога различных пользователей.",
      "example": "35 — в сочетании с другими движками для достижения challenge/high."
    },
    "withdrawal_method.high_score": {
      "label": "Высокий балл",
      "description": "Балл риска при достижении высокого порога различных пользователей.",
      "example": "55"
    },
    "withdrawal_method.critical_score": {
      "label": "Критический балл",
      "description": "Балл риска при достижении критического порога различных пользователей.",
      "example": "80 — часто достаточно одного для block, если порог решения ≤80."
    },
    "betting_patterns.enabled": {
      "label": "Включено",
      "description": "Главный переключатель для счётчиков последовательных всплесков и проверок коэффициента выигрышей.",
      "example": "Выключено отключает все сигналы на этой вкладке."
    },
    "betting_patterns.burst_window_seconds": {
      "label": "Окно всплеска (секунды)",
      "description": "Скользящее временное окно для всех счётчиков всплесков и расчёта коэффициента выигрышей.",
      "example": "300 — 10 game.bets за 5 минут учитываются во всплеске; окно сдвигается при каждом событии."
    },
    "betting_patterns.game_bet_burst_medium": {
      "label": "Всплеск game.bet — средний",
      "description": "Последовательные события game.bet в окне до сигнала среднего всплеска.",
      "example": "10 — 10 бонусных спинов подряд в течение 300 с.",
      "signal": "sequential_game_bet_burst"
    },
    "betting_patterns.game_bet_burst_high": {
      "label": "Всплеск game.bet — высокий",
      "description": "Последовательный счёт game.bet для высокого уровня всплеска.",
      "example": "20",
      "signal": "sequential_game_bet_burst (higher score tier)"
    },
    "betting_patterns.game_bet_burst_critical": {
      "label": "Всплеск game.bet — критический",
      "description": "Последовательный счёт game.bet для критического уровня всплеска.",
      "example": "35",
      "signal": "sequential_game_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_bet_burst_medium": {
      "label": "Всплеск wallet.bet — средний",
      "description": "Последовательные события wallet.bet (реальные деньги) в окне до среднего всплеска.",
      "example": "20 — паттерн быстрого бота live-casino.",
      "signal": "sequential_wallet_bet_burst"
    },
    "betting_patterns.wallet_bet_burst_high": {
      "label": "Всплеск wallet.bet — высокий",
      "description": "Последовательный счёт wallet.bet для высокого уровня.",
      "example": "40",
      "signal": "sequential_wallet_bet_burst (higher score tier)"
    },
    "betting_patterns.wallet_bet_burst_critical": {
      "label": "Всплеск wallet.bet — критический",
      "description": "Последовательный счёт wallet.bet для критического уровня.",
      "example": "60",
      "signal": "sequential_wallet_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_win_burst_medium": {
      "label": "Всплеск wallet.win — средний",
      "description": "Последовательные зачисления wallet.win в окне до среднего всплеска выигрышей.",
      "example": "8 — много выигрышей зачислено подряд.",
      "signal": "sequential_wallet_win_burst"
    },
    "betting_patterns.wallet_win_burst_high": {
      "label": "Всплеск wallet.win — высокий",
      "description": "Последовательный счёт wallet.win для высокого уровня.",
      "example": "15",
      "signal": "sequential_wallet_win_burst (higher score tier)"
    },
    "betting_patterns.wallet_win_burst_critical": {
      "label": "Всплеск wallet.win — критический",
      "description": "Последовательный счёт wallet.win для критического уровня.",
      "example": "25",
      "signal": "sequential_wallet_win_burst (critical score tier)"
    },
    "betting_patterns.win_rate_min_bets": {
      "label": "Коэфф. выигрышей — мин. ставок",
      "description": "Минимальное число wallet.bet + game.bet в окне до оценки коэффициента выигрышей.",
      "example": "5 — нужно минимум 5 ставок; 4 выигрыша / 4 ставки игнорируются до 5-й ставки."
    },
    "betting_patterns.win_rate_high_ratio": {
      "label": "Коэфф. выигрышей — высокий коэфф.",
      "description": "Соотношение выигрыши ÷ ставки, запускающее сигнал высокого коэффициента выигрышей (0–1).",
      "example": "0.75 — 6 выигрышей из 8 ставок (75%) в окне вызывает high_win_rate_in_betting_sequence.",
      "signal": "high_win_rate_in_betting_sequence"
    },
    "betting_patterns.win_rate_critical_ratio": {
      "label": "Коэфф. выигрышей — критический коэфф.",
      "description": "Соотношение выигрыши ÷ ставки для критического уровня коэффициента выигрышей.",
      "example": "0.90 — 9 выигрышей из 10 ставок вызывает critical_win_rate_in_betting_sequence.",
      "signal": "critical_win_rate_in_betting_sequence"
    },
    "hedge_betting.enabled": {
      "label": "Включено",
      "description": "Главный переключатель для обнаружения хеджированных раундов и коэффициента volume-washing.",
      "example": "Выключено, если вы ещё не отправляете metadata.game.selection и round_id."
    },
    "hedge_betting.window_seconds": {
      "label": "Окно статистики (секунды)",
      "description": "Скользящее окно для подсчёта повторяющихся хеджированных раундов и коэффициента валового объёма.",
      "example": "3600 — подсчёт хеджированных раундов за последний час на пользователя."
    },
    "hedge_betting.round_leg_ttl_seconds": {
      "label": "TTL ноги раунда (секунды)",
      "description": "Как долго хранится первая нога ставки в ожидании противоположной стороны на том же round_id.",
      "example": "600 — ставка banker в 12:00:00; ставка player в 12:09:59 ещё совпадает; в 12:10:01 нога истекает."
    },
    "hedge_betting.time_pair_window_seconds": {
      "label": "Окно time-pair (секунды)",
      "description": "Резервная группировка, когда round_id отсутствует, но есть table_id — ставки в этом окне на одном столе могут сопоставляться.",
      "example": "15 — используется только если require_round_id выключен и round_id отсутствует."
    },
    "hedge_betting.require_round_id": {
      "label": "Требовать round_id",
      "description": "При включении hedge-проверки выполняются только если присутствует metadata.game.round_id. Рекомендуется, когда backend отправляет round_id.",
      "example": "Включено в production — избегает ложных срабатываний резервного time-pair."
    },
    "hedge_betting.opposite_selection_groups": {
      "label": "Группы противоположных selection",
      "description": "JSON-массив групп. Selection в одном внутреннем массиве считаются противоположными в одном раунде.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.amount_match_tolerance_percent": {
      "label": "Допуск совпадения суммы (%)",
      "description": "Противоположные ноги должны иметь stakes в пределах этого процента друг от друга.",
      "example": "10 — banker €1000 + player €950 совпадает; player €800 — нет."
    },
    "hedge_betting.opposite_side_same_round_score": {
      "label": "Балл — противоположные стороны в одном раунде",
      "description": "Балл риска при обнаружении одного хеджированного раунда (противоположные стороны, совпадающие суммы).",
      "example": "50 — срабатывает при первой обнаруженной паре banker+player.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.hedged_round_medium": {
      "label": "Хеджированные раунды — средний",
      "description": "Различные хеджированные раунды в окне статистики до сигнала повторяющегося паттерна (средний уровень).",
      "example": "3 — три отдельных хеджированных раздачи за час.",
      "signal": "repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_high": {
      "label": "Хеджированные раунды — высокий",
      "description": "Различные хеджированные раунды для высокого уровня.",
      "example": "8",
      "signal": "high_repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_critical": {
      "label": "Хеджированные раунды — критический",
      "description": "Различные хеджированные раунды для критического уровня.",
      "example": "15",
      "signal": "critical_hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_enabled": {
      "label": "Проверка volume washing",
      "description": "При включении сравнивает валовый объём хеджированных ставок с общим валовым объёмом ставок в окне статистики.",
      "example": "Игрок ставит €6000 хеджированных + €4000 обычных за 1 ч → 60% хеджированной доли.",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.min_gross_volume": {
      "label": "Volume washing — мин. валовый",
      "description": "Минимальный общий объём ставок в окне до оценки коэффициента volume-washing.",
      "example": "5000 — игнорировать коэффициент, пока у игрока менее €5000 валовых ставок в окне."
    },
    "hedge_betting.min_hedged_gross_ratio": {
      "label": "Volume washing — мин. хеджированный коэфф.",
      "description": "Минимальный коэффициент hedged_gross ÷ total_gross (0–1) для сигнала volume washing.",
      "example": "0.5 — 50% или более валового объёма хеджировано → hedged_bet_volume_washing (жёсткая блокировка при наличии в Decision).",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_score": {
      "label": "Балл — volume washing",
      "description": "Балл риска при достижении порога коэффициента volume-washing.",
      "example": "55 — комбинируйте с баллом opposite_side для более высокого итога."
    },
    "step_up_verification.enabled": {
      "label": "Включено",
      "description": "При выключении metadata step_up_verification игнорируется и исходы challenge не понижаются.",
      "example": "Включено, когда frontend показывает Turnstile в ответах challenge."
    },
    "step_up_verification.grant_ttl_days": {
      "label": "Срок grant (дни)",
      "description": "Как долго действует успешный verification grant для того же user_id + device fingerprint.",
      "example": "7 — игрок проходит Turnstile один раз; последующие login разрешены 7 дней на том же устройстве."
    },
    "step_up_verification.max_verified_age_minutes": {
      "label": "Макс. возраст verified_at (минуты)",
      "description": "metadata.verified_at должен быть в пределах стольких минут от метки времени запроса evaluate.",
      "example": "5 — siteverify в 12:00, evaluate в 12:06 → grant отклонён как устаревший."
    },
    "step_up_verification.downgrade_challenge_to_allow": {
      "label": "Понизить challenge до allow",
      "description": "При включении активный grant меняет решение challenge на allow. Никогда не переопределяет block или критические сигналы.",
      "example": "Включено — типичная production-настройка после прохождения Turnstile."
    },
    "step_up_verification.allowed_hostnames": {
      "label": "Разрешённые hostnames",
      "description": "Необязательный allowlist Cloudflare hostname из ответа siteverify — по одному на строку. Пусто = пропустить проверку.",
      "example": "casino.example.com\\nwww.casino.example.com"
    },
    "step_up_verification.applicable_event_types": {
      "label": "Применимые типы событий",
      "description": "Типы событий, где step-up grant может понизить challenge — по одному на строку.",
      "example": "player.login\\nplayer.signup\\npayment.deposit"
    },
    "fingerprint.required_channels": {
      "label": "Обязательные каналы",
      "description": "Каналы, где ожидается context.fingerprint. Отсутствие значения на этих каналах вызывает missing_fingerprint.",
      "example": "web,mobile — signup на web без visitorId → missing_fingerprint.",
      "signal": "missing_fingerprint"
    },
    "fingerprint.min_length": {
      "label": "Мин. длина",
      "description": "Минимальная допустимая длина символов visitorId FingerprintJS.",
      "example": "10 — abc123 (6 символов) → malformed_fingerprint.",
      "signal": "malformed_fingerprint"
    },
    "fingerprint.max_length": {
      "label": "Макс. длина",
      "description": "Максимальная допустимая длина visitorId. Значения вне min–max отклоняются.",
      "example": "64",
      "signal": "malformed_fingerprint, invalid_fingerprint"
    },
    "fingerprint.suspicious_values": {
      "label": "Подозрительные значения",
      "description": "Известные поддельные или placeholder-строки отпечатка — по одной на строку. Точное совпадение не проходит валидацию.",
      "example": "undefined\\nnull\\n00000000-0000-0000-0000-000000000000",
      "signal": "invalid_fingerprint"
    },
    "lists.disposable_domains": {
      "label": "Одноразовые email-домены",
      "description": "Домены временных email-провайдеров. Signup с этими доменами обычно жёстко блокируется.",
      "example": "mailinator.com\\n10minutemail.com\\nguerrillamail.com",
      "signal": "disposable_email"
    },
    "lists.high_risk_countries": {
      "label": "Страны высокого риска",
      "description": "ISO-коды стран с повышенным уровнем мошенничества. Добавляет балл при geo/IP-проверках — не автоматическая блокировка.",
      "example": "NG\\nGH\\nPK",
      "signal": "high_risk_country"
    },
    "lists.sanctioned_countries": {
      "label": "Санкционированные страны",
      "description": "ISO-коды санкционированных или запрещённых для азартных игр юрисдикций. Используются, когда AML blocklist включает вкладку Lists.",
      "example": "IR\\nKP\\nCU",
      "signal": "sanctioned_country"
    },
    "lists.generic_names": {
      "label": "Общие имена",
      "description": "Placeholder display names при signup/identity — по одному на строку, без учёта регистра.",
      "example": "test\\nuser\\nadmin\\nPlayer",
      "signal": "generic_name"
    },
    "lists.role_based_email_locals": {
      "label": "Role-based email locals",
      "description": "Локальные части email (до @), указывающие на неперсональные аккаунты.",
      "example": "admin\\nsupport\\ninfo\\nnoreply",
      "signal": "role_based_email"
    },
    "lists.suspicious_email_tlds": {
      "label": "Подозрительные email TLD",
      "description": "Домены верхнего уровня, связанные со спамом. Совпадение, когда email заканчивается этими TLD.",
      "example": ".xyz\\n.top\\n.click",
      "signal": "suspicious_email_tld"
    },
    "lists.suspicious_email_local_tokens": {
      "label": "Подозрительные local tokens email",
      "description": "Подстроки в локальной части email, указывающие на одноразовые или bot-аккаунты.",
      "example": "temp\\nspam\\nbot\\nfake",
      "signal": "suspicious_email_pattern"
    },
    "lists.bot_user_agent_tokens": {
      "label": "Bot User-Agent tokens",
      "description": "Подстроки в заголовке User-Agent, указывающие на скрипты или автоматизацию.",
      "example": "curl\\npython-requests\\nheadless\\nscrapy",
      "signal": "bot_user_agent"
    },
    "lists.emulator_ua_tokens": {
      "label": "Emulator UA tokens",
      "description": "Паттерны User-Agent для Android-эмуляторов или виртуальных устройств.",
      "example": "genymotion\\nbluestacks\\nsdk_gphone",
      "signal": "emulator_detected"
    },
    "lists.suspicious_referrers": {
      "label": "Подозрительные referrers",
      "description": "Точные значения referrer с низким доверием при signup.",
      "example": "direct\\nunknown\\n(пустая строка для пустого referrer)",
      "signal": "suspicious_referrer"
    },
    "lists.bonus_abuse_referrer_tokens": {
      "label": "Referrer tokens злоупотребления бонусами",
      "description": "Подстроки в URL referrer signup, связанные с bonus-hunting или affiliate abuse.",
      "example": "free-spins\\nno-deposit\\nbonus-hunter",
      "signal": "bonus_abuse_referrer"
    },
    "velocity_thresholds": {
      "label": "Пороги velocity (JSON)",
      "description": "Карта имя порога → макс. счёт. Суффикс _medium/_high/_critical выбирает уровень. Не удаляйте ключи — движки ожидают полный набор.",
      "example": "{\\n  \"login_ip_medium\": 5,\\n  \"login_ip_high\": 15,\\n  \"login_ip_critical\": 30,\\n  \"signup_ip_critical\": 10,\\n  \"deposit_user_high\": 6\\n}",
      "signal": "medium_login_ip_velocity, bulk_login_attack, bulk_signup_attack, rapid_deposit_activity, …"
    },
    "critical_signals": {
      "label": "Сигналы жёсткой блокировки",
      "description": "Точные строки имён сигналов от движков — по одной на строку. Регистр должен совпадать точно.",
      "example": "disposable_email\\nbulk_login_attack\\nhedged_bet_volume_washing\\nmulti_account_shared_withdrawal_method"
    },
    "features.sync_publish_audit": {
      "label": "Публиковать аудит при sync /evaluate",
      "description": "При включении результаты синхронного POST /evaluate также публикуются в RabbitMQ для аудита Orchestrator.",
      "example": "Включено, когда Orchestrator должен видеть sync API-решения в том же pipeline, что и async-события."
    },
    "features.decision_cache_ttl_seconds": {
      "label": "TTL кэша решений (секунды)",
      "description": "Кэширует идентичные решения event_id в Redis для избежания повторной оценки дубликатов. Требует включённый Redis.",
      "example": "300 — тот же event_id в течение 5 минут возвращает кэшированное решение; 0 = выключено."
    },
    "features.redis_enabled": {
      "label": "Redis включён",
      "description": "Использует Redis для velocity-счётчиков, hedge/betting-хранилищ и опционального кэша решений.",
      "example": "Выключено для dev с одним экземпляром (счётчики в памяти); включено для production multi-instance."
    },
    "features.redis_velocity_ip_ttl": {
      "label": "Redis IP velocity TTL",
      "description": "Длина скользящего окна (секунды) для IP velocity keys в Redis.",
      "example": "3600 — login_ip_high считает login с одного IP за последний час."
    },
    "features.redis_velocity_domain_ttl": {
      "label": "Redis domain velocity TTL",
      "description": "Длина скользящего окна для счётчиков velocity signup по email-домену.",
      "example": "86400 — signup_domain_* считает signup по домену за 24 ч."
    },
    "features.rabbitmq_enabled": {
      "label": "RabbitMQ consumer включён",
      "description": "Запускает async consumer, оценивающий события из exchange/очереди платформы казино.",
      "example": "Включено, когда платформа публикует wallet.bet, player.login и т.д. в casino.events."
    },
    "features.rabbitmq_publish_results": {
      "label": "Публиковать результаты в Orchestrator",
      "description": "Публикует оценённые сообщения EvaluateResponse в очередь результатов после async-оценки.",
      "example": "Включено, когда Orchestrator подписан на risk.results для аудита/действий."
    },
    "features.rabbitmq_events_exchange": {
      "label": "Exchange событий",
      "description": "Topic exchange, в который публикует платформа казино. Пусто = устаревший режим direct queue.",
      "example": "casino.events"
    },
    "features.rabbitmq_events_exchange_type": {
      "label": "Тип exchange",
      "description": "Тип RabbitMQ exchange, объявляемый/привязываемый AFS consumer.",
      "example": "topic"
    },
    "features.rabbitmq_events_queue": {
      "label": "Очередь событий",
      "description": "Очередь, из которой AFS потребляет после привязки к exchange платформы.",
      "example": "casino.afs"
    },
    "features.rabbitmq_events_binding_key": {
      "label": "Binding key",
      "description": "Шаблон routing key для привязки очереди. # = все сообщения на exchange.",
      "example": "# — все события; player.* — только routing keys player."
    },
    "features.rabbitmq_prefetch": {
      "label": "Prefetch count",
      "description": "Макс. неподтверждённых сообщений на канал consumer.",
      "example": "10 — консервативно; 50 — выше пропускная способность, больше памяти."
    },
    "features.rabbitmq_results_queue": {
      "label": "Очередь результатов",
      "description": "Имя исходящей очереди для оценённых async-результатов.",
      "example": "risk.results"
    },
    "logging.sync_enabled": {
      "label": "Логирование sync запрос/ответ",
      "description": "Сохраняет полные payload запроса и ответа для POST /evaluate в Postgres. Смотреть в Log viewer ниже.",
      "example": "Включить при интеграционном тестировании; выключить при высоком объёме production, если важно хранилище."
    },
    "logging.async_enabled": {
      "label": "Логирование async запрос/ответ",
      "description": "Сохраняет сообщения RabbitMQ (оценённые/пропущенные/отклонённые/ошибочные) с payload, где доступно.",
      "example": "Включить для отладки pipeline casino.events → AFS без просмотра логов контейнера."
    }
  },
  "ko": {
    "decision_thresholds.challenge": {
      "label": "Challenge 임계값",
      "description": "중간 위험의 최소 점수. 결과는 보통 allow 대신 challenge(Turnstile, MFA, 수동 검토)입니다.",
      "example": "40 — 점수 39인 플레이어는 allow; 점수 40+는 hard-block signal이 발생하지 않았다면 challenge."
    },
    "decision_thresholds.high": {
      "label": "높은 임계값",
      "description": "높은 위험의 최소 점수. Login/signup은 종종 차단; deposit/withdraw/bet은 차단되거나 추가 검사가 필요할 수 있습니다.",
      "example": "61 — 점수 60은 중간/challenge 유지; 점수 61+는 높은 위험."
    },
    "decision_thresholds.block": {
      "label": "Block 임계값(치명적)",
      "description": "치명적 위험의 최소 점수. Decision 탭의 signal이 이미 block을 강제하지 않았다면 보통 block 결과.",
      "example": "85 — 점수 84는 여전히 높을 수 있음; 점수 85+는 치명적/block."
    },
    "operator.platform_name": {
      "label": "플랫폼 이름",
      "description": "이 operator 인스턴스의 내부 레이블. 로그 및 감사 항목에 사용 — 플레이어에게 전송되지 않음.",
      "example": "DoveBet EU",
      "signal": "unlicensed_jurisdiction (국가가 licensed markets에 없을 때)"
    },
    "operator.licensed_markets": {
      "label": "Licensed markets",
      "description": "도박 라이선스를 보유한 ISO 3166-1 alpha-2 국가 코드. signup, deposit, bet 이벤트에서 플레이어 국가 또는 IP geo로 확인.",
      "example": "DE,GB,MT,SE — FR 플레이어, 라이선스 없음 → unlicensed_jurisdiction.",
      "signal": "unlicensed_jurisdiction"
    },
    "ip_intel.enabled": {
      "label": "활성화",
      "description": "마스터 토글. 꺼지면 외부 IP 조회가 실행되지 않고 vpn/proxy/tor/hosting signal이 발생하지 않습니다.",
      "example": "아웃바운드 API 호출을 원하지 않는 로컬 dev 중에는 끔.",
      "signal": "vpn_detected, proxy_detected, tor_exit_node, hosting_provider_ip"
    },
    "ip_intel.cache_ttl_seconds": {
      "label": "캐시 TTL(초)",
      "description": "각 IP 조회 결과가 Redis 또는 메모리에 캐시되는 시간(재조회 전).",
      "example": "3600 — 동일 IP는 시간당 1회 확인; VPN 전환은 최대 1시간 지연 가능."
    },
    "ip_intel.timeout_seconds": {
      "label": "조회 타임아웃(초)",
      "description": "외부 IP API 요청당 최대 대기. 캐시 미스 시 evaluate 지연에 영향.",
      "example": "2.0 — 빠른 fail 또는 fail-open; 5.0 — 느린 API에 더 많은 시간."
    },
    "ip_intel.fail_open": {
      "label": "조회 오류 시 fail open",
      "description": "켜면 API 타임아웃/오류가 위험을 추가하지 않음. 끄면 조회 실패를 의심(VPN/proxy 의심)으로 처리.",
      "example": "IP API 다운타임이 login을 막으면 안 되는 production에서는 켬; 엄격한 동작을 원하면 끔."
    },
    "aml.single_deposit_threshold": {
      "label": "단일 deposit 검토",
      "description": "이 금액 이상의 단일 payment.deposit이 compliance review tier 1을 트리거.",
      "example": "2000 — €2,000 deposit → elevated_deposit_aml_review.",
      "signal": "elevated_deposit_aml_review"
    },
    "aml.large_deposit_threshold": {
      "label": "대규모 deposit 검토",
      "description": "최고 deposit AML tier — 매우 큰 단일 deposit용.",
      "example": "10000 — €10,000 deposit → large_deposit_aml_review.",
      "signal": "large_deposit_aml_review"
    },
    "aml.withdrawal_review_threshold": {
      "label": "Withdrawal 검토",
      "description": "이 금액 이상의 단일 payment.withdraw이 cashout 검토 signal을 트리거.",
      "example": "1000 — €1,000 withdrawal → elevated_withdrawal_review 및 cashout_review_required.",
      "signal": "elevated_withdrawal_review, cashout_review_required"
    },
    "aml.structuring_threshold": {
      "label": "Structuring 임계값",
      "description": "이 금액의 90%~100% 사이 deposit 플래그 — 신고 한도 바로 아래에 머무르는 패턴.",
      "example": "3000 — €2,850 deposit(3000의 95%) → structuring_threshold_deposit.",
      "signal": "structuring_threshold_deposit"
    },
    "aml.micro_deposit_max": {
      "label": "Micro deposit 최대",
      "description": "이 금액 미만 deposit은 bonus-farming / payment 테스트 탐지를 트리거.",
      "example": "10 — €5 deposit → micro_deposit_bonus_farming.",
      "signal": "micro_deposit_bonus_farming"
    },
    "aml.high_stake_bet_threshold": {
      "label": "고액 bet",
      "description": "이 금액 이상의 단일 wallet.bet / game.bet. €100 초과 bet(고정 엔진 규칙)도 elevated_stake_bet 발생.",
      "example": "500 — €500 bet → high_stake_bet.",
      "signal": "high_stake_bet, elevated_stake_bet"
    },
    "aml.blocklist.enabled": {
      "label": "Blocklist 스크리닝 활성화",
      "description": "모든 AML blocklist 엔진(crypto, bank, country 등)의 마스터 토글.",
      "example": "blocklist 검사를 AFS 외부에서만 수행하는 경우에만 끔."
    },
    "aml.blocklist.crypto_enabled": {
      "label": "Crypto wallet 스크리닝",
      "description": "payment.withdraw / payment.deposit의 crypto payout 주소를 OFAC sync + 수동 목록과 대조.",
      "example": "withdraw evaluate 시 payment_method_type: crypto 및 payment_method_key: 0xabc… 전송.",
      "signal": "ofac_sanctioned_wallet, blocklisted_payout_address"
    },
    "aml.blocklist.bank_enabled": {
      "label": "Bank account 스크리닝",
      "description": "은행 payout의 IBAN/은행 계좌 ID 확인.",
      "example": "payment_method_type: bank, payment_method_key: DE89370400440532013000",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.ewallet_enabled": {
      "label": "E-wallet 스크리닝",
      "description": "e-wallet payout의 e-wallet ID 또는 이메일 확인.",
      "example": "payment_method_type: ewallet, payment_method_key: skrill_user@email.com",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.card_enabled": {
      "label": "Card payout 스크리닝",
      "description": "카드 withdrawal의 카드 토큰 또는 payout 참조 확인.",
      "example": "payment_method_type: card, payment_method_key: card_token_abc123",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.country_enabled": {
      "label": "Country blocklist 스크리닝",
      "description": "플레이어 국가가 OFAC sync, Lists 탭 또는 수동 countries와 일치하면 signup/login/deposit/withdraw 차단.",
      "example": "플레이어 국가 KP, country blocklist 활성화 → blocklisted_country.",
      "signal": "blocklisted_country"
    },
    "aml.blocklist.sync_ofac_crypto_enabled": {
      "label": "OFAC crypto wallet 자동 sync",
      "description": "미국 재무부 SDN crypto 주소를 매일 가져옴. Risk 컨테이너에서 아웃바운드 HTTPS 필요.",
      "example": "활성화 후 아래 Sync OFAC lists now 버튼 사용."
    },
    "aml.blocklist.sync_ofac_countries_enabled": {
      "label": "OFAC countries 자동 sync",
      "description": "각 sync마다 Treasury 파생 제재 국가 ISO 코드를 Postgres에 로드.",
      "example": "일정(sync interval) 및 수동 sync 시 실행."
    },
    "aml.blocklist.sync_interval_hours": {
      "label": "Sync 간격(시간)",
      "description": "백그라운드 작업이 OFAC crypto 및 country 목록을 새로고침하는 빈도.",
      "example": "24 — 하루 1회 sync; 6 — 더 자주 업데이트."
    },
    "aml.blocklist.fail_open": {
      "label": "Sync 불가 시 fail open",
      "description": "켜면 빈/오래된 blocklist DB가 payout을 차단하지 않음. 끄면 sync 데이터 누락을 높은 위험으로 처리.",
      "example": "production 복원력을 위해 켬; 최대 compliance 엄격성을 위해 끔."
    },
    "aml.blocklist.use_lists_sanctioned_countries": {
      "label": "Lists 탭 제재 국가 포함",
      "description": "Lists → sanctioned countries를 country blocklist 검사에 병합(OFAC sync 및 수동 추가).",
      "example": "Lists 탭에 IR 추가 + 이 옵션 활성화 → 이란 플레이어 sanctioned_country.",
      "signal": "sanctioned_country"
    },
    "aml.blocklist.crypto_hit_score": {
      "label": "Payout blocklist hit 점수",
      "description": "payout 목적지(crypto/bank/e-wallet/card)가 blocklist 항목과 일치할 때 추가되는 위험 점수.",
      "example": "90 — 다른 signal과 결합 시 보통 block 쪽으로 결정."
    },
    "aml.blocklist.country_hit_score": {
      "label": "Country blocklist hit 점수",
      "description": "플레이어 국가가 blocklist와 일치할 때의 위험 점수.",
      "example": "90 — 기본값; block 대신 challenge를 원하면 70으로 낮춤."
    },
    "aml.blocklist.manual_crypto_wallets": {
      "label": "수동 crypto wallet",
      "description": "차단할 추가 wallet 주소 — 한 줄에 하나. OFAC sync 외 crypto payout에서 확인.",
      "example": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    "aml.blocklist.manual_bank_accounts": {
      "label": "수동 bank account",
      "description": "차단할 IBAN 또는 bank account 식별자 — 한 줄에 하나.",
      "example": "DE89370400440532013000\\nGB82WEST12345698765432"
    },
    "aml.blocklist.manual_ewallet_accounts": {
      "label": "수동 e-wallet account",
      "description": "차단할 e-wallet ID 또는 이메일 — 한 줄에 하나.",
      "example": "skrill:fraud_ring_01\\nneteller:abuse@test.com"
    },
    "aml.blocklist.manual_card_accounts": {
      "label": "수동 card payout",
      "description": "차단할 카드 토큰 또는 payout 참조 — 한 줄에 하나.",
      "example": "card_token_stolen_batch_42\\nvisa_payout_ref_99102"
    },
    "aml.blocklist.manual_countries": {
      "label": "수동 blocklist countries",
      "description": "차단할 ISO 3166-1 alpha-2 코드 — 한 줄에 하나. OFAC sync 및 Lists 탭과 병합.",
      "example": "IR\\nKP\\nSY",
      "signal": "blocklisted_country"
    },
    "withdrawal_method.enabled": {
      "label": "활성화",
      "description": "꺼지면 공유 payout 목적지 검사를 건너뜀.",
      "example": "모든 payment.withdraw evaluate에 payment_method_type + payment_method_key 필요.",
      "signal": "shared_withdrawal_method, multiple_accounts_shared_payout_method, multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_medium": {
      "label": "고유 user(중간)",
      "description": "중간 tier가 발생하기 전 동일 payout key로 withdraw하는 서로 다른 user_id 수.",
      "example": "2 — user A와 B가 IBAN DE89…로 withdraw → shared_withdrawal_method.",
      "signal": "shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_high": {
      "label": "고유 user(높음)",
      "description": "높은 tier multi-account payout 남용의 고유 user 임계값.",
      "example": "3 — 동일 Skrill 이메일을 공유하는 3개 계정.",
      "signal": "multiple_accounts_shared_payout_method"
    },
    "withdrawal_method.distinct_users_critical": {
      "label": "고유 user(치명적)",
      "description": "치명적 tier의 고유 user 임계값 — 보통 Decision 탭을 통해 block 강제.",
      "example": "4 — 4개 계정, 동일 crypto wallet → multi_account_shared_withdrawal_method(hard block).",
      "signal": "multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.medium_score": {
      "label": "중간 점수",
      "description": "고유 user 중간 임계값 도달 시 추가되는 위험 점수.",
      "example": "35 — 다른 엔진과 결합하여 challenge/high 도달."
    },
    "withdrawal_method.high_score": {
      "label": "높은 점수",
      "description": "고유 user 높은 임계값 도달 시 추가되는 위험 점수.",
      "example": "55"
    },
    "withdrawal_method.critical_score": {
      "label": "치명적 점수",
      "description": "고유 user 치명적 임계값 도달 시 추가되는 위험 점수.",
      "example": "80 — decision threshold가 ≤80이면 단독으로 block에 충분한 경우가 많음."
    },
    "betting_patterns.enabled": {
      "label": "활성화",
      "description": "순차 burst 카운터 및 win-rate ratio 검사의 마스터 토글.",
      "example": "끄면 이 탭의 모든 signal 비활성화."
    },
    "betting_patterns.burst_window_seconds": {
      "label": "Burst window(초)",
      "description": "모든 burst 카운터 및 win-rate 계산의 롤링 시간 창.",
      "example": "300 — 5분 내 10 game.bets가 burst에 포함; 각 이벤트마다 창 이동."
    },
    "betting_patterns.game_bet_burst_medium": {
      "label": "game.bet burst — 중간",
      "description": "중간 burst signal 전 window 내 순차 game.bet 이벤트.",
      "example": "10 — 300초 내 연속 10 bonus spin.",
      "signal": "sequential_game_bet_burst"
    },
    "betting_patterns.game_bet_burst_high": {
      "label": "game.bet burst — 높음",
      "description": "높은 tier burst의 순차 game.bet 수.",
      "example": "20",
      "signal": "sequential_game_bet_burst (higher score tier)"
    },
    "betting_patterns.game_bet_burst_critical": {
      "label": "game.bet burst — 치명적",
      "description": "치명적 tier burst의 순차 game.bet 수.",
      "example": "35",
      "signal": "sequential_game_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_bet_burst_medium": {
      "label": "wallet.bet burst — 중간",
      "description": "중간 burst 전 window 내 순차 wallet.bet(실머니) 이벤트.",
      "example": "20 — 빠른 live-casino betting bot 패턴.",
      "signal": "sequential_wallet_bet_burst"
    },
    "betting_patterns.wallet_bet_burst_high": {
      "label": "wallet.bet burst — 높음",
      "description": "높은 tier의 순차 wallet.bet 수.",
      "example": "40",
      "signal": "sequential_wallet_bet_burst (higher score tier)"
    },
    "betting_patterns.wallet_bet_burst_critical": {
      "label": "wallet.bet burst — 치명적",
      "description": "치명적 tier의 순차 wallet.bet 수.",
      "example": "60",
      "signal": "sequential_wallet_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_win_burst_medium": {
      "label": "wallet.win burst — 중간",
      "description": "중간 win burst 전 window 내 순차 wallet.win credit.",
      "example": "8 — 짧은 시간에 많은 win 적립.",
      "signal": "sequential_wallet_win_burst"
    },
    "betting_patterns.wallet_win_burst_high": {
      "label": "wallet.win burst — 높음",
      "description": "높은 tier의 순차 wallet.win 수.",
      "example": "15",
      "signal": "sequential_wallet_win_burst (higher score tier)"
    },
    "betting_patterns.wallet_win_burst_critical": {
      "label": "wallet.win burst — 치명적",
      "description": "치명적 tier의 순차 wallet.win 수.",
      "example": "25",
      "signal": "sequential_wallet_win_burst (critical score tier)"
    },
    "betting_patterns.win_rate_min_bets": {
      "label": "Win rate — 최소 bet",
      "description": "win-rate ratio 평가 전 window 내 최소 wallet.bet + game.bet 수.",
      "example": "5 — 최소 5 bet 필요; 4 win / 4 bet은 5번째 bet까지 무시."
    },
    "betting_patterns.win_rate_high_ratio": {
      "label": "Win rate — 높은 ratio",
      "description": "높은 win-rate signal을 트리거하는 win ÷ bet ratio(0–1).",
      "example": "0.75 — window 내 8 bet 중 6 win(75%) → high_win_rate_in_betting_sequence.",
      "signal": "high_win_rate_in_betting_sequence"
    },
    "betting_patterns.win_rate_critical_ratio": {
      "label": "Win rate — 치명적 ratio",
      "description": "치명적 win-rate tier의 win ÷ bet ratio.",
      "example": "0.90 — 10 bet 중 9 win → critical_win_rate_in_betting_sequence.",
      "signal": "critical_win_rate_in_betting_sequence"
    },
    "hedge_betting.enabled": {
      "label": "활성화",
      "description": "hedged-round 탐지 및 volume-washing ratio의 마스터 토글.",
      "example": "metadata.game.selection 및 round_id를 아직 보내지 않으면 끔."
    },
    "hedge_betting.window_seconds": {
      "label": "Stats window(초)",
      "description": "반복 hedged round 및 gross volume ratio 카운트의 롤링 창.",
      "example": "3600 — user당 지난 1시간 hedged round 카운트."
    },
    "hedge_betting.round_leg_ttl_seconds": {
      "label": "Round leg TTL(초)",
      "description": "동일 round_id에서 반대쪽을 기다리는 동안 첫 bet leg가 저장되는 시간.",
      "example": "600 — 12:00:00 banker bet; 12:09:59 player bet은 여전히 매칭; 12:10:01 leg 만료."
    },
    "hedge_betting.time_pair_window_seconds": {
      "label": "Time-pair window(초)",
      "description": "round_id는 없고 table_id만 있을 때의 fallback 그룹 버킷 — 동일 table에서 이 window 내 bet이 페어링될 수 있음.",
      "example": "15 — require_round_id가 꺼져 있고 round_id가 없을 때만 사용."
    },
    "hedge_betting.require_round_id": {
      "label": "round_id 필수",
      "description": "켜면 metadata.game.round_id가 있을 때만 hedge 검사 실행. backend가 round_id를 보내면 권장.",
      "example": "production에서 켬 — time-pair fallback의 false positive 방지."
    },
    "hedge_betting.opposite_selection_groups": {
      "label": "Opposite selection groups",
      "description": "그룹 JSON 배열. 동일 내부 배열의 selection은 동일 round에서 반대로 처리.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.amount_match_tolerance_percent": {
      "label": "Amount match tolerance(%)",
      "description": "반대 leg의 stake는 서로 이 퍼센트 이내여야 함.",
      "example": "10 — banker €1000 + player €950 매칭; player €800은 아님."
    },
    "hedge_betting.opposite_side_same_round_score": {
      "label": "점수 — opposite sides same round",
      "description": "단일 hedged round(반대 sides, 일치하는 amount) 탐지 시 위험 점수.",
      "example": "50 — 첫 banker+player pair 탐지 시 발생.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.hedged_round_medium": {
      "label": "Hedged rounds — 중간",
      "description": "반복 패턴 signal(중간 tier) 전 stats window 내 고유 hedged round.",
      "example": "3 — 1시간 내 3개의 별도 hedged hand.",
      "signal": "repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_high": {
      "label": "Hedged rounds — 높음",
      "description": "높은 tier의 고유 hedged round.",
      "example": "8",
      "signal": "high_repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_critical": {
      "label": "Hedged rounds — 치명적",
      "description": "치명적 tier의 고유 hedged round.",
      "example": "15",
      "signal": "critical_hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_enabled": {
      "label": "Volume washing 검사",
      "description": "켜면 stats window에서 hedged gross bet volume을 total gross bet volume과 비교.",
      "example": "플레이어 1h 내 hedged €6000 + normal €4000 → 60% hedged share.",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.min_gross_volume": {
      "label": "Volume washing — 최소 gross",
      "description": "volume-washing ratio 평가 전 window 내 최소 total bet volume.",
      "example": "5000 — window 내 gross bet이 최소 €5000까지 ratio 무시."
    },
    "hedge_betting.min_hedged_gross_ratio": {
      "label": "Volume washing — 최소 hedged ratio",
      "description": "volume washing signal을 트리거하는 최소 hedged_gross ÷ total_gross ratio(0–1).",
      "example": "0.5 — gross volume의 50% 이상 hedged → hedged_bet_volume_washing(Decision에 있으면 hard block).",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_score": {
      "label": "점수 — volume washing",
      "description": "volume-washing ratio 임계값 충족 시 추가되는 위험 점수.",
      "example": "55 — opposite_side 점수와 결합하여 더 높은 합계."
    },
    "step_up_verification.enabled": {
      "label": "활성화",
      "description": "꺼지면 step_up_verification metadata가 무시되고 challenge 결과가 downgrade되지 않음.",
      "example": "frontend가 challenge 응답에 Turnstile을 표시할 때 켬."
    },
    "step_up_verification.grant_ttl_days": {
      "label": "Grant 기간(일)",
      "description": "동일 user_id + device fingerprint에 대한 성공 verification grant 유효 기간.",
      "example": "7 — 플레이어가 Turnstile 1회 통과; 동일 device에서 7일간 후속 login allow."
    },
    "step_up_verification.max_verified_age_minutes": {
      "label": "verified_at 최대 age(분)",
      "description": "metadata.verified_at은 evaluate 요청 타임스탬프로부터 이 분 이내여야 함.",
      "example": "5 — 12:00 siteverify, 12:06 evaluate → grant stale로 거부."
    },
    "step_up_verification.downgrade_challenge_to_allow": {
      "label": "Challenge를 allow로 downgrade",
      "description": "켜면 활성 grant가 challenge 결정을 allow로 변경. block 또는 critical signal은 절대 override하지 않음.",
      "example": "켬 — Turnstile 통과 후 일반적인 production 설정."
    },
    "step_up_verification.allowed_hostnames": {
      "label": "Allowed hostnames",
      "description": "siteverify 응답의 선택적 Cloudflare hostname allowlist — 한 줄에 하나. 비어 있으면 검사 생략.",
      "example": "casino.example.com\\nwww.casino.example.com"
    },
    "step_up_verification.applicable_event_types": {
      "label": "Applicable event types",
      "description": "step-up grant가 challenge를 downgrade할 수 있는 event type — 한 줄에 하나.",
      "example": "player.login\\nplayer.signup\\npayment.deposit"
    },
    "fingerprint.required_channels": {
      "label": "필수 channel",
      "description": "context.fingerprint가 예상되는 channel. 이 channel에서 값 누락 시 missing_fingerprint.",
      "example": "web,mobile — visitorId 없이 web signup → missing_fingerprint.",
      "signal": "missing_fingerprint"
    },
    "fingerprint.min_length": {
      "label": "최소 길이",
      "description": "유효한 FingerprintJS visitorId 최소 문자 길이.",
      "example": "10 — abc123(6자) → malformed_fingerprint.",
      "signal": "malformed_fingerprint"
    },
    "fingerprint.max_length": {
      "label": "최대 길이",
      "description": "유효한 visitorId 최대 길이. min–max 밖 값은 거부.",
      "example": "64",
      "signal": "malformed_fingerprint, invalid_fingerprint"
    },
    "fingerprint.suspicious_values": {
      "label": "의심 값",
      "description": "알려진 가짜 또는 placeholder fingerprint 문자열 — 한 줄에 하나. 정확히 일치하면 검증 실패.",
      "example": "undefined\\nnull\\n00000000-0000-0000-0000-000000000000",
      "signal": "invalid_fingerprint"
    },
    "lists.disposable_domains": {
      "label": "일회용 email domain",
      "description": "일회용 email 제공자 domain. 이 domain으로 signup은 보통 hard-block.",
      "example": "mailinator.com\\n10minutemail.com\\nguerrillamail.com",
      "signal": "disposable_email"
    },
    "lists.high_risk_countries": {
      "label": "고위험 countries",
      "description": "사기율이 높은 ISO country code. geo/IP 검사 시 점수 추가 — 자동 block 아님.",
      "example": "NG\\nGH\\nPK",
      "signal": "high_risk_country"
    },
    "lists.sanctioned_countries": {
      "label": "제재 countries",
      "description": "제재 또는 도박 금지 jurisdiction의 ISO code. AML blocklist가 Lists 탭을 포함할 때 사용.",
      "example": "IR\\nKP\\nCU",
      "signal": "sanctioned_country"
    },
    "lists.generic_names": {
      "label": "Generic names",
      "description": "signup/identity의 placeholder display name — 한 줄에 하나, 대소문자 무시.",
      "example": "test\\nuser\\nadmin\\nPlayer",
      "signal": "generic_name"
    },
    "lists.role_based_email_locals": {
      "label": "Role-based email locals",
      "description": "비개인 계정을 나타내는 email local part(@ 앞).",
      "example": "admin\\nsupport\\ninfo\\nnoreply",
      "signal": "role_based_email"
    },
    "lists.suspicious_email_tlds": {
      "label": "Suspicious email TLD",
      "description": "스팸과 연관된 top-level domain. email이 이 TLD로 끝나면 매칭.",
      "example": ".xyz\\n.top\\n.click",
      "signal": "suspicious_email_tld"
    },
    "lists.suspicious_email_local_tokens": {
      "label": "Suspicious email local tokens",
      "description": "일회용 또는 bot account를 시사하는 email local part 부분 문자열.",
      "example": "temp\\nspam\\nbot\\nfake",
      "signal": "suspicious_email_pattern"
    },
    "lists.bot_user_agent_tokens": {
      "label": "Bot User-Agent tokens",
      "description": "스크립트 또는 자동화를 나타내는 User-Agent header 부분 문자열.",
      "example": "curl\\npython-requests\\nheadless\\nscrapy",
      "signal": "bot_user_agent"
    },
    "lists.emulator_ua_tokens": {
      "label": "Emulator UA tokens",
      "description": "Android emulator 또는 가상 device의 User-Agent 패턴.",
      "example": "genymotion\\nbluestacks\\nsdk_gphone",
      "signal": "emulator_detected"
    },
    "lists.suspicious_referrers": {
      "label": "Suspicious referrers",
      "description": "signup에서 낮은 신뢰로 처리되는 정확한 referrer 값.",
      "example": "direct\\nunknown\\n(빈 referrer용 빈 줄)",
      "signal": "suspicious_referrer"
    },
    "lists.bonus_abuse_referrer_tokens": {
      "label": "Bonus abuse referrer tokens",
      "description": "bonus-hunting 또는 affiliate abuse site와 연결된 signup referrer URL 부분 문자열.",
      "example": "free-spins\\nno-deposit\\nbonus-hunter",
      "signal": "bonus_abuse_referrer"
    },
    "velocity_thresholds": {
      "label": "Velocity thresholds(JSON)",
      "description": "임계값 이름 → 최대 count 맵. 접미사 _medium/_high/_critical이 tier 선택. 키 삭제 금지 — 엔진은 전체 세트 필요.",
      "example": "{\\n  \"login_ip_medium\": 5,\\n  \"login_ip_high\": 15,\\n  \"login_ip_critical\": 30,\\n  \"signup_ip_critical\": 10,\\n  \"deposit_user_high\": 6\\n}",
      "signal": "medium_login_ip_velocity, bulk_login_attack, bulk_signup_attack, rapid_deposit_activity, …"
    },
    "critical_signals": {
      "label": "Hard-block signals",
      "description": "엔진이 emit하는 정확한 signal name 문자열 — 한 줄에 하나. 대소문자 정확히 일치해야 함.",
      "example": "disposable_email\\nbulk_login_attack\\nhedged_bet_volume_washing\\nmulti_account_shared_withdrawal_method"
    },
    "features.sync_publish_audit": {
      "label": "Sync /evaluate에서 audit publish",
      "description": "켜면 동기 POST /evaluate 결과도 Orchestrator audit용 RabbitMQ에 publish.",
      "example": "Orchestrator가 async event와 동일 pipeline에서 sync API 결정을 봐야 할 때 켬."
    },
    "features.decision_cache_ttl_seconds": {
      "label": "Decision cache TTL(초)",
      "description": "동일 event_id 결정을 Redis에 캐시하여 중복 재점수 방지. Redis 활성화 필요.",
      "example": "300 — 5분 내 동일 event_id는 캐시된 결정 반환; 0 = 비활성화."
    },
    "features.redis_enabled": {
      "label": "Redis 활성화",
      "description": "velocity counter, hedge/betting store 및 선택적 decision cache에 Redis 사용.",
      "example": "단일 인스턴스 dev(메모리 counter)는 끔; production multi-instance는 켬."
    },
    "features.redis_velocity_ip_ttl": {
      "label": "Redis IP velocity TTL",
      "description": "Redis IP velocity key의 sliding window 길이(초).",
      "example": "3600 — login_ip_high가 지난 1시간 한 IP의 login 카운트."
    },
    "features.redis_velocity_domain_ttl": {
      "label": "Redis domain velocity TTL",
      "description": "email domain signup velocity counter의 sliding window 길이.",
      "example": "86400 — signup_domain_*가 24h domain당 signup 카운트."
    },
    "features.rabbitmq_enabled": {
      "label": "RabbitMQ consumer 활성화",
      "description": "casino platform exchange/queue에서 event를 점수 매기는 async consumer 시작.",
      "example": "platform이 casino.events에 wallet.bet, player.login 등을 publish할 때 켬."
    },
    "features.rabbitmq_publish_results": {
      "label": "Orchestrator에 결과 publish",
      "description": "async scoring 후 scored EvaluateResponse 메시지를 results queue에 publish.",
      "example": "Orchestrator가 audit/action용 risk.results를 구독할 때 켬."
    },
    "features.rabbitmq_events_exchange": {
      "label": "Events exchange",
      "description": "casino platform이 publish하는 topic exchange. 비어 있으면 legacy direct queue mode.",
      "example": "casino.events"
    },
    "features.rabbitmq_events_exchange_type": {
      "label": "Exchange type",
      "description": "AFS consumer가 declare/bind하는 RabbitMQ exchange type.",
      "example": "topic"
    },
    "features.rabbitmq_events_queue": {
      "label": "Events queue",
      "description": "platform exchange에 bind 후 AFS가 consume하는 queue.",
      "example": "casino.afs"
    },
    "features.rabbitmq_events_binding_key": {
      "label": "Binding key",
      "description": "queue binding용 routing key 패턴. # = exchange의 모든 message.",
      "example": "# — 모든 event; player.* — player routing key만."
    },
    "features.rabbitmq_prefetch": {
      "label": "Prefetch count",
      "description": "consumer channel당 최대 unacknowledged message.",
      "example": "10 — 보수적; 50 — 더 높은 throughput, 더 많은 memory."
    },
    "features.rabbitmq_results_queue": {
      "label": "Results queue",
      "description": "scored async result의 outbound queue name.",
      "example": "risk.results"
    },
    "logging.sync_enabled": {
      "label": "Sync request/response logging",
      "description": "POST /evaluate의 전체 request 및 response payload를 Postgres에 저장. 아래 Log viewer에서 확인.",
      "example": "통합 테스트 중 활성화; 고볼륨 production에서 storage 우려 시 비활성화."
    },
    "logging.async_enabled": {
      "label": "Async request/response logging",
      "description": "가능한 경우 payload와 함께 RabbitMQ scored/skipped/rejected/failed message 저장.",
      "example": "container log tailing 없이 casino.events → AFS pipeline 디버그용 활성화."
    }
  },
  "fr": {
    "decision_thresholds.challenge": {
      "label": "Seuil challenge",
      "description": "Score minimum pour risque moyen. Le résultat est généralement challenge (Turnstile, MFA, revue manuelle) au lieu de allow.",
      "example": "40 — un joueur avec score 39 reçoit allow ; score 40+ est challenge sauf si un signal de blocage dur s'est déclenché."
    },
    "decision_thresholds.high": {
      "label": "Seuil élevé",
      "description": "Score minimum pour risque élevé. Login/signup sont souvent bloqués ; dépôts/retraits/paris peuvent être bloqués ou nécessiter des contrôles supplémentaires.",
      "example": "61 — score 60 reste moyen/challenge ; score 61+ est risque élevé."
    },
    "decision_thresholds.block": {
      "label": "Seuil block (critique)",
      "description": "Score minimum pour risque critique. Entraîne généralement block sauf si un signal de l'onglet Decision a déjà forcé block.",
      "example": "85 — score 84 peut rester élevé ; score 85+ est critique/block."
    },
    "operator.platform_name": {
      "label": "Nom de la plateforme",
      "description": "Libellé interne de cette instance opérateur. Utilisé dans les journaux et entrées d'audit — non envoyé aux joueurs.",
      "example": "DoveBet EU",
      "signal": "unlicensed_jurisdiction (lorsque le pays n'est pas dans les marchés licenciés)"
    },
    "operator.licensed_markets": {
      "label": "Marchés licenciés",
      "description": "Codes pays ISO 3166-1 alpha-2 où vous détenez une licence de jeu. Vérifiés lors des signup, deposit et bet via le pays du joueur ou la géolocalisation IP.",
      "example": "DE,GB,MT,SE — joueur de FR sans licence déclenche unlicensed_jurisdiction.",
      "signal": "unlicensed_jurisdiction"
    },
    "ip_intel.enabled": {
      "label": "Activé",
      "description": "Interrupteur principal. Désactivé : aucune recherche IP externe et aucun signal vpn/proxy/tor/hosting émis.",
      "example": "Désactivé en dev local si vous ne voulez pas d'appels API sortants.",
      "signal": "vpn_detected, proxy_detected, tor_exit_node, hosting_provider_ip"
    },
    "ip_intel.cache_ttl_seconds": {
      "label": "TTL cache (secondes)",
      "description": "Durée de mise en cache de chaque résultat de recherche IP dans Redis ou la mémoire avant nouvelle requête.",
      "example": "3600 — même IP vérifiée une fois par heure ; bascule VPN peut prendre jusqu'à 1 h."
    },
    "ip_intel.timeout_seconds": {
      "label": "Délai de recherche (secondes)",
      "description": "Attente max par requête API IP externe. Affecte la latence evaluate en cas de cache miss.",
      "example": "2.0 — échec ou fail-open rapide ; 5.0 — plus de temps pour APIs lentes."
    },
    "ip_intel.fail_open": {
      "label": "Fail open en cas d'erreur de recherche",
      "description": "Activé : timeout/erreur API n'ajoute pas de risque. Désactivé : échec de recherche traité comme suspect (VPN/proxy présumé).",
      "example": "Activé en production si la panne API IP ne doit pas bloquer les login ; désactivé pour un comportement strict."
    },
    "aml.single_deposit_threshold": {
      "label": "Revue dépôt unique",
      "description": "Un payment.deposit égal ou supérieur à ce montant déclenche la revue compliance niveau 1.",
      "example": "2000 — dépôt de 2 000 € déclenche elevated_deposit_aml_review.",
      "signal": "elevated_deposit_aml_review"
    },
    "aml.large_deposit_threshold": {
      "label": "Revue gros dépôt",
      "description": "Niveau AML dépôt le plus élevé — pour très gros dépôts uniques.",
      "example": "10000 — dépôt de 10 000 € déclenche large_deposit_aml_review.",
      "signal": "large_deposit_aml_review"
    },
    "aml.withdrawal_review_threshold": {
      "label": "Revue retrait",
      "description": "Un payment.withdraw égal ou supérieur à ce montant déclenche les signaux de revue cashout.",
      "example": "1000 — retrait de 1 000 € déclenche elevated_withdrawal_review et cashout_review_required.",
      "signal": "elevated_withdrawal_review, cashout_review_required"
    },
    "aml.structuring_threshold": {
      "label": "Seuil de structuration",
      "description": "Signale les dépôts entre 90 % et 100 % de ce montant — schéma pour rester juste sous les seuils de déclaration.",
      "example": "3000 — dépôt de 2 850 € (95 % de 3000) déclenche structuring_threshold_deposit.",
      "signal": "structuring_threshold_deposit"
    },
    "aml.micro_deposit_max": {
      "label": "Micro-dépôt max",
      "description": "Les dépôts strictement inférieurs à ce montant déclenchent la détection bonus-farming / test de paiement.",
      "example": "10 — dépôt de 5 € déclenche micro_deposit_bonus_farming.",
      "signal": "micro_deposit_bonus_farming"
    },
    "aml.high_stake_bet_threshold": {
      "label": "Pari à enjeu élevé",
      "description": "Un wallet.bet / game.bet égal ou supérieur à ce montant. Paris au-dessus de 100 € (règle moteur fixe) déclenchent aussi elevated_stake_bet.",
      "example": "500 — pari de 500 € déclenche high_stake_bet.",
      "signal": "high_stake_bet, elevated_stake_bet"
    },
    "aml.blocklist.enabled": {
      "label": "Filtrage blocklist activé",
      "description": "Interrupteur principal pour tous les moteurs blocklist AML (crypto, banque, pays, etc.).",
      "example": "Désactivé uniquement si les contrôles blocklist sont entièrement hors AFS."
    },
    "aml.blocklist.crypto_enabled": {
      "label": "Filtrage portefeuilles crypto",
      "description": "Vérifie les adresses crypto de paiement sur payment.withdraw / payment.deposit contre sync OFAC + liste manuelle.",
      "example": "Envoyez payment_method_type: crypto et payment_method_key: 0xabc… sur evaluate de retrait.",
      "signal": "ofac_sanctioned_wallet, blocklisted_payout_address"
    },
    "aml.blocklist.bank_enabled": {
      "label": "Filtrage comptes bancaires",
      "description": "Vérifie IBAN/identifiants de compte bancaire sur les paiements bancaires.",
      "example": "payment_method_type: bank, payment_method_key: DE89370400440532013000",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.ewallet_enabled": {
      "label": "Filtrage e-wallet",
      "description": "Vérifie identifiants ou e-mails e-wallet sur les paiements e-wallet.",
      "example": "payment_method_type: ewallet, payment_method_key: skrill_user@email.com",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.card_enabled": {
      "label": "Filtrage paiements carte",
      "description": "Vérifie jetons carte ou références de paiement sur les retraits carte.",
      "example": "payment_method_type: card, payment_method_key: card_token_abc123",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.country_enabled": {
      "label": "Filtrage blocklist pays",
      "description": "Bloque signup/login/deposit/withdraw quand le pays du joueur correspond à sync OFAC, onglet Lists ou pays manuels.",
      "example": "Pays joueur KP avec blocklist pays activée → blocklisted_country.",
      "signal": "blocklisted_country"
    },
    "aml.blocklist.sync_ofac_crypto_enabled": {
      "label": "Sync auto portefeuilles crypto OFAC",
      "description": "Récupère quotidiennement les adresses crypto SDN du Trésor US. Nécessite HTTPS sortant depuis le conteneur Risk.",
      "example": "Utilisez le bouton Sync OFAC lists now ci-dessous après activation."
    },
    "aml.blocklist.sync_ofac_countries_enabled": {
      "label": "Sync auto pays OFAC",
      "description": "Charge les codes ISO pays sanctionnés dérivés du Trésor dans Postgres à chaque sync.",
      "example": "S'exécute selon planning (intervalle sync) et sur sync manuel."
    },
    "aml.blocklist.sync_interval_hours": {
      "label": "Intervalle sync (heures)",
      "description": "Fréquence de rafraîchissement des listes crypto et pays OFAC par le job en arrière-plan.",
      "example": "24 — sync une fois par jour ; 6 pour mises à jour plus fréquentes."
    },
    "aml.blocklist.fail_open": {
      "label": "Fail open si sync indisponible",
      "description": "Activé : BD blocklist vide/périmée ne bloque pas les paiements. Désactivé : données sync manquantes = risque élevé.",
      "example": "Activé pour résilience production ; désactivé pour conformité maximale."
    },
    "aml.blocklist.use_lists_sanctioned_countries": {
      "label": "Inclure pays sanctionnés onglet Lists",
      "description": "Fusionne Lists → sanctioned countries dans les contrôles blocklist pays (en plus de sync OFAC et manuel).",
      "example": "Ajoutez IR dans Lists + activez → joueurs iraniens déclenchent sanctioned_country.",
      "signal": "sanctioned_country"
    },
    "aml.blocklist.crypto_hit_score": {
      "label": "Score hit blocklist paiement",
      "description": "Score de risque ajouté quand une destination de paiement (crypto/banque/e-wallet/carte) correspond à une entrée blocklist.",
      "example": "90 — pousse généralement la décision vers block combiné à d'autres signaux."
    },
    "aml.blocklist.country_hit_score": {
      "label": "Score hit blocklist pays",
      "description": "Score de risque quand le pays du joueur correspond à la blocklist.",
      "example": "90 — par défaut ; baissez à 70 pour challenge plutôt que block."
    },
    "aml.blocklist.manual_crypto_wallets": {
      "label": "Portefeuilles crypto manuels",
      "description": "Adresses portefeuille supplémentaires à bloquer — une par ligne. Vérifiées sur paiements crypto en plus de sync OFAC.",
      "example": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    "aml.blocklist.manual_bank_accounts": {
      "label": "Comptes bancaires manuels",
      "description": "IBAN ou identifiants de compte bancaire à bloquer — un par ligne.",
      "example": "DE89370400440532013000\\nGB82WEST12345698765432"
    },
    "aml.blocklist.manual_ewallet_accounts": {
      "label": "Comptes e-wallet manuels",
      "description": "Identifiants ou e-mails e-wallet à bloquer — un par ligne.",
      "example": "skrill:fraud_ring_01\\nneteller:abuse@test.com"
    },
    "aml.blocklist.manual_card_accounts": {
      "label": "Paiements carte manuels",
      "description": "Jetons carte ou références de paiement à bloquer — un par ligne.",
      "example": "card_token_stolen_batch_42\\nvisa_payout_ref_99102"
    },
    "aml.blocklist.manual_countries": {
      "label": "Pays blocklist manuels",
      "description": "Codes ISO 3166-1 alpha-2 à bloquer — un par ligne. Fusionnés avec sync OFAC et onglet Lists.",
      "example": "IR\\nKP\\nSY",
      "signal": "blocklisted_country"
    },
    "withdrawal_method.enabled": {
      "label": "Activé",
      "description": "Désactivé : les contrôles de destination de paiement partagée sont ignorés.",
      "example": "Nécessite payment_method_type + payment_method_key sur chaque evaluate payment.withdraw.",
      "signal": "shared_withdrawal_method, multiple_accounts_shared_payout_method, multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_medium": {
      "label": "Utilisateurs distincts (moyen)",
      "description": "Nombre de user_ids distincts devant retirer vers la même clé de paiement avant déclenchement niveau moyen.",
      "example": "2 — utilisateur A et B retirent vers IBAN DE89… → shared_withdrawal_method.",
      "signal": "shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_high": {
      "label": "Utilisateurs distincts (élevé)",
      "description": "Seuil utilisateurs distincts pour abus paiement multi-comptes niveau élevé.",
      "example": "3 — trois comptes partageant un e-mail Skrill.",
      "signal": "multiple_accounts_shared_payout_method"
    },
    "withdrawal_method.distinct_users_critical": {
      "label": "Utilisateurs distincts (critique)",
      "description": "Seuil utilisateurs distincts niveau critique — force généralement block via onglet Decision.",
      "example": "4 — quatre comptes, même portefeuille crypto → multi_account_shared_withdrawal_method (blocage dur).",
      "signal": "multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.medium_score": {
      "label": "Score moyen",
      "description": "Score de risque ajouté quand le seuil moyen utilisateurs distincts est atteint.",
      "example": "35 — combiné à d'autres moteurs pour atteindre challenge/high."
    },
    "withdrawal_method.high_score": {
      "label": "Score élevé",
      "description": "Score de risque ajouté quand le seuil élevé utilisateurs distincts est atteint.",
      "example": "55"
    },
    "withdrawal_method.critical_score": {
      "label": "Score critique",
      "description": "Score de risque ajouté quand le seuil critique utilisateurs distincts est atteint.",
      "example": "80 — souvent suffisant seul pour block si seuil de décision ≤80."
    },
    "betting_patterns.enabled": {
      "label": "Activé",
      "description": "Interrupteur principal pour compteurs de rafale séquentielle et contrôles ratio de gains.",
      "example": "Désactivé désactive tous les signaux de cet onglet."
    },
    "betting_patterns.burst_window_seconds": {
      "label": "Fenêtre rafale (secondes)",
      "description": "Fenêtre temporelle glissante pour tous les compteurs de rafale et calcul ratio de gains.",
      "example": "300 — 10 game.bets en 5 minutes comptent pour la rafale ; fenêtre glisse à chaque événement."
    },
    "betting_patterns.game_bet_burst_medium": {
      "label": "Rafale game.bet — moyen",
      "description": "Événements game.bet séquentiels dans la fenêtre avant signal rafale moyen.",
      "example": "10 — 10 spins bonus placés d'affilée en 300 s.",
      "signal": "sequential_game_bet_burst"
    },
    "betting_patterns.game_bet_burst_high": {
      "label": "Rafale game.bet — élevé",
      "description": "Nombre séquentiel game.bet pour rafale niveau élevé.",
      "example": "20",
      "signal": "sequential_game_bet_burst (higher score tier)"
    },
    "betting_patterns.game_bet_burst_critical": {
      "label": "Rafale game.bet — critique",
      "description": "Nombre séquentiel game.bet pour rafale niveau critique.",
      "example": "35",
      "signal": "sequential_game_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_bet_burst_medium": {
      "label": "Rafale wallet.bet — moyen",
      "description": "Événements wallet.bet (argent réel) séquentiels dans la fenêtre avant rafale moyenne.",
      "example": "20 — schéma bot paris live-casino rapides.",
      "signal": "sequential_wallet_bet_burst"
    },
    "betting_patterns.wallet_bet_burst_high": {
      "label": "Rafale wallet.bet — élevé",
      "description": "Nombre séquentiel wallet.bet pour niveau élevé.",
      "example": "40",
      "signal": "sequential_wallet_bet_burst (higher score tier)"
    },
    "betting_patterns.wallet_bet_burst_critical": {
      "label": "Rafale wallet.bet — critique",
      "description": "Nombre séquentiel wallet.bet pour niveau critique.",
      "example": "60",
      "signal": "sequential_wallet_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_win_burst_medium": {
      "label": "Rafale wallet.win — moyen",
      "description": "Crédits wallet.win séquentiels dans la fenêtre avant rafale gains moyenne.",
      "example": "8 — nombreux gains crédités en succession rapide.",
      "signal": "sequential_wallet_win_burst"
    },
    "betting_patterns.wallet_win_burst_high": {
      "label": "Rafale wallet.win — élevé",
      "description": "Nombre séquentiel wallet.win pour niveau élevé.",
      "example": "15",
      "signal": "sequential_wallet_win_burst (higher score tier)"
    },
    "betting_patterns.wallet_win_burst_critical": {
      "label": "Rafale wallet.win — critique",
      "description": "Nombre séquentiel wallet.win pour niveau critique.",
      "example": "25",
      "signal": "sequential_wallet_win_burst (critical score tier)"
    },
    "betting_patterns.win_rate_min_bets": {
      "label": "Taux de gain — paris min.",
      "description": "Nombre minimum wallet.bet + game.bet dans la fenêtre avant évaluation du ratio de gains.",
      "example": "5 — au moins 5 paris requis ; 4 gains / 4 paris ignorés jusqu'au 5e pari."
    },
    "betting_patterns.win_rate_high_ratio": {
      "label": "Taux de gain — ratio élevé",
      "description": "Ratio gains ÷ paris déclenchant le signal taux de gain élevé (0–1).",
      "example": "0.75 — 6 gains sur 8 paris (75 %) dans la fenêtre déclenche high_win_rate_in_betting_sequence.",
      "signal": "high_win_rate_in_betting_sequence"
    },
    "betting_patterns.win_rate_critical_ratio": {
      "label": "Taux de gain — ratio critique",
      "description": "Ratio gains ÷ paris pour niveau critique taux de gain.",
      "example": "0.90 — 9 gains sur 10 paris déclenche critical_win_rate_in_betting_sequence.",
      "signal": "critical_win_rate_in_betting_sequence"
    },
    "hedge_betting.enabled": {
      "label": "Activé",
      "description": "Interrupteur principal pour détection rounds couverts et ratio volume-washing.",
      "example": "Désactivé si vous n'envoyez pas encore metadata.game.selection et round_id."
    },
    "hedge_betting.window_seconds": {
      "label": "Fenêtre stats (secondes)",
      "description": "Fenêtre glissante pour compter rounds couverts répétés et ratio volume brut.",
      "example": "3600 — compter rounds couverts de la dernière heure par utilisateur."
    },
    "hedge_betting.round_leg_ttl_seconds": {
      "label": "TTL jambe de round (secondes)",
      "description": "Durée de stockage de la première jambe de pari en attendant le côté opposé sur le même round_id.",
      "example": "600 — pari banker à 12:00:00 ; pari player à 12:09:59 correspond encore ; à 12:10:01 la jambe expire."
    },
    "hedge_betting.time_pair_window_seconds": {
      "label": "Fenêtre time-pair (secondes)",
      "description": "Groupement de secours quand round_id absent mais table_id présent — paris dans cette fenêtre sur même table peuvent s'apparier.",
      "example": "15 — utilisé seulement si require_round_id désactivé et round_id absent."
    },
    "hedge_betting.require_round_id": {
      "label": "Exiger round_id",
      "description": "Activé : contrôles hedge uniquement si metadata.game.round_id présent. Recommandé une fois que le backend envoie round_id.",
      "example": "Activé en production — évite faux positifs du time-pair de secours."
    },
    "hedge_betting.opposite_selection_groups": {
      "label": "Groupes selection opposés",
      "description": "Tableau JSON de groupes. Les selections du même tableau interne sont traitées comme opposées sur le même round.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.amount_match_tolerance_percent": {
      "label": "Tolérance correspondance montant (%)",
      "description": "Les jambes opposées doivent avoir des stakes dans ce pourcentage l'une de l'autre.",
      "example": "10 — banker 1 000 € + player 950 € correspond ; player 800 € non."
    },
    "hedge_betting.opposite_side_same_round_score": {
      "label": "Score — côtés opposés même round",
      "description": "Score de risque quand un round couvert (côtés opposés, montants correspondants) est détecté.",
      "example": "50 — se déclenche sur la première paire banker+player détectée.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.hedged_round_medium": {
      "label": "Rounds couverts — moyen",
      "description": "Rounds couverts distincts dans la fenêtre stats avant signal motif répété (niveau moyen).",
      "example": "3 — trois mains couvertes séparées en une heure.",
      "signal": "repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_high": {
      "label": "Rounds couverts — élevé",
      "description": "Rounds couverts distincts pour niveau élevé.",
      "example": "8",
      "signal": "high_repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_critical": {
      "label": "Rounds couverts — critique",
      "description": "Rounds couverts distincts pour niveau critique.",
      "example": "15",
      "signal": "critical_hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_enabled": {
      "label": "Contrôle volume washing",
      "description": "Activé : compare volume brut paris couverts au volume brut total dans la fenêtre stats.",
      "example": "Joueur parie 6 000 € couverts + 4 000 € normaux en 1 h → 60 % part couverte.",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.min_gross_volume": {
      "label": "Volume washing — brut min.",
      "description": "Volume total paris minimum dans la fenêtre avant évaluation ratio volume-washing.",
      "example": "5000 — ignorer ratio jusqu'à au moins 5 000 € de paris bruts du joueur dans la fenêtre."
    },
    "hedge_betting.min_hedged_gross_ratio": {
      "label": "Volume washing — ratio couvert min.",
      "description": "Ratio minimum hedged_gross ÷ total_gross (0–1) pour déclencher signal volume washing.",
      "example": "0.5 — 50 % ou plus du volume brut couvert → hedged_bet_volume_washing (blocage dur si dans Decision).",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_score": {
      "label": "Score — volume washing",
      "description": "Score de risque ajouté quand le seuil ratio volume-washing est atteint.",
      "example": "55 — combiner avec score opposite_side pour total plus élevé."
    },
    "step_up_verification.enabled": {
      "label": "Activé",
      "description": "Désactivé : metadata step_up_verification ignorée et résultats challenge non rétrogradés.",
      "example": "Activé quand le frontend affiche Turnstile sur réponses challenge."
    },
    "step_up_verification.grant_ttl_days": {
      "label": "Durée grant (jours)",
      "description": "Durée d'un grant de vérification réussi pour le même user_id + device fingerprint.",
      "example": "7 — joueur passe Turnstile une fois ; login suivants autorisés 7 jours sur même appareil."
    },
    "step_up_verification.max_verified_age_minutes": {
      "label": "Âge max verified_at (minutes)",
      "description": "metadata.verified_at doit être dans ce nombre de minutes de l'horodatage de la requête evaluate.",
      "example": "5 — siteverify à 12:00, evaluate à 12:06 → grant rejeté comme périmé."
    },
    "step_up_verification.downgrade_challenge_to_allow": {
      "label": "Rétrograder challenge en allow",
      "description": "Activé : grant actif change décision challenge en allow. Ne remplace jamais block ni signaux critiques.",
      "example": "Activé — réglage production typique après passage Turnstile."
    },
    "step_up_verification.allowed_hostnames": {
      "label": "Hostnames autorisés",
      "description": "Liste blanche optionnelle Cloudflare hostname de la réponse siteverify — un par ligne. Vide = ignorer contrôle.",
      "example": "casino.example.com\\nwww.casino.example.com"
    },
    "step_up_verification.applicable_event_types": {
      "label": "Types d'événement applicables",
      "description": "Types d'événement où le grant step-up peut rétrograder challenge — un par ligne.",
      "example": "player.login\\nplayer.signup\\npayment.deposit"
    },
    "fingerprint.required_channels": {
      "label": "Canaux requis",
      "description": "Canaux où context.fingerprint est attendu. Valeur manquante sur ces canaux déclenche missing_fingerprint.",
      "example": "web,mobile — signup web sans visitorId → missing_fingerprint.",
      "signal": "missing_fingerprint"
    },
    "fingerprint.min_length": {
      "label": "Longueur min.",
      "description": "Longueur minimale valide en caractères du visitorId FingerprintJS.",
      "example": "10 — abc123 (6 car.) → malformed_fingerprint.",
      "signal": "malformed_fingerprint"
    },
    "fingerprint.max_length": {
      "label": "Longueur max.",
      "description": "Longueur maximale valide du visitorId. Valeurs hors min–max rejetées.",
      "example": "64",
      "signal": "malformed_fingerprint, invalid_fingerprint"
    },
    "fingerprint.suspicious_values": {
      "label": "Valeurs suspectes",
      "description": "Chaînes empreinte fausses ou placeholder connues — une par ligne. Correspondance exacte échoue validation.",
      "example": "undefined\\nnull\\n00000000-0000-0000-0000-000000000000",
      "signal": "invalid_fingerprint"
    },
    "lists.disposable_domains": {
      "label": "Domaines e-mail jetables",
      "description": "Domaines fournisseurs e-mail temporaires. Signup avec ces domaines est généralement hard-blocké.",
      "example": "mailinator.com\\n10minutemail.com\\nguerrillamail.com",
      "signal": "disposable_email"
    },
    "lists.high_risk_countries": {
      "label": "Pays à haut risque",
      "description": "Codes pays ISO à taux de fraude élevé. Ajoute score sur contrôles geo/IP — pas blocage automatique.",
      "example": "NG\\nGH\\nPK",
      "signal": "high_risk_country"
    },
    "lists.sanctioned_countries": {
      "label": "Pays sanctionnés",
      "description": "Codes ISO juridictions sanctionnées ou jeu interdit. Utilisés quand blocklist AML inclut onglet Lists.",
      "example": "IR\\nKP\\nCU",
      "signal": "sanctioned_country"
    },
    "lists.generic_names": {
      "label": "Noms génériques",
      "description": "Noms affichés placeholder sur signup/identité — un par ligne, insensible à la casse.",
      "example": "test\\nuser\\nadmin\\nPlayer",
      "signal": "generic_name"
    },
    "lists.role_based_email_locals": {
      "label": "Locaux e-mail par rôle",
      "description": "Parties locales e-mail (avant @) indiquant comptes non personnels.",
      "example": "admin\\nsupport\\ninfo\\nnoreply",
      "signal": "role_based_email"
    },
    "lists.suspicious_email_tlds": {
      "label": "TLD e-mail suspects",
      "description": "Domaines de premier niveau associés au spam. Correspondance quand e-mail se termine par ces TLD.",
      "example": ".xyz\\n.top\\n.click",
      "signal": "suspicious_email_tld"
    },
    "lists.suspicious_email_local_tokens": {
      "label": "Jetons locaux e-mail suspects",
      "description": "Sous-chaînes dans partie locale e-mail suggérant comptes jetables ou bots.",
      "example": "temp\\nspam\\nbot\\nfake",
      "signal": "suspicious_email_pattern"
    },
    "lists.bot_user_agent_tokens": {
      "label": "Jetons User-Agent bot",
      "description": "Sous-chaînes en-tête User-Agent indiquant scripts ou automatisation.",
      "example": "curl\\npython-requests\\nheadless\\nscrapy",
      "signal": "bot_user_agent"
    },
    "lists.emulator_ua_tokens": {
      "label": "Jetons UA émulateur",
      "description": "Motifs User-Agent pour émulateurs Android ou appareils virtuels.",
      "example": "genymotion\\nbluestacks\\nsdk_gphone",
      "signal": "emulator_detected"
    },
    "lists.suspicious_referrers": {
      "label": "Référents suspects",
      "description": "Valeurs référent exactes traitées comme faible confiance au signup.",
      "example": "direct\\nunknown\\n(ligne vide pour référent blank)",
      "signal": "suspicious_referrer"
    },
    "lists.bonus_abuse_referrer_tokens": {
      "label": "Jetons référent abus bonus",
      "description": "Sous-chaînes URL référent signup liées à chasse bonus ou abus affilié.",
      "example": "free-spins\\nno-deposit\\nbonus-hunter",
      "signal": "bonus_abuse_referrer"
    },
    "velocity_thresholds": {
      "label": "Seuils velocity (JSON)",
      "description": "Carte nom seuil → compte max. Suffixe _medium/_high/_critical sélectionne le niveau. Ne supprimez pas les clés — moteurs attendent l'ensemble complet.",
      "example": "{\\n  \"login_ip_medium\": 5,\\n  \"login_ip_high\": 15,\\n  \"login_ip_critical\": 30,\\n  \"signup_ip_critical\": 10,\\n  \"deposit_user_high\": 6\\n}",
      "signal": "medium_login_ip_velocity, bulk_login_attack, bulk_signup_attack, rapid_deposit_activity, …"
    },
    "critical_signals": {
      "label": "Signaux blocage dur",
      "description": "Chaînes exactes de noms de signaux émis par les moteurs — une par ligne. Casse exacte requise.",
      "example": "disposable_email\\nbulk_login_attack\\nhedged_bet_volume_washing\\nmulti_account_shared_withdrawal_method"
    },
    "features.sync_publish_audit": {
      "label": "Publier audit sur sync /evaluate",
      "description": "Activé : résultats POST /evaluate synchrones publiés aussi sur RabbitMQ pour audit Orchestrator.",
      "example": "Activé quand Orchestrator doit voir décisions API sync dans le même pipeline qu'événements async."
    },
    "features.decision_cache_ttl_seconds": {
      "label": "TTL cache décision (secondes)",
      "description": "Met en cache décisions event_id identiques dans Redis pour éviter re-scoring doublons. Nécessite Redis activé.",
      "example": "300 — même event_id en 5 minutes retourne décision en cache ; 0 = désactivé."
    },
    "features.redis_enabled": {
      "label": "Redis activé",
      "description": "Utilise Redis pour compteurs velocity, stores hedge/betting et cache décision optionnel.",
      "example": "Désactivé dev instance unique (compteurs mémoire) ; activé production multi-instance."
    },
    "features.redis_velocity_ip_ttl": {
      "label": "TTL velocity IP Redis",
      "description": "Longueur fenêtre glissante (secondes) pour clés velocity IP dans Redis.",
      "example": "3600 — login_ip_high compte login d'une IP la dernière heure."
    },
    "features.redis_velocity_domain_ttl": {
      "label": "TTL velocity domaine Redis",
      "description": "Longueur fenêtre glissante pour compteurs velocity signup par domaine e-mail.",
      "example": "86400 — signup_domain_* compte signups par domaine en 24 h."
    },
    "features.rabbitmq_enabled": {
      "label": "Consumer RabbitMQ activé",
      "description": "Démarre consumer async qui score événements depuis exchange/file plateforme casino.",
      "example": "Activé quand plateforme publie wallet.bet, player.login, etc. sur casino.events."
    },
    "features.rabbitmq_publish_results": {
      "label": "Publier résultats vers Orchestrator",
      "description": "Publie messages EvaluateResponse scorés sur file résultats après scoring async.",
      "example": "Activé quand Orchestrator s'abonne à risk.results pour audit/actions."
    },
    "features.rabbitmq_events_exchange": {
      "label": "Exchange événements",
      "description": "Exchange topic où la plateforme casino publie. Vide = mode file directe hérité.",
      "example": "casino.events"
    },
    "features.rabbitmq_events_exchange_type": {
      "label": "Type exchange",
      "description": "Type exchange RabbitMQ déclaré/liaison par consumer AFS.",
      "example": "topic"
    },
    "features.rabbitmq_events_queue": {
      "label": "File événements",
      "description": "File consommée par AFS après liaison à l'exchange plateforme.",
      "example": "casino.afs"
    },
    "features.rabbitmq_events_binding_key": {
      "label": "Clé de liaison",
      "description": "Motif routing key pour liaison file. # = tous messages sur exchange.",
      "example": "# — tous événements ; player.* — uniquement routing keys player."
    },
    "features.rabbitmq_prefetch": {
      "label": "Compte prefetch",
      "description": "Max messages non acquittés par canal consumer.",
      "example": "10 — conservateur ; 50 — débit plus élevé, plus de mémoire."
    },
    "features.rabbitmq_results_queue": {
      "label": "File résultats",
      "description": "Nom file sortante pour résultats async scorés.",
      "example": "risk.results"
    },
    "logging.sync_enabled": {
      "label": "Journalisation requête/réponse sync",
      "description": "Stocke payloads complets requête et réponse pour POST /evaluate dans Postgres. Voir Log viewer ci-dessous.",
      "example": "Activer pendant tests intégration ; désactiver en production haut volume si stockage préoccupant."
    },
    "logging.async_enabled": {
      "label": "Journalisation requête/réponse async",
      "description": "Stocke messages RabbitMQ scorés/ignorés/rejetés/échoués avec payloads si disponibles.",
      "example": "Activer pour déboguer pipeline casino.events → AFS sans suivre logs conteneur."
    }
  },
  "de": {
    "decision_thresholds.challenge": {
      "label": "Challenge-Schwellenwert",
      "description": "Mindestpunktzahl für mittleres Risiko. Ergebnis ist meist challenge (Turnstile, MFA, manuelle Prüfung) statt allow.",
      "example": "40 — Spieler mit Punktzahl 39 erhält allow; Punktzahl 40+ ist challenge, sofern kein Hard-Block-Signal ausgelöst wurde."
    },
    "decision_thresholds.high": {
      "label": "Hoher Schwellenwert",
      "description": "Mindestpunktzahl für hohes Risiko. Login/signup werden oft blockiert; Ein-/Auszahlungen/Wetten können blockiert werden oder Zusatzprüfungen erfordern.",
      "example": "61 — Punktzahl 60 bleibt mittel/challenge; Punktzahl 61+ ist hohes Risiko."
    },
    "decision_thresholds.block": {
      "label": "Block-Schwellenwert (kritisch)",
      "description": "Mindestpunktzahl für kritisches Risiko. Führt meist zu block, sofern ein Signal im Tab Decision nicht bereits block erzwungen hat.",
      "example": "85 — Punktzahl 84 kann noch hoch sein; Punktzahl 85+ ist kritisch/block."
    },
    "operator.platform_name": {
      "label": "Plattformname",
      "description": "Interne Bezeichnung dieser Operator-Instanz. Wird in Logs und Audit-Einträgen verwendet — nicht an Spieler gesendet.",
      "example": "DoveBet EU",
      "signal": "unlicensed_jurisdiction (wenn Land nicht in lizenzierten Märkten)"
    },
    "operator.licensed_markets": {
      "label": "Lizenzierte Märkte",
      "description": "ISO 3166-1 alpha-2 Ländercodes, in denen Sie eine Glücksspiellizenz besitzen. Geprüft bei signup, deposit und bet anhand Spielerland oder IP-Geo.",
      "example": "DE,GB,MT,SE — Spieler aus FR ohne Lizenz löst unlicensed_jurisdiction aus.",
      "signal": "unlicensed_jurisdiction"
    },
    "ip_intel.enabled": {
      "label": "Aktiviert",
      "description": "Hauptschalter. Aus: keine externen IP-Abfragen und keine vpn/proxy/tor/hosting-Signale.",
      "example": "Aus bei lokaler Entwicklung, wenn keine ausgehenden API-Aufrufe gewünscht.",
      "signal": "vpn_detected, proxy_detected, tor_exit_node, hosting_provider_ip"
    },
    "ip_intel.cache_ttl_seconds": {
      "label": "Cache-TTL (Sekunden)",
      "description": "Wie lange jedes IP-Abfrageergebnis in Redis oder Speicher gecacht wird, bevor erneut abgerufen wird.",
      "example": "3600 — gleiche IP einmal pro Stunde geprüft; VPN-Wechsel können bis zu 1 Stunde verzögert sein."
    },
    "ip_intel.timeout_seconds": {
      "label": "Abfrage-Timeout (Sekunden)",
      "description": "Maximale Wartezeit pro externer IP-API-Anfrage. Beeinflusst evaluate-Latenz bei Cache-Miss.",
      "example": "2.0 — schnell fail oder fail-open; 5.0 — mehr Zeit für langsame APIs."
    },
    "ip_intel.fail_open": {
      "label": "Fail open bei Abfragefehler",
      "description": "Ein: API-Timeout/Fehler fügt kein Risiko hinzu. Aus: Abfragefehler wird als verdächtig behandelt (VPN/proxy vermutet).",
      "example": "Ein in Production, wenn IP-API-Ausfall Logins nicht blockieren darf; aus für striktes Verhalten."
    },
    "aml.single_deposit_threshold": {
      "label": "Einzel-Einzahlungsprüfung",
      "description": "Einzelner payment.deposit ab diesem Betrag löst Compliance-Review Stufe 1 aus.",
      "example": "2000 — Einzahlung von 2.000 € löst elevated_deposit_aml_review aus.",
      "signal": "elevated_deposit_aml_review"
    },
    "aml.large_deposit_threshold": {
      "label": "Große Einzahlungsprüfung",
      "description": "Höchste Einzahlungs-AML-Stufe — für sehr große Einzeleinzahlungen.",
      "example": "10000 — Einzahlung von 10.000 € löst large_deposit_aml_review aus.",
      "signal": "large_deposit_aml_review"
    },
    "aml.withdrawal_review_threshold": {
      "label": "Auszahlungsprüfung",
      "description": "Einzelner payment.withdraw ab diesem Betrag löst Cashout-Review-Signale aus.",
      "example": "1000 — Auszahlung von 1.000 € löst elevated_withdrawal_review und cashout_review_required aus.",
      "signal": "elevated_withdrawal_review, cashout_review_required"
    },
    "aml.structuring_threshold": {
      "label": "Structuring-Schwellenwert",
      "description": "Markiert Einzahlungen zwischen 90 % und 100 % dieses Betrags — Muster, um knapp unter Meldegrenzen zu bleiben.",
      "example": "3000 — Einzahlung von 2.850 € (95 % von 3000) löst structuring_threshold_deposit aus.",
      "signal": "structuring_threshold_deposit"
    },
    "aml.micro_deposit_max": {
      "label": "Micro-Einzahlung max.",
      "description": "Einzahlungen strikt unter diesem Betrag lösen Bonus-Farming-/Zahlungstest-Erkennung aus.",
      "example": "10 — Einzahlung von 5 € löst micro_deposit_bonus_farming aus.",
      "signal": "micro_deposit_bonus_farming"
    },
    "aml.high_stake_bet_threshold": {
      "label": "Hohe Einsatzwette",
      "description": "Einzelner wallet.bet / game.bet ab diesem Betrag. Wetten über 100 € (feste Engine-Regel) lösen auch elevated_stake_bet aus.",
      "example": "500 — Wette von 500 € löst high_stake_bet aus.",
      "signal": "high_stake_bet, elevated_stake_bet"
    },
    "aml.blocklist.enabled": {
      "label": "Blocklist-Screening aktiviert",
      "description": "Hauptschalter für alle AML-Blocklist-Engines (Crypto, Bank, Land usw.).",
      "example": "Aus nur wenn Blocklist-Prüfungen vollständig außerhalb AFS laufen."
    },
    "aml.blocklist.crypto_enabled": {
      "label": "Crypto-Wallet-Screening",
      "description": "Prüft Crypto-Auszahlungsadressen bei payment.withdraw / payment.deposit gegen OFAC sync + manuelle Liste.",
      "example": "Senden Sie payment_method_type: crypto und payment_method_key: 0xabc… bei Withdraw-evaluate.",
      "signal": "ofac_sanctioned_wallet, blocklisted_payout_address"
    },
    "aml.blocklist.bank_enabled": {
      "label": "Bankkonto-Screening",
      "description": "Prüft IBAN/Bankkonto-IDs bei Bankauszahlungen.",
      "example": "payment_method_type: bank, payment_method_key: DE89370400440532013000",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.ewallet_enabled": {
      "label": "E-Wallet-Screening",
      "description": "Prüft E-Wallet-IDs oder E-Mails bei E-Wallet-Auszahlungen.",
      "example": "payment_method_type: ewallet, payment_method_key: skrill_user@email.com",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.card_enabled": {
      "label": "Kartenauszahlungs-Screening",
      "description": "Prüft Kartentoken oder Auszahlungsreferenzen bei Kartenauszahlungen.",
      "example": "payment_method_type: card, payment_method_key: card_token_abc123",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.country_enabled": {
      "label": "Länder-Blocklist-Screening",
      "description": "Blockiert signup/login/deposit/withdraw, wenn Spielerland mit OFAC sync, Lists-Tab oder manuellen Ländern übereinstimmt.",
      "example": "Spielerland KP mit aktivierter Länder-Blocklist → blocklisted_country.",
      "signal": "blocklisted_country"
    },
    "aml.blocklist.sync_ofac_crypto_enabled": {
      "label": "OFAC-Crypto-Wallets auto-sync",
      "description": "Lädt täglich SDN-Crypto-Adressen des US-Treasury. Erfordert ausgehendes HTTPS aus Risk-Container.",
      "example": "Nach Aktivierung Schaltfläche Sync OFAC lists now unten verwenden."
    },
    "aml.blocklist.sync_ofac_countries_enabled": {
      "label": "OFAC-Länder auto-sync",
      "description": "Lädt Treasury-abgeleitete sanktionierte Länder-ISO-Codes bei jedem Sync in Postgres.",
      "example": "Läuft nach Zeitplan (Sync-Intervall) und bei manuellem Sync."
    },
    "aml.blocklist.sync_interval_hours": {
      "label": "Sync-Intervall (Stunden)",
      "description": "Wie oft der Hintergrundjob OFAC-Crypto- und Länderlisten aktualisiert.",
      "example": "24 — Sync einmal täglich; 6 für häufigere Updates."
    },
    "aml.blocklist.fail_open": {
      "label": "Fail open bei Sync nicht verfügbar",
      "description": "Ein: leere/veraltete Blocklist-DB blockiert keine Auszahlungen. Aus: fehlende Sync-Daten = hohes Risiko.",
      "example": "Ein für Production-Resilienz; aus für maximale Compliance-Strenge."
    },
    "aml.blocklist.use_lists_sanctioned_countries": {
      "label": "Lists-Tab sanktionierte Länder einbeziehen",
      "description": "Führt Lists → sanctioned countries in Länder-Blocklist-Prüfungen ein (zusätzlich zu OFAC sync und manuell).",
      "example": "IR im Lists-Tab + aktivieren → iranische Spieler erhalten sanctioned_country.",
      "signal": "sanctioned_country"
    },
    "aml.blocklist.crypto_hit_score": {
      "label": "Auszahlungs-Blocklist-Treffer-Score",
      "description": "Risikopunktzahl, wenn ein Auszahlungsziel (Crypto/Bank/E-Wallet/Karte) einem Blocklist-Eintrag entspricht.",
      "example": "90 — drückt Entscheidung meist Richtung block in Kombination mit anderen Signalen."
    },
    "aml.blocklist.country_hit_score": {
      "label": "Länder-Blocklist-Treffer-Score",
      "description": "Risikopunktzahl, wenn Spielerland mit Blocklist übereinstimmt.",
      "example": "90 — Standard; auf 70 senken für challenge statt block."
    },
    "aml.blocklist.manual_crypto_wallets": {
      "label": "Manuelle Crypto-Wallets",
      "description": "Zusätzliche Wallet-Adressen zum Blockieren — eine pro Zeile. Bei Crypto-Auszahlungen zusätzlich zu OFAC sync geprüft.",
      "example": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    "aml.blocklist.manual_bank_accounts": {
      "label": "Manuelle Bankkonten",
      "description": "IBAN oder Bankkonto-Identifikatoren zum Blockieren — einer pro Zeile.",
      "example": "DE89370400440532013000\\nGB82WEST12345698765432"
    },
    "aml.blocklist.manual_ewallet_accounts": {
      "label": "Manuelle E-Wallet-Konten",
      "description": "E-Wallet-IDs oder E-Mails zum Blockieren — eine pro Zeile.",
      "example": "skrill:fraud_ring_01\\nneteller:abuse@test.com"
    },
    "aml.blocklist.manual_card_accounts": {
      "label": "Manuelle Kartenauszahlungen",
      "description": "Kartentoken oder Auszahlungsreferenzen zum Blockieren — eine pro Zeile.",
      "example": "card_token_stolen_batch_42\\nvisa_payout_ref_99102"
    },
    "aml.blocklist.manual_countries": {
      "label": "Manuelle blocklistete Länder",
      "description": "ISO 3166-1 alpha-2 Codes zum Blockieren — einer pro Zeile. Mit OFAC sync und Lists-Tab zusammengeführt.",
      "example": "IR\\nKP\\nSY",
      "signal": "blocklisted_country"
    },
    "withdrawal_method.enabled": {
      "label": "Aktiviert",
      "description": "Aus: gemeinsame Auszahlungsziel-Prüfungen werden übersprungen.",
      "example": "Erfordert payment_method_type + payment_method_key bei jedem payment.withdraw evaluate.",
      "signal": "shared_withdrawal_method, multiple_accounts_shared_payout_method, multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_medium": {
      "label": "Verschiedene Nutzer (mittel)",
      "description": "Wie viele verschiedene user_ids müssen auf denselben payout key auszahlen, bevor mittlere Stufe auslöst.",
      "example": "2 — Nutzer A und B zahlen auf IBAN DE89… aus → shared_withdrawal_method.",
      "signal": "shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_high": {
      "label": "Verschiedene Nutzer (hoch)",
      "description": "Schwellenwert verschiedener Nutzer für hohe Multi-Account-Auszahlungsmissbrauchsstufe.",
      "example": "3 — drei Konten teilen eine Skrill-E-Mail.",
      "signal": "multiple_accounts_shared_payout_method"
    },
    "withdrawal_method.distinct_users_critical": {
      "label": "Verschiedene Nutzer (kritisch)",
      "description": "Schwellenwert verschiedener Nutzer für kritische Stufe — erzwingt meist block über Tab Decision.",
      "example": "4 — vier Konten, gleiche Crypto-Wallet → multi_account_shared_withdrawal_method (Hard Block).",
      "signal": "multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.medium_score": {
      "label": "Mittlerer Score",
      "description": "Risikopunktzahl bei Erreichen des mittleren Schwellenwerts verschiedener Nutzer.",
      "example": "35 — kombiniert mit anderen Engines für challenge/high."
    },
    "withdrawal_method.high_score": {
      "label": "Hoher Score",
      "description": "Risikopunktzahl bei Erreichen des hohen Schwellenwerts verschiedener Nutzer.",
      "example": "55"
    },
    "withdrawal_method.critical_score": {
      "label": "Kritischer Score",
      "description": "Risikopunktzahl bei Erreichen des kritischen Schwellenwerts verschiedener Nutzer.",
      "example": "80 — oft allein genug für block, wenn Entscheidungsschwellenwert ≤80."
    },
    "betting_patterns.enabled": {
      "label": "Aktiviert",
      "description": "Hauptschalter für sequenzielle Burst-Zähler und Gewinnraten-Prüfungen.",
      "example": "Aus deaktiviert alle Signale in diesem Tab."
    },
    "betting_patterns.burst_window_seconds": {
      "label": "Burst-Fenster (Sekunden)",
      "description": "Rollierendes Zeitfenster für alle Burst-Zähler und Gewinnraten-Berechnung.",
      "example": "300 — 10 game.bets in 5 Minuten zählen zum Burst; Fenster verschiebt sich bei jedem Event."
    },
    "betting_patterns.game_bet_burst_medium": {
      "label": "game.bet Burst — mittel",
      "description": "Sequenzielle game.bet-Events im Fenster vor mittlerem Burst-Signal.",
      "example": "10 — 10 Bonus-Spins hintereinander innerhalb 300 s.",
      "signal": "sequential_game_bet_burst"
    },
    "betting_patterns.game_bet_burst_high": {
      "label": "game.bet Burst — hoch",
      "description": "Sequenzielle game.bet-Anzahl für hohe Burst-Stufe.",
      "example": "20",
      "signal": "sequential_game_bet_burst (higher score tier)"
    },
    "betting_patterns.game_bet_burst_critical": {
      "label": "game.bet Burst — kritisch",
      "description": "Sequenzielle game.bet-Anzahl für kritische Burst-Stufe.",
      "example": "35",
      "signal": "sequential_game_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_bet_burst_medium": {
      "label": "wallet.bet Burst — mittel",
      "description": "Sequenzielle wallet.bet-Events (Echtgeld) im Fenster vor mittlerem Burst.",
      "example": "20 — schnelles Live-Casino-Wettbot-Muster.",
      "signal": "sequential_wallet_bet_burst"
    },
    "betting_patterns.wallet_bet_burst_high": {
      "label": "wallet.bet Burst — hoch",
      "description": "Sequenzielle wallet.bet-Anzahl für hohe Stufe.",
      "example": "40",
      "signal": "sequential_wallet_bet_burst (higher score tier)"
    },
    "betting_patterns.wallet_bet_burst_critical": {
      "label": "wallet.bet Burst — kritisch",
      "description": "Sequenzielle wallet.bet-Anzahl für kritische Stufe.",
      "example": "60",
      "signal": "sequential_wallet_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_win_burst_medium": {
      "label": "wallet.win Burst — mittel",
      "description": "Sequenzielle wallet.win-Gutschriften im Fenster vor mittlerem Gewinn-Burst.",
      "example": "8 — viele Gewinne in schneller Folge gutgeschrieben.",
      "signal": "sequential_wallet_win_burst"
    },
    "betting_patterns.wallet_win_burst_high": {
      "label": "wallet.win Burst — hoch",
      "description": "Sequenzielle wallet.win-Anzahl für hohe Stufe.",
      "example": "15",
      "signal": "sequential_wallet_win_burst (higher score tier)"
    },
    "betting_patterns.wallet_win_burst_critical": {
      "label": "wallet.win Burst — kritisch",
      "description": "Sequenzielle wallet.win-Anzahl für kritische Stufe.",
      "example": "25",
      "signal": "sequential_wallet_win_burst (critical score tier)"
    },
    "betting_patterns.win_rate_min_bets": {
      "label": "Gewinnrate — Min. Wetten",
      "description": "Mindestanzahl wallet.bet + game.bet im Fenster vor Gewinnraten-Auswertung.",
      "example": "5 — mindestens 5 Wetten nötig; 4 Gewinne / 4 Wetten ignoriert bis 5. Wette."
    },
    "betting_patterns.win_rate_high_ratio": {
      "label": "Gewinnrate — hohes Verhältnis",
      "description": "Gewinne ÷ Wetten-Verhältnis, das hohes Gewinnraten-Signal auslöst (0–1).",
      "example": "0.75 — 6 Gewinne aus 8 Wetten (75 %) im Fenster löst high_win_rate_in_betting_sequence aus.",
      "signal": "high_win_rate_in_betting_sequence"
    },
    "betting_patterns.win_rate_critical_ratio": {
      "label": "Gewinnrate — kritisches Verhältnis",
      "description": "Gewinne ÷ Wetten-Verhältnis für kritische Gewinnraten-Stufe.",
      "example": "0.90 — 9 Gewinne aus 10 Wetten löst critical_win_rate_in_betting_sequence aus.",
      "signal": "critical_win_rate_in_betting_sequence"
    },
    "hedge_betting.enabled": {
      "label": "Aktiviert",
      "description": "Hauptschalter für Hedged-Round-Erkennung und Volume-Washing-Verhältnis.",
      "example": "Aus, wenn Sie metadata.game.selection und round_id noch nicht senden."
    },
    "hedge_betting.window_seconds": {
      "label": "Statistik-Fenster (Sekunden)",
      "description": "Rollierendes Fenster zum Zählen wiederholter hedged rounds und Bruttovolumen-Verhältnis.",
      "example": "3600 — hedged rounds der letzten Stunde pro Nutzer zählen."
    },
    "hedge_betting.round_leg_ttl_seconds": {
      "label": "Round-Leg-TTL (Sekunden)",
      "description": "Wie lange die erste Wett-Leg gespeichert wird, während auf die Gegenseite auf demselben round_id gewartet wird.",
      "example": "600 — Banker-Wette um 12:00:00; Player-Wette um 12:09:59 passt noch; um 12:10:01 Leg abgelaufen."
    },
    "hedge_betting.time_pair_window_seconds": {
      "label": "Time-Pair-Fenster (Sekunden)",
      "description": "Fallback-Gruppierung wenn round_id fehlt, aber table_id vorhanden — Wetten in diesem Fenster am gleichen Tisch können gepaart werden.",
      "example": "15 — nur wenn require_round_id aus und round_id fehlt."
    },
    "hedge_betting.require_round_id": {
      "label": "round_id erforderlich",
      "description": "Ein: Hedge-Prüfungen nur wenn metadata.game.round_id vorhanden. Empfohlen, sobald Backend round_id sendet.",
      "example": "Ein in Production — vermeidet False Positives vom Time-Pair-Fallback."
    },
    "hedge_betting.opposite_selection_groups": {
      "label": "Gegensätzliche Selection-Gruppen",
      "description": "JSON-Array von Gruppen. Selections im gleichen inneren Array gelten als Gegenseiten in derselben Runde.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.amount_match_tolerance_percent": {
      "label": "Betragsübereinstimmungs-Toleranz (%)",
      "description": "Gegenseitige Legs müssen stakes innerhalb dieses Prozents voneinander haben.",
      "example": "10 — Banker 1.000 € + Player 950 € passt; Player 800 € nicht."
    },
    "hedge_betting.opposite_side_same_round_score": {
      "label": "Score — Gegenseiten gleiche Runde",
      "description": "Risikopunktzahl bei erkanntem einzelnen hedged round (Gegenseiten, passende Beträge).",
      "example": "50 — löst bei erstem erkannten Banker+Player-Paar aus.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.hedged_round_medium": {
      "label": "Hedged Rounds — mittel",
      "description": "Verschiedene hedged rounds im Statistik-Fenster vor Wiederholungsmuster-Signal (mittlere Stufe).",
      "example": "3 — drei separate hedged Hände in einer Stunde.",
      "signal": "repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_high": {
      "label": "Hedged Rounds — hoch",
      "description": "Verschiedene hedged rounds für hohe Stufe.",
      "example": "8",
      "signal": "high_repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_critical": {
      "label": "Hedged Rounds — kritisch",
      "description": "Verschiedene hedged rounds für kritische Stufe.",
      "example": "15",
      "signal": "critical_hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_enabled": {
      "label": "Volume-Washing-Prüfung",
      "description": "Ein: vergleicht hedged Bruttowettvolumen mit gesamtem Bruttowettvolumen im Statistik-Fenster.",
      "example": "Spieler wettet 6.000 € hedged + 4.000 € normal in 1 h → 60 % hedged Anteil.",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.min_gross_volume": {
      "label": "Volume Washing — Min. Brutto",
      "description": "Mindest-Gesamtwettvolumen im Fenster vor Volume-Washing-Verhältnis-Auswertung.",
      "example": "5000 — Verhältnis ignorieren bis Spieler mindestens 5.000 € Bruttowetten im Fenster hat."
    },
    "hedge_betting.min_hedged_gross_ratio": {
      "label": "Volume Washing — Min. hedged Verhältnis",
      "description": "Mindest-verhältnis hedged_gross ÷ total_gross (0–1) für Volume-Washing-Signal.",
      "example": "0.5 — 50 % oder mehr des Bruttovolumens hedged → hedged_bet_volume_washing (Hard Block wenn in Decision).",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_score": {
      "label": "Score — Volume Washing",
      "description": "Risikopunktzahl bei Erreichen des Volume-Washing-Verhältnis-Schwellenwerts.",
      "example": "55 — mit opposite_side-Score kombinieren für höhere Summe."
    },
    "step_up_verification.enabled": {
      "label": "Aktiviert",
      "description": "Aus: step_up_verification metadata ignoriert und challenge-Ergebnisse nicht herabgestuft.",
      "example": "Ein, wenn Frontend Turnstile bei challenge-Antworten anzeigt."
    },
    "step_up_verification.grant_ttl_days": {
      "label": "Grant-Dauer (Tage)",
      "description": "Wie lange ein erfolgreicher Verifizierungs-Grant für dieselbe user_id + device fingerprint gilt.",
      "example": "7 — Spieler besteht Turnstile einmal; folgende Logins 7 Tage auf gleichem Gerät erlaubt."
    },
    "step_up_verification.max_verified_age_minutes": {
      "label": "Max. verified_at-Alter (Minuten)",
      "description": "metadata.verified_at muss innerhalb dieser Minuten vom evaluate-Anfrage-Zeitstempel liegen.",
      "example": "5 — siteverify um 12:00, evaluate um 12:06 → Grant als veraltet abgelehnt."
    },
    "step_up_verification.downgrade_challenge_to_allow": {
      "label": "Challenge zu allow herabstufen",
      "description": "Ein: aktiver Grant ändert challenge-Entscheidung zu allow. Überschreibt nie block oder kritische Signale.",
      "example": "Ein — typische Production-Einstellung nach Turnstile-Bestand."
    },
    "step_up_verification.allowed_hostnames": {
      "label": "Erlaubte Hostnames",
      "description": "Optionale Cloudflare-Hostname-Allowlist aus siteverify-Antwort — einer pro Zeile. Leer = Prüfung überspringen.",
      "example": "casino.example.com\\nwww.casino.example.com"
    },
    "step_up_verification.applicable_event_types": {
      "label": "Anwendbare Event-Typen",
      "description": "Event-Typen, bei denen step-up grant challenge herabstufen kann — einer pro Zeile.",
      "example": "player.login\\nplayer.signup\\npayment.deposit"
    },
    "fingerprint.required_channels": {
      "label": "Erforderliche Kanäle",
      "description": "Kanäle, wo context.fingerprint erwartet wird. Fehlender Wert auf diesen Kanälen löst missing_fingerprint aus.",
      "example": "web,mobile — signup auf web ohne visitorId → missing_fingerprint.",
      "signal": "missing_fingerprint"
    },
    "fingerprint.min_length": {
      "label": "Min. Länge",
      "description": "Minimale gültige FingerprintJS visitorId-Zeichenlänge.",
      "example": "10 — abc123 (6 Zeichen) → malformed_fingerprint.",
      "signal": "malformed_fingerprint"
    },
    "fingerprint.max_length": {
      "label": "Max. Länge",
      "description": "Maximale gültige visitorId-Länge. Werte außerhalb min–max werden abgelehnt.",
      "example": "64",
      "signal": "malformed_fingerprint, invalid_fingerprint"
    },
    "fingerprint.suspicious_values": {
      "label": "Verdächtige Werte",
      "description": "Bekannte gefälschte oder Platzhalter-Fingerprint-Strings — einer pro Zeile. Exakte Übereinstimmung scheitert Validierung.",
      "example": "undefined\\nnull\\n00000000-0000-0000-0000-000000000000",
      "signal": "invalid_fingerprint"
    },
    "lists.disposable_domains": {
      "label": "Wegwerf-E-Mail-Domains",
      "description": "Domains temporärer E-Mail-Anbieter. Signup mit diesen Domains wird meist hard-blocked.",
      "example": "mailinator.com\\n10minutemail.com\\nguerrillamail.com",
      "signal": "disposable_email"
    },
    "lists.high_risk_countries": {
      "label": "Hochrisiko-Länder",
      "description": "ISO-Ländercodes mit erhöhter Betrugsrate. Fügt Score bei Geo/IP-Prüfungen hinzu — kein automatischer Block.",
      "example": "NG\\nGH\\nPK",
      "signal": "high_risk_country"
    },
    "lists.sanctioned_countries": {
      "label": "Sanktionierte Länder",
      "description": "ISO-Codes für sanktionierte oder spielverbotene Jurisdiktionen. Verwendet wenn AML-Blocklist Lists-Tab einschließt.",
      "example": "IR\\nKP\\nCU",
      "signal": "sanctioned_country"
    },
    "lists.generic_names": {
      "label": "Generische Namen",
      "description": "Platzhalter-Anzeigenamen bei signup/Identität — einer pro Zeile, ohne Groß-/Kleinschreibung.",
      "example": "test\\nuser\\nadmin\\nPlayer",
      "signal": "generic_name"
    },
    "lists.role_based_email_locals": {
      "label": "Rollenbasierte E-Mail-Locals",
      "description": "E-Mail-Lokalteile (vor @), die nicht-persönliche Konten anzeigen.",
      "example": "admin\\nsupport\\ninfo\\nnoreply",
      "signal": "role_based_email"
    },
    "lists.suspicious_email_tlds": {
      "label": "Verdächtige E-Mail-TLDs",
      "description": "Top-Level-Domains mit Spam-Assoziation. Treffer wenn E-Mail mit diesen TLDs endet.",
      "example": ".xyz\\n.top\\n.click",
      "signal": "suspicious_email_tld"
    },
    "lists.suspicious_email_local_tokens": {
      "label": "Verdächtige E-Mail-Local-Tokens",
      "description": "Teilstrings im E-Mail-Lokalteil, die Wegwerf- oder Bot-Konten nahelegen.",
      "example": "temp\\nspam\\nbot\\nfake",
      "signal": "suspicious_email_pattern"
    },
    "lists.bot_user_agent_tokens": {
      "label": "Bot User-Agent-Tokens",
      "description": "Teilstrings in User-Agent-Header, die Skripte oder Automatisierung anzeigen.",
      "example": "curl\\npython-requests\\nheadless\\nscrapy",
      "signal": "bot_user_agent"
    },
    "lists.emulator_ua_tokens": {
      "label": "Emulator UA-Tokens",
      "description": "User-Agent-Muster für Android-Emulatoren oder virtuelle Geräte.",
      "example": "genymotion\\nbluestacks\\nsdk_gphone",
      "signal": "emulator_detected"
    },
    "lists.suspicious_referrers": {
      "label": "Verdächtige Referrer",
      "description": "Exakte Referrer-Werte mit geringem Vertrauen bei signup.",
      "example": "direct\\nunknown\\n(leere Zeile für blank Referrer)",
      "signal": "suspicious_referrer"
    },
    "lists.bonus_abuse_referrer_tokens": {
      "label": "Bonus-Missbrauch-Referrer-Tokens",
      "description": "Teilstrings in signup-Referrer-URL, verknüpft mit Bonus-Jagd oder Affiliate-Missbrauch.",
      "example": "free-spins\\nno-deposit\\nbonus-hunter",
      "signal": "bonus_abuse_referrer"
    },
    "velocity_thresholds": {
      "label": "Velocity-Schwellenwerte (JSON)",
      "description": "Karte Schwellenwertname → Max.-Anzahl. Suffix _medium/_high/_critical wählt Stufe. Schlüssel nicht löschen — Engines erwarten vollständigen Satz.",
      "example": "{\\n  \"login_ip_medium\": 5,\\n  \"login_ip_high\": 15,\\n  \"login_ip_critical\": 30,\\n  \"signup_ip_critical\": 10,\\n  \"deposit_user_high\": 6\\n}",
      "signal": "medium_login_ip_velocity, bulk_login_attack, bulk_signup_attack, rapid_deposit_activity, …"
    },
    "critical_signals": {
      "label": "Hard-Block-Signale",
      "description": "Exakte Signalnamen-Strings von Engines — einer pro Zeile. Groß-/Kleinschreibung muss exakt stimmen.",
      "example": "disposable_email\\nbulk_login_attack\\nhedged_bet_volume_washing\\nmulti_account_shared_withdrawal_method"
    },
    "features.sync_publish_audit": {
      "label": "Audit bei sync /evaluate veröffentlichen",
      "description": "Ein: synchrone POST /evaluate-Ergebnisse werden auch an RabbitMQ für Orchestrator-Audit veröffentlicht.",
      "example": "Ein, wenn Orchestrator sync API-Entscheidungen in derselben Pipeline wie async Events sehen muss."
    },
    "features.decision_cache_ttl_seconds": {
      "label": "Entscheidungs-Cache-TTL (Sekunden)",
      "description": "Cacht identische event_id-Entscheidungen in Redis, um Doppel-Scoring zu vermeiden. Erfordert aktiviertes Redis.",
      "example": "300 — gleiche event_id innerhalb 5 Minuten liefert gecachte Entscheidung; 0 = deaktiviert."
    },
    "features.redis_enabled": {
      "label": "Redis aktiviert",
      "description": "Nutzt Redis für Velocity-Zähler, Hedge/Betting-Stores und optionalen Entscheidungs-Cache.",
      "example": "Aus für Einzelinstanz-Dev (Speicher-Zähler); ein für Production Multi-Instance."
    },
    "features.redis_velocity_ip_ttl": {
      "label": "Redis IP-Velocity-TTL",
      "description": "Sliding-Window-Länge (Sekunden) für IP-basierte Velocity-Keys in Redis.",
      "example": "3600 — login_ip_high zählt Logins von einer IP in der letzten Stunde."
    },
    "features.redis_velocity_domain_ttl": {
      "label": "Redis Domain-Velocity-TTL",
      "description": "Sliding-Window-Länge für E-Mail-Domain-Signup-Velocity-Zähler.",
      "example": "86400 — signup_domain_* zählt Signups pro Domain in 24 h."
    },
    "features.rabbitmq_enabled": {
      "label": "RabbitMQ Consumer aktiviert",
      "description": "Startet async Consumer, der Events vom Casino-Plattform-Exchange/Queue scored.",
      "example": "Ein, wenn Plattform wallet.bet, player.login usw. auf casino.events veröffentlicht."
    },
    "features.rabbitmq_publish_results": {
      "label": "Ergebnisse an Orchestrator veröffentlichen",
      "description": "Veröffentlicht gescorte EvaluateResponse-Nachrichten in Results-Queue nach async Scoring.",
      "example": "Ein, wenn Orchestrator risk.results für Audit/Aktionen abonniert."
    },
    "features.rabbitmq_events_exchange": {
      "label": "Events Exchange",
      "description": "Topic Exchange, an den die Casino-Plattform veröffentlicht. Leer = Legacy Direct-Queue-Modus.",
      "example": "casino.events"
    },
    "features.rabbitmq_events_exchange_type": {
      "label": "Exchange-Typ",
      "description": "RabbitMQ Exchange-Typ, den AFS Consumer deklariert/bindet.",
      "example": "topic"
    },
    "features.rabbitmq_events_queue": {
      "label": "Events Queue",
      "description": "Queue, aus der AFS nach Bindung an Plattform-Exchange konsumiert.",
      "example": "casino.afs"
    },
    "features.rabbitmq_events_binding_key": {
      "label": "Binding Key",
      "description": "Routing-Key-Muster für Queue-Bindung. # = alle Nachrichten auf Exchange.",
      "example": "# — alle Events; player.* — nur player Routing Keys."
    },
    "features.rabbitmq_prefetch": {
      "label": "Prefetch Count",
      "description": "Max. unbestätigte Nachrichten pro Consumer-Kanal.",
      "example": "10 — konservativ; 50 — höherer Durchsatz, mehr Speicher."
    },
    "features.rabbitmq_results_queue": {
      "label": "Results Queue",
      "description": "Ausgehende Queue für gescorte async Ergebnisse.",
      "example": "risk.results"
    },
    "logging.sync_enabled": {
      "label": "Sync Request/Response Logging",
      "description": "Speichert vollständige Request- und Response-Payloads für POST /evaluate in Postgres. Siehe Log viewer unten.",
      "example": "Bei Integrationstests aktivieren; bei High-Volume-Production deaktivieren, wenn Speicher bedenklich."
    },
    "logging.async_enabled": {
      "label": "Async Request/Response Logging",
      "description": "Speichert RabbitMQ gescorte/übersprungene/abgelehnte/fehlgeschlagene Nachrichten mit Payloads wo verfügbar.",
      "example": "Aktivieren zum Debuggen der Pipeline casino.events → AFS ohne Container-Logs."
    }
  },
  "pt": {
    "decision_thresholds.challenge": {
      "label": "Limite challenge",
      "description": "Pontuação mínima para risco médio. O resultado costuma ser challenge (Turnstile, MFA, revisão manual) em vez de allow.",
      "example": "40 — jogador com pontuação 39 recebe allow; pontuação 40+ é challenge, salvo se um signal de bloqueio rígido tiver disparado."
    },
    "decision_thresholds.high": {
      "label": "Limite alto",
      "description": "Pontuação mínima para risco alto. Login/signup costumam bloquear; depósitos/saques/apostas podem bloquear ou exigir verificações extras.",
      "example": "61 — pontuação 60 permanece médio/challenge; pontuação 61+ é risco alto."
    },
    "decision_thresholds.block": {
      "label": "Limite block (crítico)",
      "description": "Pontuação mínima para risco crítico. Geralmente resulta em block, salvo se um signal na aba Decision já tiver forçado block.",
      "example": "85 — pontuação 84 pode ainda ser alta; pontuação 85+ é crítico/block."
    },
    "operator.platform_name": {
      "label": "Nome da plataforma",
      "description": "Rótulo interno desta instância de operador. Usado em logs e entradas de auditoria — não enviado aos jogadores.",
      "example": "DoveBet EU",
      "signal": "unlicensed_jurisdiction (quando o país não está nos mercados licenciados)"
    },
    "operator.licensed_markets": {
      "label": "Mercados licenciados",
      "description": "Códigos de país ISO 3166-1 alpha-2 onde possui licença de jogo. Verificados em signup, deposit e bet usando país do jogador ou geo IP.",
      "example": "DE,GB,MT,SE — jogador de FR sem licença dispara unlicensed_jurisdiction.",
      "signal": "unlicensed_jurisdiction"
    },
    "ip_intel.enabled": {
      "label": "Ativado",
      "description": "Interruptor principal. Desligado: nenhuma consulta IP externa e nenhum signal vpn/proxy/tor/hosting emitido.",
      "example": "Desligado em dev local se não quiser chamadas API de saída.",
      "signal": "vpn_detected, proxy_detected, tor_exit_node, hosting_provider_ip"
    },
    "ip_intel.cache_ttl_seconds": {
      "label": "TTL de cache (segundos)",
      "description": "Tempo que cada resultado de consulta IP fica em cache no Redis ou memória antes de nova busca.",
      "example": "3600 — mesmo IP verificado uma vez por hora; mudanças de VPN podem atrasar até 1 hora."
    },
    "ip_intel.timeout_seconds": {
      "label": "Timeout de consulta (segundos)",
      "description": "Espera máxima por requisição à API IP externa. Afeta latência do evaluate em cache miss.",
      "example": "2.0 — fail ou fail-open rápido; 5.0 — mais tempo para APIs lentas."
    },
    "ip_intel.fail_open": {
      "label": "Fail open em erro de consulta",
      "description": "Ligado: timeout/erro de API não adiciona risco. Desligado: falha de consulta tratada como suspeita (VPN/proxy presumido).",
      "example": "Ligado em produção se indisponibilidade da API IP não deve bloquear logins; desligado para comportamento estrito."
    },
    "aml.single_deposit_threshold": {
      "label": "Revisão de depósito único",
      "description": "Um payment.deposit igual ou acima deste valor dispara compliance review tier 1.",
      "example": "2000 — depósito de €2.000 dispara elevated_deposit_aml_review.",
      "signal": "elevated_deposit_aml_review"
    },
    "aml.large_deposit_threshold": {
      "label": "Revisão de depósito grande",
      "description": "Tier AML de depósito mais alto — para depósitos únicos muito grandes.",
      "example": "10000 — depósito de €10.000 dispara large_deposit_aml_review.",
      "signal": "large_deposit_aml_review"
    },
    "aml.withdrawal_review_threshold": {
      "label": "Revisão de saque",
      "description": "Um payment.withdraw igual ou acima deste valor dispara signals de revisão de cashout.",
      "example": "1000 — saque de €1.000 dispara elevated_withdrawal_review e cashout_review_required.",
      "signal": "elevated_withdrawal_review, cashout_review_required"
    },
    "aml.structuring_threshold": {
      "label": "Limite de structuring",
      "description": "Sinaliza depósitos entre 90% e 100% deste valor — padrão para ficar logo abaixo dos limites de reporte.",
      "example": "3000 — depósito de €2.850 (95% de 3000) dispara structuring_threshold_deposit.",
      "signal": "structuring_threshold_deposit"
    },
    "aml.micro_deposit_max": {
      "label": "Micro depósito máx.",
      "description": "Depósitos estritamente abaixo deste valor disparam detecção de bonus-farming / teste de pagamento.",
      "example": "10 — depósito de €5 dispara micro_deposit_bonus_farming.",
      "signal": "micro_deposit_bonus_farming"
    },
    "aml.high_stake_bet_threshold": {
      "label": "Aposta de alto valor",
      "description": "Um wallet.bet / game.bet igual ou acima deste valor. Apostas acima de €100 (regra fixa do engine) também disparam elevated_stake_bet.",
      "example": "500 — aposta de €500 dispara high_stake_bet.",
      "signal": "high_stake_bet, elevated_stake_bet"
    },
    "aml.blocklist.enabled": {
      "label": "Screening de blocklist ativado",
      "description": "Interruptor principal para todos os engines de blocklist AML (crypto, banco, país, etc.).",
      "example": "Desligado apenas se executar verificações de blocklist totalmente fora do AFS."
    },
    "aml.blocklist.crypto_enabled": {
      "label": "Screening de carteira crypto",
      "description": "Verifica endereços crypto de pagamento em payment.withdraw / payment.deposit contra sync OFAC + lista manual.",
      "example": "Envie payment_method_type: crypto e payment_method_key: 0xabc… no evaluate de saque.",
      "signal": "ofac_sanctioned_wallet, blocklisted_payout_address"
    },
    "aml.blocklist.bank_enabled": {
      "label": "Screening de conta bancária",
      "description": "Verifica IBAN/IDs de conta bancária em pagamentos bancários.",
      "example": "payment_method_type: bank, payment_method_key: DE89370400440532013000",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.ewallet_enabled": {
      "label": "Screening de e-wallet",
      "description": "Verifica IDs ou e-mails de e-wallet em pagamentos e-wallet.",
      "example": "payment_method_type: ewallet, payment_method_key: skrill_user@email.com",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.card_enabled": {
      "label": "Screening de pagamento com cartão",
      "description": "Verifica tokens de cartão ou referências de pagamento em saques com cartão.",
      "example": "payment_method_type: card, payment_method_key: card_token_abc123",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.country_enabled": {
      "label": "Screening de blocklist por país",
      "description": "Bloqueia signup/login/deposit/withdraw quando país do jogador coincide com sync OFAC, aba Lists ou países manuais.",
      "example": "País do jogador KP com blocklist de país ativada → blocklisted_country.",
      "signal": "blocklisted_country"
    },
    "aml.blocklist.sync_ofac_crypto_enabled": {
      "label": "Auto-sync de carteiras crypto OFAC",
      "description": "Obtém diariamente endereços crypto SDN do Tesouro dos EUA. Requer HTTPS de saída do container Risk.",
      "example": "Use o botão Sync OFAC lists now abaixo após ativar."
    },
    "aml.blocklist.sync_ofac_countries_enabled": {
      "label": "Auto-sync de países OFAC",
      "description": "Carrega códigos ISO de países sancionados derivados do Tesouro no Postgres a cada sync.",
      "example": "Executa no agendamento (intervalo de sync) e em sync manual."
    },
    "aml.blocklist.sync_interval_hours": {
      "label": "Intervalo de sync (horas)",
      "description": "Com que frequência o job em background atualiza listas crypto e de países OFAC.",
      "example": "24 — sync uma vez por dia; 6 para atualizações mais frequentes."
    },
    "aml.blocklist.fail_open": {
      "label": "Fail open se sync indisponível",
      "description": "Ligado: BD de blocklist vazia/desatualizada não bloqueia pagamentos. Desligado: dados de sync ausentes = alto risco.",
      "example": "Ligado para resiliência em produção; desligado para máxima conformidade estrita."
    },
    "aml.blocklist.use_lists_sanctioned_countries": {
      "label": "Incluir países sancionados da aba Lists",
      "description": "Mescla Lists → sanctioned countries nas verificações de blocklist por país (além de sync OFAC e manual).",
      "example": "Adicione IR na aba Lists + ative → jogadores iranianos disparam sanctioned_country.",
      "signal": "sanctioned_country"
    },
    "aml.blocklist.crypto_hit_score": {
      "label": "Pontuação de hit na blocklist de pagamento",
      "description": "Pontuação de risco quando qualquer destino de pagamento (crypto/banco/e-wallet/cartão) coincide com entrada da blocklist.",
      "example": "90 — geralmente empurra decisão para block combinado com outros signals."
    },
    "aml.blocklist.country_hit_score": {
      "label": "Pontuação de hit na blocklist por país",
      "description": "Pontuação de risco quando país do jogador coincide com blocklist.",
      "example": "90 — padrão; reduza para 70 se preferir challenge em vez de block."
    },
    "aml.blocklist.manual_crypto_wallets": {
      "label": "Carteiras crypto manuais",
      "description": "Endereços de carteira extras para bloquear — um por linha. Verificados em pagamentos crypto além do sync OFAC.",
      "example": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    "aml.blocklist.manual_bank_accounts": {
      "label": "Contas bancárias manuais",
      "description": "IBAN ou identificadores de conta bancária para bloquear — um por linha.",
      "example": "DE89370400440532013000\\nGB82WEST12345698765432"
    },
    "aml.blocklist.manual_ewallet_accounts": {
      "label": "Contas e-wallet manuais",
      "description": "IDs ou e-mails de e-wallet para bloquear — um por linha.",
      "example": "skrill:fraud_ring_01\\nneteller:abuse@test.com"
    },
    "aml.blocklist.manual_card_accounts": {
      "label": "Pagamentos com cartão manuais",
      "description": "Tokens de cartão ou referências de pagamento para bloquear — um por linha.",
      "example": "card_token_stolen_batch_42\\nvisa_payout_ref_99102"
    },
    "aml.blocklist.manual_countries": {
      "label": "Países na blocklist manual",
      "description": "Códigos ISO 3166-1 alpha-2 para bloquear — um por linha. Mesclados com sync OFAC e aba Lists.",
      "example": "IR\\nKP\\nSY",
      "signal": "blocklisted_country"
    },
    "withdrawal_method.enabled": {
      "label": "Ativado",
      "description": "Desligado: verificações compartilhadas de destino de pagamento são ignoradas.",
      "example": "Requer payment_method_type + payment_method_key em cada evaluate de payment.withdraw.",
      "signal": "shared_withdrawal_method, multiple_accounts_shared_payout_method, multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_medium": {
      "label": "Usuários distintos (médio)",
      "description": "Quantos user_ids distintos devem sacar para a mesma payout key antes do tier médio disparar.",
      "example": "2 — usuário A e B sacam para IBAN DE89… → shared_withdrawal_method.",
      "signal": "shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_high": {
      "label": "Usuários distintos (alto)",
      "description": "Limite de usuários distintos para abuso de pagamento multi-conta tier alto.",
      "example": "3 — três contas compartilhando um e-mail Skrill.",
      "signal": "multiple_accounts_shared_payout_method"
    },
    "withdrawal_method.distinct_users_critical": {
      "label": "Usuários distintos (crítico)",
      "description": "Limite de usuários distintos para tier crítico — geralmente força block via aba Decision.",
      "example": "4 — quatro contas, mesma carteira crypto → multi_account_shared_withdrawal_method (bloqueio rígido).",
      "signal": "multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.medium_score": {
      "label": "Pontuação média",
      "description": "Pontuação de risco quando limite médio de usuários distintos é atingido.",
      "example": "35 — combinada com outros engines para atingir challenge/high."
    },
    "withdrawal_method.high_score": {
      "label": "Pontuação alta",
      "description": "Pontuação de risco quando limite alto de usuários distintos é atingido.",
      "example": "55"
    },
    "withdrawal_method.critical_score": {
      "label": "Pontuação crítica",
      "description": "Pontuação de risco quando limite crítico de usuários distintos é atingido.",
      "example": "80 — muitas vezes suficiente sozinha para block se limite de decisão for ≤80."
    },
    "betting_patterns.enabled": {
      "label": "Ativado",
      "description": "Interruptor principal para contadores de burst sequencial e verificações de taxa de vitória.",
      "example": "Desligado desativa todos os signals desta aba."
    },
    "betting_patterns.burst_window_seconds": {
      "label": "Janela de burst (segundos)",
      "description": "Janela temporal móvel para todos os contadores de burst e cálculo de taxa de vitória.",
      "example": "300 — 10 game.bets em 5 minutos contam para burst; janela desliza a cada evento."
    },
    "betting_patterns.game_bet_burst_medium": {
      "label": "Burst game.bet — médio",
      "description": "Eventos game.bet sequenciais na janela antes do signal de burst médio.",
      "example": "10 — 10 giros de bônus colocados em sequência em 300 s.",
      "signal": "sequential_game_bet_burst"
    },
    "betting_patterns.game_bet_burst_high": {
      "label": "Burst game.bet — alto",
      "description": "Contagem sequencial de game.bet para burst tier alto.",
      "example": "20",
      "signal": "sequential_game_bet_burst (higher score tier)"
    },
    "betting_patterns.game_bet_burst_critical": {
      "label": "Burst game.bet — crítico",
      "description": "Contagem sequencial de game.bet para burst tier crítico.",
      "example": "35",
      "signal": "sequential_game_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_bet_burst_medium": {
      "label": "Burst wallet.bet — médio",
      "description": "Eventos wallet.bet (dinheiro real) sequenciais na janela antes de burst médio.",
      "example": "20 — padrão de bot de apostas rápidas em live-casino.",
      "signal": "sequential_wallet_bet_burst"
    },
    "betting_patterns.wallet_bet_burst_high": {
      "label": "Burst wallet.bet — alto",
      "description": "Contagem sequencial de wallet.bet para tier alto.",
      "example": "40",
      "signal": "sequential_wallet_bet_burst (higher score tier)"
    },
    "betting_patterns.wallet_bet_burst_critical": {
      "label": "Burst wallet.bet — crítico",
      "description": "Contagem sequencial de wallet.bet para tier crítico.",
      "example": "60",
      "signal": "sequential_wallet_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_win_burst_medium": {
      "label": "Burst wallet.win — médio",
      "description": "Créditos wallet.win sequenciais na janela antes de burst de vitórias médio.",
      "example": "8 — muitas vitórias creditadas em rápida sucessão.",
      "signal": "sequential_wallet_win_burst"
    },
    "betting_patterns.wallet_win_burst_high": {
      "label": "Burst wallet.win — alto",
      "description": "Contagem sequencial de wallet.win para tier alto.",
      "example": "15",
      "signal": "sequential_wallet_win_burst (higher score tier)"
    },
    "betting_patterns.wallet_win_burst_critical": {
      "label": "Burst wallet.win — crítico",
      "description": "Contagem sequencial de wallet.win para tier crítico.",
      "example": "25",
      "signal": "sequential_wallet_win_burst (critical score tier)"
    },
    "betting_patterns.win_rate_min_bets": {
      "label": "Taxa de vitória — apostas mín.",
      "description": "Contagem mínima de wallet.bet + game.bet na janela antes de avaliar taxa de vitória.",
      "example": "5 — precisa de pelo menos 5 apostas; 4 vitórias / 4 apostas ignoradas até a 5ª aposta."
    },
    "betting_patterns.win_rate_high_ratio": {
      "label": "Taxa de vitória — ratio alto",
      "description": "Ratio vitórias ÷ apostas que dispara signal de taxa de vitória alta (0–1).",
      "example": "0.75 — 6 vitórias de 8 apostas (75%) na janela dispara high_win_rate_in_betting_sequence.",
      "signal": "high_win_rate_in_betting_sequence"
    },
    "betting_patterns.win_rate_critical_ratio": {
      "label": "Taxa de vitória — ratio crítico",
      "description": "Ratio vitórias ÷ apostas para tier crítico de taxa de vitória.",
      "example": "0.90 — 9 vitórias de 10 apostas dispara critical_win_rate_in_betting_sequence.",
      "signal": "critical_win_rate_in_betting_sequence"
    },
    "hedge_betting.enabled": {
      "label": "Ativado",
      "description": "Interruptor principal para detecção de rounds hedgeados e ratio de volume-washing.",
      "example": "Desligado se ainda não envia metadata.game.selection e round_id."
    },
    "hedge_betting.window_seconds": {
      "label": "Janela de estatísticas (segundos)",
      "description": "Janela móvel para contar rounds hedgeados repetidos e ratio de volume bruto.",
      "example": "3600 — contar rounds hedgeados na última hora por usuário."
    },
    "hedge_betting.round_leg_ttl_seconds": {
      "label": "TTL de perna de round (segundos)",
      "description": "Tempo que a primeira perna de aposta fica armazenada aguardando o lado oposto no mesmo round_id.",
      "example": "600 — aposta banker às 12:00:00; aposta player às 12:09:59 ainda combina; às 12:10:01 a perna expira."
    },
    "hedge_betting.time_pair_window_seconds": {
      "label": "Janela time-pair (segundos)",
      "description": "Agrupamento fallback quando round_id ausente mas table_id presente — apostas nesta janela na mesma mesa podem parear.",
      "example": "15 — usado apenas se require_round_id desligado e round_id ausente."
    },
    "hedge_betting.require_round_id": {
      "label": "Exigir round_id",
      "description": "Ligado: verificações hedge só se metadata.game.round_id presente. Recomendado quando backend envia round_id.",
      "example": "Ligado em produção — evita falsos positivos do fallback time-pair."
    },
    "hedge_betting.opposite_selection_groups": {
      "label": "Grupos de selection oposta",
      "description": "Array JSON de grupos. Selections no mesmo array interno são tratadas como opostas no mesmo round.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.amount_match_tolerance_percent": {
      "label": "Tolerância de correspondência de valor (%)",
      "description": "Pernas opostas devem ter stakes dentro desta porcentagem uma da outra.",
      "example": "10 — banker €1000 + player €950 combina; player €800 não."
    },
    "hedge_betting.opposite_side_same_round_score": {
      "label": "Pontuação — lados opostos mesmo round",
      "description": "Pontuação de risco quando um round hedgeado (lados opostos, valores correspondentes) é detectado.",
      "example": "50 — dispara no primeiro par banker+player detectado.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.hedged_round_medium": {
      "label": "Rounds hedgeados — médio",
      "description": "Rounds hedgeados distintos na janela de estatísticas antes do signal de padrão repetido (tier médio).",
      "example": "3 — três mãos hedgeadas separadas em uma hora.",
      "signal": "repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_high": {
      "label": "Rounds hedgeados — alto",
      "description": "Rounds hedgeados distintos para tier alto.",
      "example": "8",
      "signal": "high_repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_critical": {
      "label": "Rounds hedgeados — crítico",
      "description": "Rounds hedgeados distintos para tier crítico.",
      "example": "15",
      "signal": "critical_hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_enabled": {
      "label": "Verificação de volume washing",
      "description": "Ligado: compara volume bruto de apostas hedgeadas com volume bruto total na janela de estatísticas.",
      "example": "Jogador aposta €6000 hedgeadas + €4000 normais em 1 h → 60% de participação hedgeada.",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.min_gross_volume": {
      "label": "Volume washing — bruto mín.",
      "description": "Volume total mínimo de apostas na janela antes de avaliar ratio de volume-washing.",
      "example": "5000 — ignorar ratio até jogador ter pelo menos €5000 de apostas brutas na janela."
    },
    "hedge_betting.min_hedged_gross_ratio": {
      "label": "Volume washing — ratio hedgeado mín.",
      "description": "Ratio mínimo hedged_gross ÷ total_gross (0–1) para disparar signal de volume washing.",
      "example": "0.5 — 50% ou mais do volume bruto hedgeado → hedged_bet_volume_washing (bloqueio rígido se em Decision).",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_score": {
      "label": "Pontuação — volume washing",
      "description": "Pontuação de risco quando limite de ratio de volume-washing é atingido.",
      "example": "55 — combinar com pontuação opposite_side para total mais alto."
    },
    "step_up_verification.enabled": {
      "label": "Ativado",
      "description": "Desligado: metadata step_up_verification ignorada e resultados challenge não rebaixados.",
      "example": "Ligado quando frontend exibe Turnstile em respostas challenge."
    },
    "step_up_verification.grant_ttl_days": {
      "label": "Duração do grant (dias)",
      "description": "Quanto tempo dura um grant de verificação bem-sucedido para o mesmo user_id + device fingerprint.",
      "example": "7 — jogador passa Turnstile uma vez; logins subsequentes permitidos por 7 dias no mesmo dispositivo."
    },
    "step_up_verification.max_verified_age_minutes": {
      "label": "Idade máx. de verified_at (minutos)",
      "description": "metadata.verified_at deve estar dentro destes minutos do timestamp da requisição evaluate.",
      "example": "5 — siteverify às 12:00, evaluate às 12:06 → grant rejeitado como obsoleto."
    },
    "step_up_verification.downgrade_challenge_to_allow": {
      "label": "Rebaixar challenge para allow",
      "description": "Ligado: grant ativo muda decisão challenge para allow. Nunca sobrescreve block ou signals críticos.",
      "example": "Ligado — configuração típica de produção após passar Turnstile."
    },
    "step_up_verification.allowed_hostnames": {
      "label": "Hostnames permitidos",
      "description": "Allowlist opcional de hostname Cloudflare da resposta siteverify — um por linha. Vazio = pular verificação.",
      "example": "casino.example.com\\nwww.casino.example.com"
    },
    "step_up_verification.applicable_event_types": {
      "label": "Tipos de evento aplicáveis",
      "description": "Tipos de evento onde grant step-up pode rebaixar challenge — um por linha.",
      "example": "player.login\\nplayer.signup\\npayment.deposit"
    },
    "fingerprint.required_channels": {
      "label": "Canais obrigatórios",
      "description": "Canais onde context.fingerprint é esperado. Valor ausente nestes canais dispara missing_fingerprint.",
      "example": "web,mobile — signup na web sem visitorId → missing_fingerprint.",
      "signal": "missing_fingerprint"
    },
    "fingerprint.min_length": {
      "label": "Comprimento mín.",
      "description": "Comprimento mínimo válido em caracteres do visitorId FingerprintJS.",
      "example": "10 — abc123 (6 caracteres) → malformed_fingerprint.",
      "signal": "malformed_fingerprint"
    },
    "fingerprint.max_length": {
      "label": "Comprimento máx.",
      "description": "Comprimento máximo válido do visitorId. Valores fora de min–max são rejeitados.",
      "example": "64",
      "signal": "malformed_fingerprint, invalid_fingerprint"
    },
    "fingerprint.suspicious_values": {
      "label": "Valores suspeitos",
      "description": "Strings de fingerprint falsas ou placeholder conhecidas — uma por linha. Correspondência exata falha na validação.",
      "example": "undefined\\nnull\\n00000000-0000-0000-0000-000000000000",
      "signal": "invalid_fingerprint"
    },
    "lists.disposable_domains": {
      "label": "Domínios de e-mail descartável",
      "description": "Domínios de provedores de e-mail temporário. Signup com estes domínios costuma ser hard-blocked.",
      "example": "mailinator.com\\n10minutemail.com\\nguerrillamail.com",
      "signal": "disposable_email"
    },
    "lists.high_risk_countries": {
      "label": "Países de alto risco",
      "description": "Códigos de país ISO com taxas elevadas de fraude. Adiciona pontuação em verificações geo/IP — não bloqueio automático.",
      "example": "NG\\nGH\\nPK",
      "signal": "high_risk_country"
    },
    "lists.sanctioned_countries": {
      "label": "Países sancionados",
      "description": "Códigos ISO de jurisdições sancionadas ou com jogo proibido. Usados quando blocklist AML inclui aba Lists.",
      "example": "IR\\nKP\\nCU",
      "signal": "sanctioned_country"
    },
    "lists.generic_names": {
      "label": "Nomes genéricos",
      "description": "Nomes de exibição placeholder em signup/identidade — um por linha, sem distinção de maiúsculas.",
      "example": "test\\nuser\\nadmin\\nPlayer",
      "signal": "generic_name"
    },
    "lists.role_based_email_locals": {
      "label": "Partes locais de e-mail por função",
      "description": "Partes locais de e-mail (antes de @) que indicam contas não pessoais.",
      "example": "admin\\nsupport\\ninfo\\nnoreply",
      "signal": "role_based_email"
    },
    "lists.suspicious_email_tlds": {
      "label": "TLDs de e-mail suspeitos",
      "description": "Domínios de topo associados a spam. Correspondem quando e-mail termina com estes TLDs.",
      "example": ".xyz\\n.top\\n.click",
      "signal": "suspicious_email_tld"
    },
    "lists.suspicious_email_local_tokens": {
      "label": "Tokens locais de e-mail suspeitos",
      "description": "Substrings na parte local do e-mail que sugerem contas descartáveis ou de bot.",
      "example": "temp\\nspam\\nbot\\nfake",
      "signal": "suspicious_email_pattern"
    },
    "lists.bot_user_agent_tokens": {
      "label": "Tokens User-Agent de bot",
      "description": "Substrings no header User-Agent indicando scripts ou automação.",
      "example": "curl\\npython-requests\\nheadless\\nscrapy",
      "signal": "bot_user_agent"
    },
    "lists.emulator_ua_tokens": {
      "label": "Tokens UA de emulador",
      "description": "Padrões User-Agent de emuladores Android ou dispositivos virtuais.",
      "example": "genymotion\\nbluestacks\\nsdk_gphone",
      "signal": "emulator_detected"
    },
    "lists.suspicious_referrers": {
      "label": "Referrers suspeitos",
      "description": "Valores exatos de referrer tratados como baixa confiança no signup.",
      "example": "direct\\nunknown\\n(linha vazia para referrer em branco)",
      "signal": "suspicious_referrer"
    },
    "lists.bonus_abuse_referrer_tokens": {
      "label": "Tokens de referrer de abuso de bônus",
      "description": "Substrings na URL de referrer de signup ligadas a caça de bônus ou abuso de afiliados.",
      "example": "free-spins\\nno-deposit\\nbonus-hunter",
      "signal": "bonus_abuse_referrer"
    },
    "velocity_thresholds": {
      "label": "Limites de velocity (JSON)",
      "description": "Mapa nome do limite → contagem máx. Sufixo _medium/_high/_critical seleciona tier. Não exclua chaves — engines esperam o conjunto completo.",
      "example": "{\\n  \"login_ip_medium\": 5,\\n  \"login_ip_high\": 15,\\n  \"login_ip_critical\": 30,\\n  \"signup_ip_critical\": 10,\\n  \"deposit_user_high\": 6\\n}",
      "signal": "medium_login_ip_velocity, bulk_login_attack, bulk_signup_attack, rapid_deposit_activity, …"
    },
    "critical_signals": {
      "label": "Signals de bloqueio rígido",
      "description": "Strings exatas de nomes de signal emitidos pelos engines — uma por linha. Maiúsculas/minúsculas devem coincidir exatamente.",
      "example": "disposable_email\\nbulk_login_attack\\nhedged_bet_volume_washing\\nmulti_account_shared_withdrawal_method"
    },
    "features.sync_publish_audit": {
      "label": "Publicar auditoria em sync /evaluate",
      "description": "Ligado: resultados síncronos POST /evaluate também publicados no RabbitMQ para auditoria do Orchestrator.",
      "example": "Ligado quando Orchestrator deve ver decisões de API sync no mesmo pipeline que eventos async."
    },
    "features.decision_cache_ttl_seconds": {
      "label": "TTL de cache de decisão (segundos)",
      "description": "Armazena em cache decisões idênticas de event_id no Redis para evitar re-pontuação de duplicatas. Requer Redis ativado.",
      "example": "300 — mesmo event_id em 5 minutos retorna decisão em cache; 0 = desativado."
    },
    "features.redis_enabled": {
      "label": "Redis ativado",
      "description": "Usa Redis para contadores de velocity, stores hedge/betting e cache de decisão opcional.",
      "example": "Desligado para dev de instância única (contadores em memória); ligado para produção multi-instância."
    },
    "features.redis_velocity_ip_ttl": {
      "label": "TTL de velocity IP no Redis",
      "description": "Comprimento da janela deslizante (segundos) para chaves de velocity IP no Redis.",
      "example": "3600 — login_ip_high conta logins de um IP na última hora."
    },
    "features.redis_velocity_domain_ttl": {
      "label": "TTL de velocity de domínio no Redis",
      "description": "Comprimento da janela deslizante para contadores de velocity de signup por domínio de e-mail.",
      "example": "86400 — signup_domain_* conta signups por domínio em 24 h."
    },
    "features.rabbitmq_enabled": {
      "label": "Consumer RabbitMQ ativado",
      "description": "Inicia consumer async que pontua eventos do exchange/fila da plataforma de casino.",
      "example": "Ligado quando plataforma publica wallet.bet, player.login, etc. em casino.events."
    },
    "features.rabbitmq_publish_results": {
      "label": "Publicar resultados no Orchestrator",
      "description": "Publica mensagens EvaluateResponse pontuadas na fila de resultados após scoring async.",
      "example": "Ligado quando Orchestrator assina risk.results para auditoria/ações."
    },
    "features.rabbitmq_events_exchange": {
      "label": "Exchange de eventos",
      "description": "Topic exchange onde a plataforma de casino publica. Vazio = modo de fila direta legado.",
      "example": "casino.events"
    },
    "features.rabbitmq_events_exchange_type": {
      "label": "Tipo de exchange",
      "description": "Tipo de exchange RabbitMQ declarado/vinculado pelo consumer AFS.",
      "example": "topic"
    },
    "features.rabbitmq_events_queue": {
      "label": "Fila de eventos",
      "description": "Fila consumida pelo AFS após vinculação ao exchange da plataforma.",
      "example": "casino.afs"
    },
    "features.rabbitmq_events_binding_key": {
      "label": "Binding key",
      "description": "Padrão de routing key para vinculação da fila. # = todas as mensagens no exchange.",
      "example": "# — todos os eventos; player.* — apenas routing keys player."
    },
    "features.rabbitmq_prefetch": {
      "label": "Prefetch count",
      "description": "Máximo de mensagens não confirmadas por canal de consumer.",
      "example": "10 — conservador; 50 — maior throughput, mais memória."
    },
    "features.rabbitmq_results_queue": {
      "label": "Fila de resultados",
      "description": "Nome da fila de saída para resultados async pontuados.",
      "example": "risk.results"
    },
    "logging.sync_enabled": {
      "label": "Log de requisição/resposta sync",
      "description": "Armazena payloads completos de requisição e resposta para POST /evaluate no Postgres. Ver em Log viewer abaixo.",
      "example": "Ativar durante testes de integração; desativar em produção de alto volume se armazenamento for preocupação."
    },
    "logging.async_enabled": {
      "label": "Log de requisição/resposta async",
      "description": "Armazena mensagens RabbitMQ pontuadas/ignoradas/rejeitadas/falhas com payloads quando disponíveis.",
      "example": "Ativar para depurar pipeline casino.events → AFS sem acompanhar logs do container."
    }
  },
  "zh": {
    "decision_thresholds.challenge": {
      "label": "Challenge 阈值",
      "description": "中等风险的最低分数。结果通常为 challenge（Turnstile、MFA、人工审核），而非 allow。",
      "example": "40 — 分数 39 的玩家为 allow；分数 40+ 为 challenge，除非已触发 hard-block signal。"
    },
    "decision_thresholds.high": {
      "label": "高风险阈值",
      "description": "高风险的最低分数。Login/signup 常被 block；deposit/withdraw/bet 可能被 block 或需额外检查。",
      "example": "61 — 分数 60 仍为中等/challenge；分数 61+ 为高风险。"
    },
    "decision_thresholds.block": {
      "label": "Block 阈值（严重）",
      "description": "严重风险的最低分数。通常为 block，除非 Decision 标签页中的 signal 已强制 block。",
      "example": "85 — 分数 84 可能仍为高风险；分数 85+ 为严重/block。"
    },
    "operator.platform_name": {
      "label": "平台名称",
      "description": "此 operator 实例的内部标签。用于日志和审计记录 — 不发送给玩家。",
      "example": "DoveBet EU",
      "signal": "unlicensed_jurisdiction（当国家不在 licensed markets 中时）"
    },
    "operator.licensed_markets": {
      "label": "Licensed markets",
      "description": "持有博彩牌照的 ISO 3166-1 alpha-2 国家代码。在 signup、deposit、bet 事件中通过玩家国家或 IP 地理位置检查。",
      "example": "DE,GB,MT,SE — 来自 FR 且无牌照的玩家触发 unlicensed_jurisdiction。",
      "signal": "unlicensed_jurisdiction"
    },
    "ip_intel.enabled": {
      "label": "已启用",
      "description": "主开关。关闭时不执行外部 IP 查询，也不发出 vpn/proxy/tor/hosting signal。",
      "example": "本地开发中若不想发起出站 API 调用可关闭。",
      "signal": "vpn_detected, proxy_detected, tor_exit_node, hosting_provider_ip"
    },
    "ip_intel.cache_ttl_seconds": {
      "label": "缓存 TTL（秒）",
      "description": "每个 IP 查询结果在 Redis 或内存中缓存的时长，之后重新获取。",
      "example": "3600 — 同一 IP 每小时检查一次；VPN 切换可能延迟最多 1 小时。"
    },
    "ip_intel.timeout_seconds": {
      "label": "查询超时（秒）",
      "description": "每次外部 IP API 请求的最大等待时间。影响缓存未命中时的 evaluate 延迟。",
      "example": "2.0 — 快速 fail 或 fail-open；5.0 — 为慢速 API 留出更多时间。"
    },
    "ip_intel.fail_open": {
      "label": "查询错误时 fail open",
      "description": "开启时 API 超时/错误不增加风险。关闭时将查询失败视为可疑（疑似 VPN/proxy）。",
      "example": "生产环境若 IP API 宕机不得 block login 则开启；偏好严格行为则关闭。"
    },
    "aml.single_deposit_threshold": {
      "label": "单笔 deposit 审核",
      "description": "单笔 payment.deposit 达到或超过此金额触发 compliance review tier 1。",
      "example": "2000 — €2,000 deposit 触发 elevated_deposit_aml_review。",
      "signal": "elevated_deposit_aml_review"
    },
    "aml.large_deposit_threshold": {
      "label": "大额 deposit 审核",
      "description": "最高 deposit AML tier — 用于非常大的单笔 deposit。",
      "example": "10000 — €10,000 deposit 触发 large_deposit_aml_review。",
      "signal": "large_deposit_aml_review"
    },
    "aml.withdrawal_review_threshold": {
      "label": "Withdraw 审核",
      "description": "单笔 payment.withdraw 达到或超过此金额触发 cashout 审核 signal。",
      "example": "1000 — €1,000 withdrawal 触发 elevated_withdrawal_review 和 cashout_review_required。",
      "signal": "elevated_withdrawal_review, cashout_review_required"
    },
    "aml.structuring_threshold": {
      "label": "Structuring 阈值",
      "description": "标记此金额 90% 至 100% 之间的 deposit — 用于刚好低于报告限额的模式。",
      "example": "3000 — €2,850 deposit（3000 的 95%）触发 structuring_threshold_deposit。",
      "signal": "structuring_threshold_deposit"
    },
    "aml.micro_deposit_max": {
      "label": "Micro deposit 上限",
      "description": "严格低于此金额的 deposit 触发 bonus-farming / 支付测试检测。",
      "example": "10 — €5 deposit 触发 micro_deposit_bonus_farming。",
      "signal": "micro_deposit_bonus_farming"
    },
    "aml.high_stake_bet_threshold": {
      "label": "高注 bet",
      "description": "单笔 wallet.bet / game.bet 达到或超过此金额。超过 €100 的 bet（固定引擎规则）也会触发 elevated_stake_bet。",
      "example": "500 — €500 bet 触发 high_stake_bet。",
      "signal": "high_stake_bet, elevated_stake_bet"
    },
    "aml.blocklist.enabled": {
      "label": "Blocklist 筛查已启用",
      "description": "所有 AML blocklist 引擎（crypto、bank、country 等）的主开关。",
      "example": "仅在 AFS 外部完全运行 blocklist 检查时关闭。"
    },
    "aml.blocklist.crypto_enabled": {
      "label": "Crypto wallet 筛查",
      "description": "在 payment.withdraw / payment.deposit 上对照 OFAC sync + 手动列表检查 crypto  payout 地址。",
      "example": "在 withdraw evaluate 时发送 payment_method_type: crypto 和 payment_method_key: 0xabc…。",
      "signal": "ofac_sanctioned_wallet, blocklisted_payout_address"
    },
    "aml.blocklist.bank_enabled": {
      "label": "Bank account 筛查",
      "description": "在银行 payout 上检查 IBAN/银行账户 ID。",
      "example": "payment_method_type: bank, payment_method_key: DE89370400440532013000",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.ewallet_enabled": {
      "label": "E-wallet 筛查",
      "description": "在 e-wallet payout 上检查 e-wallet ID 或邮箱。",
      "example": "payment_method_type: ewallet, payment_method_key: skrill_user@email.com",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.card_enabled": {
      "label": "Card payout 筛查",
      "description": "在 card withdrawal 上检查 card token 或 payout 引用。",
      "example": "payment_method_type: card, payment_method_key: card_token_abc123",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.country_enabled": {
      "label": "Country blocklist 筛查",
      "description": "当玩家国家与 OFAC sync、Lists 标签页或手动 countries 匹配时 block signup/login/deposit/withdraw。",
      "example": "玩家国家 KP 且 country blocklist 已启用 → blocklisted_country。",
      "signal": "blocklisted_country"
    },
    "aml.blocklist.sync_ofac_crypto_enabled": {
      "label": "自动 sync OFAC crypto wallet",
      "description": "每日拉取美国财政部 SDN crypto 地址。需要 Risk 容器出站 HTTPS。",
      "example": "启用后使用下方 Sync OFAC lists now 按钮。"
    },
    "aml.blocklist.sync_ofac_countries_enabled": {
      "label": "自动 sync OFAC countries",
      "description": "每次 sync 将 Treasury 衍生的制裁国家 ISO 代码加载到 Postgres。",
      "example": "按计划（sync interval）及手动 sync 时运行。"
    },
    "aml.blocklist.sync_interval_hours": {
      "label": "Sync 间隔（小时）",
      "description": "后台任务刷新 OFAC crypto 和 country 列表的频率。",
      "example": "24 — 每天 sync 一次；6 — 更频繁更新。"
    },
    "aml.blocklist.fail_open": {
      "label": "Sync 不可用时 fail open",
      "description": "开启时空/陈旧 blocklist DB 不 block payout。关闭时缺失 sync 数据视为高风险。",
      "example": "生产环境为韧性开启；最大 compliance 严格性则关闭。"
    },
    "aml.blocklist.use_lists_sanctioned_countries": {
      "label": "包含 Lists 标签页制裁国家",
      "description": "将 Lists → sanctioned countries 合并到 country blocklist 检查（除 OFAC sync 和手动外）。",
      "example": "在 Lists 标签页添加 IR 并启用 → 伊朗玩家触发 sanctioned_country。",
      "signal": "sanctioned_country"
    },
    "aml.blocklist.crypto_hit_score": {
      "label": "Payout blocklist hit 分数",
      "description": "任何 payout 目的地（crypto/bank/e-wallet/card）匹配 blocklist 条目时增加的风险分数。",
      "example": "90 — 与其他 signal 结合时通常推动决策 toward block。"
    },
    "aml.blocklist.country_hit_score": {
      "label": "Country blocklist hit 分数",
      "description": "玩家国家匹配 blocklist 时的风险分数。",
      "example": "90 — 默认；若偏好 challenge 而非 block 可降至 70。"
    },
    "aml.blocklist.manual_crypto_wallets": {
      "label": "手动 crypto wallet",
      "description": "额外要 block 的 wallet 地址 — 每行一个。除 OFAC sync 外还在 crypto payout 上检查。",
      "example": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    "aml.blocklist.manual_bank_accounts": {
      "label": "手动 bank account",
      "description": "要 block 的 IBAN 或银行账户标识符 — 每行一个。",
      "example": "DE89370400440532013000\\nGB82WEST12345698765432"
    },
    "aml.blocklist.manual_ewallet_accounts": {
      "label": "手动 e-wallet account",
      "description": "要 block 的 e-wallet ID 或邮箱 — 每行一个。",
      "example": "skrill:fraud_ring_01\\nneteller:abuse@test.com"
    },
    "aml.blocklist.manual_card_accounts": {
      "label": "手动 card payout",
      "description": "要 block 的 card token 或 payout 引用 — 每行一个。",
      "example": "card_token_stolen_batch_42\\nvisa_payout_ref_99102"
    },
    "aml.blocklist.manual_countries": {
      "label": "手动 blocklist countries",
      "description": "要 block 的 ISO 3166-1 alpha-2 代码 — 每行一个。与 OFAC sync 和 Lists 标签页合并。",
      "example": "IR\\nKP\\nSY",
      "signal": "blocklisted_country"
    },
    "withdrawal_method.enabled": {
      "label": "已启用",
      "description": "关闭时跳过共享 payout 目的地检查。",
      "example": "每次 payment.withdraw evaluate 需要 payment_method_type + payment_method_key。",
      "signal": "shared_withdrawal_method, multiple_accounts_shared_payout_method, multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_medium": {
      "label": "不同 user（中等）",
      "description": "中等 tier 触发前有多少不同 user_id 须 withdraw 到同一 payout key。",
      "example": "2 — user A 和 B 均 withdraw 到 IBAN DE89… → shared_withdrawal_method。",
      "signal": "shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_high": {
      "label": "不同 user（高）",
      "description": "高 tier multi-account payout 滥用的不同 user 阈值。",
      "example": "3 — 三个账户共享一个 Skrill 邮箱。",
      "signal": "multiple_accounts_shared_payout_method"
    },
    "withdrawal_method.distinct_users_critical": {
      "label": "不同 user（严重）",
      "description": "严重 tier 的不同 user 阈值 — 通常通过 Decision 标签页强制 block。",
      "example": "4 — 四个账户，同一 crypto wallet → multi_account_shared_withdrawal_method（hard block）。",
      "signal": "multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.medium_score": {
      "label": "中等分数",
      "description": "达到不同 user 中等阈值时增加的风险分数。",
      "example": "35 — 与其他引擎结合以达到 challenge/high。"
    },
    "withdrawal_method.high_score": {
      "label": "高分数",
      "description": "达到不同 user 高阈值时增加的风险分数。",
      "example": "55"
    },
    "withdrawal_method.critical_score": {
      "label": "严重分数",
      "description": "达到不同 user 严重阈值时增加的风险分数。",
      "example": "80 — 若 decision threshold ≤80，通常单独足够 block。"
    },
    "betting_patterns.enabled": {
      "label": "已启用",
      "description": "顺序 burst 计数器和 win-rate ratio 检查的主开关。",
      "example": "关闭则禁用此标签页所有 signal。"
    },
    "betting_patterns.burst_window_seconds": {
      "label": "Burst window（秒）",
      "description": "所有 burst 计数器和 win-rate 计算的滚动时间窗口。",
      "example": "300 — 5 分钟内 10 个 game.bets 计入 burst；每个事件窗口滑动。"
    },
    "betting_patterns.game_bet_burst_medium": {
      "label": "game.bet burst — 中等",
      "description": "中等 burst signal 前窗口内的顺序 game.bet 事件。",
      "example": "10 — 300 秒内连续放置 10 次 bonus spin。",
      "signal": "sequential_game_bet_burst"
    },
    "betting_patterns.game_bet_burst_high": {
      "label": "game.bet burst — 高",
      "description": "高 tier burst 的顺序 game.bet 计数。",
      "example": "20",
      "signal": "sequential_game_bet_burst (higher score tier)"
    },
    "betting_patterns.game_bet_burst_critical": {
      "label": "game.bet burst — 严重",
      "description": "严重 tier burst 的顺序 game.bet 计数。",
      "example": "35",
      "signal": "sequential_game_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_bet_burst_medium": {
      "label": "wallet.bet burst — 中等",
      "description": "中等 burst 前窗口内的顺序 wallet.bet（真钱）事件。",
      "example": "20 — 快速 live-casino betting bot 模式。",
      "signal": "sequential_wallet_bet_burst"
    },
    "betting_patterns.wallet_bet_burst_high": {
      "label": "wallet.bet burst — 高",
      "description": "高 tier 的顺序 wallet.bet 计数。",
      "example": "40",
      "signal": "sequential_wallet_bet_burst (higher score tier)"
    },
    "betting_patterns.wallet_bet_burst_critical": {
      "label": "wallet.bet burst — 严重",
      "description": "严重 tier 的顺序 wallet.bet 计数。",
      "example": "60",
      "signal": "sequential_wallet_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_win_burst_medium": {
      "label": "wallet.win burst — 中等",
      "description": "中等 win burst 前窗口内的顺序 wallet.win 入账。",
      "example": "8 — 短时间内大量 win 入账。",
      "signal": "sequential_wallet_win_burst"
    },
    "betting_patterns.wallet_win_burst_high": {
      "label": "wallet.win burst — 高",
      "description": "高 tier 的顺序 wallet.win 计数。",
      "example": "15",
      "signal": "sequential_wallet_win_burst (higher score tier)"
    },
    "betting_patterns.wallet_win_burst_critical": {
      "label": "wallet.win burst — 严重",
      "description": "严重 tier 的顺序 wallet.win 计数。",
      "example": "25",
      "signal": "sequential_wallet_win_burst (critical score tier)"
    },
    "betting_patterns.win_rate_min_bets": {
      "label": "Win rate — 最少 bet",
      "description": "评估 win-rate ratio 前窗口内最少 wallet.bet + game.bet 计数。",
      "example": "5 — 至少需 5 个 bet；4 win / 4 bet 在第 5 个 bet 前被忽略。"
    },
    "betting_patterns.win_rate_high_ratio": {
      "label": "Win rate — 高 ratio",
      "description": "触发高 win-rate signal 的 win ÷ bet ratio（0–1）。",
      "example": "0.75 — 窗口内 8 bet 中 6 win（75%）触发 high_win_rate_in_betting_sequence。",
      "signal": "high_win_rate_in_betting_sequence"
    },
    "betting_patterns.win_rate_critical_ratio": {
      "label": "Win rate — 严重 ratio",
      "description": "严重 win-rate tier 的 win ÷ bet ratio。",
      "example": "0.90 — 10 bet 中 9 win 触发 critical_win_rate_in_betting_sequence。",
      "signal": "critical_win_rate_in_betting_sequence"
    },
    "hedge_betting.enabled": {
      "label": "已启用",
      "description": "hedged-round 检测和 volume-washing ratio 的主开关。",
      "example": "若尚未发送 metadata.game.selection 和 round_id 则关闭。"
    },
    "hedge_betting.window_seconds": {
      "label": "Stats window（秒）",
      "description": "统计重复 hedged round 和 gross volume ratio 的滚动窗口。",
      "example": "3600 — 统计每 user 过去一小时的 hedged round。"
    },
    "hedge_betting.round_leg_ttl_seconds": {
      "label": "Round leg TTL（秒）",
      "description": "等待同一 round_id 对侧时存储第一条 bet leg 的时长。",
      "example": "600 — 12:00:00 banker bet；12:09:59 player bet 仍匹配；12:10:01 leg 过期。"
    },
    "hedge_betting.time_pair_window_seconds": {
      "label": "Time-pair window（秒）",
      "description": "round_id 缺失但 table_id 存在时的 fallback 分组 — 同一 table 上此窗口内的 bet 可能配对。",
      "example": "15 — 仅在 require_round_id 关闭且 round_id 缺失时使用。"
    },
    "hedge_betting.require_round_id": {
      "label": "Require round_id",
      "description": "开启时仅在 metadata.game.round_id 存在时运行 hedge 检查。backend 发送 round_id 后建议开启。",
      "example": "生产环境开启 — 避免 time-pair fallback 误报。"
    },
    "hedge_betting.opposite_selection_groups": {
      "label": "Opposite selection groups",
      "description": "JSON 数组组。同一内部数组中的 selection 视为同一 round 的对立面。",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.amount_match_tolerance_percent": {
      "label": "Amount match tolerance（%）",
      "description": "对侧 leg 的 stake 须在此百分比范围内相互匹配。",
      "example": "10 — banker €1000 + player €950 匹配；player €800 不匹配。"
    },
    "hedge_betting.opposite_side_same_round_score": {
      "label": "分数 — opposite sides same round",
      "description": "检测到单个 hedged round（对侧、匹配金额）时的风险分数。",
      "example": "50 — 首个检测到的 banker+player 对时触发。",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.hedged_round_medium": {
      "label": "Hedged rounds — 中等",
      "description": "重复模式 signal（中等 tier）前 stats window 内不同 hedged round。",
      "example": "3 — 一小时内三个独立 hedged hand。",
      "signal": "repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_high": {
      "label": "Hedged rounds — 高",
      "description": "高 tier 的不同 hedged round。",
      "example": "8",
      "signal": "high_repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_critical": {
      "label": "Hedged rounds — 严重",
      "description": "严重 tier 的不同 hedged round。",
      "example": "15",
      "signal": "critical_hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_enabled": {
      "label": "Volume washing 检查",
      "description": "开启时比较 stats window 内 hedged gross bet volume 与 total gross bet volume。",
      "example": "玩家 1h 内 hedged €6000 + normal €4000 → 60% hedged share。",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.min_gross_volume": {
      "label": "Volume washing — 最小 gross",
      "description": "评估 volume-washing ratio 前窗口内最小 total bet volume。",
      "example": "5000 — 玩家窗口内 gross bet 至少 €5000 前忽略 ratio。"
    },
    "hedge_betting.min_hedged_gross_ratio": {
      "label": "Volume washing — 最小 hedged ratio",
      "description": "触发 volume washing signal 的最小 hedged_gross ÷ total_gross ratio（0–1）。",
      "example": "0.5 — gross volume 的 50% 或以上为 hedged → hedged_bet_volume_washing（在 Decision 中则为 hard block）。",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_score": {
      "label": "分数 — volume washing",
      "description": "达到 volume-washing ratio 阈值时增加的风险分数。",
      "example": "55 — 与 opposite_side 分数结合以获得更高总分。"
    },
    "step_up_verification.enabled": {
      "label": "已启用",
      "description": "关闭时忽略 step_up_verification metadata，challenge 结果不降级。",
      "example": "frontend 在 challenge 响应中显示 Turnstile 时开启。"
    },
    "step_up_verification.grant_ttl_days": {
      "label": "Grant 时长（天）",
      "description": "同一 user_id + device fingerprint 的成功 verification grant 有效时长。",
      "example": "7 — 玩家通过 Turnstile 一次；同一 device 上 7 天内后续 login 为 allow。"
    },
    "step_up_verification.max_verified_age_minutes": {
      "label": "verified_at 最大 age（分钟）",
      "description": "metadata.verified_at 须在 evaluate 请求时间戳的此分钟数内。",
      "example": "5 — 12:00 siteverify，12:06 evaluate → grant 因 stale 被拒绝。"
    },
    "step_up_verification.downgrade_challenge_to_allow": {
      "label": "Challenge 降级为 allow",
      "description": "开启时活跃 grant 将 challenge 决策改为 allow。永不 override block 或 critical signal。",
      "example": "开启 — 通过 Turnstile 后的典型生产设置。"
    },
    "step_up_verification.allowed_hostnames": {
      "label": "Allowed hostnames",
      "description": "siteverify 响应的可选 Cloudflare hostname allowlist — 每行一个。空 = 跳过检查。",
      "example": "casino.example.com\\nwww.casino.example.com"
    },
    "step_up_verification.applicable_event_types": {
      "label": "Applicable event types",
      "description": "step-up grant 可降级 challenge 的 event type — 每行一个。",
      "example": "player.login\\nplayer.signup\\npayment.deposit"
    },
    "fingerprint.required_channels": {
      "label": "Required channels",
      "description": "预期 context.fingerprint 的 channel。这些 channel 上缺失值触发 missing_fingerprint。",
      "example": "web,mobile — web signup 无 visitorId → missing_fingerprint。",
      "signal": "missing_fingerprint"
    },
    "fingerprint.min_length": {
      "label": "最小长度",
      "description": "有效 FingerprintJS visitorId 最小字符长度。",
      "example": "10 — abc123（6 字符）→ malformed_fingerprint。",
      "signal": "malformed_fingerprint"
    },
    "fingerprint.max_length": {
      "label": "最大长度",
      "description": "有效 visitorId 最大长度。min–max 外的值被拒绝。",
      "example": "64",
      "signal": "malformed_fingerprint, invalid_fingerprint"
    },
    "fingerprint.suspicious_values": {
      "label": "可疑值",
      "description": "已知伪造或 placeholder fingerprint 字符串 — 每行一个。精确匹配则验证失败。",
      "example": "undefined\\nnull\\n00000000-0000-0000-0000-000000000000",
      "signal": "invalid_fingerprint"
    },
    "lists.disposable_domains": {
      "label": "Disposable email domains",
      "description": "一次性 email 提供商 domain。使用这些 domain 的 signup 通常 hard-blocked。",
      "example": "mailinator.com\\n10minutemail.com\\nguerrillamail.com",
      "signal": "disposable_email"
    },
    "lists.high_risk_countries": {
      "label": "High-risk countries",
      "description": "欺诈率较高的 ISO country code。在 geo/IP 检查上增加分数 — 非自动 block。",
      "example": "NG\\nGH\\nPK",
      "signal": "high_risk_country"
    },
    "lists.sanctioned_countries": {
      "label": "Sanctioned countries",
      "description": "制裁或禁止博彩 jurisdiction 的 ISO code。AML blocklist 包含 Lists 标签页时使用。",
      "example": "IR\\nKP\\nCU",
      "signal": "sanctioned_country"
    },
    "lists.generic_names": {
      "label": "Generic names",
      "description": "signup/identity 上的 placeholder display name — 每行一个，不区分大小写。",
      "example": "test\\nuser\\nadmin\\nPlayer",
      "signal": "generic_name"
    },
    "lists.role_based_email_locals": {
      "label": "Role-based email locals",
      "description": "表示非个人账户的 email local part（@ 前）。",
      "example": "admin\\nsupport\\ninfo\\nnoreply",
      "signal": "role_based_email"
    },
    "lists.suspicious_email_tlds": {
      "label": "Suspicious email TLDs",
      "description": "与 spam 关联的 top-level domain。email 以这些 TLD 结尾时匹配。",
      "example": ".xyz\\n.top\\n.click",
      "signal": "suspicious_email_tld"
    },
    "lists.suspicious_email_local_tokens": {
      "label": "Suspicious email local tokens",
      "description": "email local part 中暗示一次性或 bot account 的子字符串。",
      "example": "temp\\nspam\\nbot\\nfake",
      "signal": "suspicious_email_pattern"
    },
    "lists.bot_user_agent_tokens": {
      "label": "Bot User-Agent tokens",
      "description": "User-Agent header 中表示脚本或自动化的子字符串。",
      "example": "curl\\npython-requests\\nheadless\\nscrapy",
      "signal": "bot_user_agent"
    },
    "lists.emulator_ua_tokens": {
      "label": "Emulator UA tokens",
      "description": "Android emulator 或虚拟 device 的 User-Agent 模式。",
      "example": "genymotion\\nbluestacks\\nsdk_gphone",
      "signal": "emulator_detected"
    },
    "lists.suspicious_referrers": {
      "label": "Suspicious referrers",
      "description": "signup 上视为低信任的精确 referrer 值。",
      "example": "direct\\nunknown\\n（blank referrer 的空行）",
      "signal": "suspicious_referrer"
    },
    "lists.bonus_abuse_referrer_tokens": {
      "label": "Bonus abuse referrer tokens",
      "description": "与 bonus-hunting 或 affiliate abuse 站点关联的 signup referrer URL 子字符串。",
      "example": "free-spins\\nno-deposit\\nbonus-hunter",
      "signal": "bonus_abuse_referrer"
    },
    "velocity_thresholds": {
      "label": "Velocity thresholds（JSON）",
      "description": "阈值名称 → 最大 count 映射。后缀 _medium/_high/_critical 选择 tier。勿删除键 — 引擎需要完整集合。",
      "example": "{\\n  \"login_ip_medium\": 5,\\n  \"login_ip_high\": 15,\\n  \"login_ip_critical\": 30,\\n  \"signup_ip_critical\": 10,\\n  \"deposit_user_high\": 6\\n}",
      "signal": "medium_login_ip_velocity, bulk_login_attack, bulk_signup_attack, rapid_deposit_activity, …"
    },
    "critical_signals": {
      "label": "Hard-block signals",
      "description": "引擎发出的精确 signal name 字符串 — 每行一个。大小写必须完全匹配。",
      "example": "disposable_email\\nbulk_login_attack\\nhedged_bet_volume_washing\\nmulti_account_shared_withdrawal_method"
    },
    "features.sync_publish_audit": {
      "label": "Sync /evaluate 时 publish audit",
      "description": "开启时同步 POST /evaluate 结果也 publish 到 RabbitMQ 供 Orchestrator audit。",
      "example": "Orchestrator 须在 async event 相同 pipeline 中看到 sync API 决策时开启。"
    },
    "features.decision_cache_ttl_seconds": {
      "label": "Decision cache TTL（秒）",
      "description": "在 Redis 中缓存相同 event_id 决策以避免重复评分。需要 Redis 已启用。",
      "example": "300 — 5 分钟内相同 event_id 返回缓存决策；0 = 禁用。"
    },
    "features.redis_enabled": {
      "label": "Redis 已启用",
      "description": "使用 Redis 存储 velocity counter、hedge/betting store 及可选 decision cache。",
      "example": "单实例 dev（内存 counter）关闭；生产 multi-instance 开启。"
    },
    "features.redis_velocity_ip_ttl": {
      "label": "Redis IP velocity TTL",
      "description": "Redis 中 IP velocity key 的 sliding window 长度（秒）。",
      "example": "3600 — login_ip_high 统计过去一小时内来自同一 IP 的 login。"
    },
    "features.redis_velocity_domain_ttl": {
      "label": "Redis domain velocity TTL",
      "description": "email domain signup velocity counter 的 sliding window 长度。",
      "example": "86400 — signup_domain_* 统计 24h 内每 domain 的 signup。"
    },
    "features.rabbitmq_enabled": {
      "label": "RabbitMQ consumer 已启用",
      "description": "启动从 casino platform exchange/queue 评分 event 的 async consumer。",
      "example": "platform 向 casino.events publish wallet.bet、player.login 等时开启。"
    },
    "features.rabbitmq_publish_results": {
      "label": "Publish results 到 Orchestrator",
      "description": "async scoring 后将 scored EvaluateResponse 消息 publish 到 results queue。",
      "example": "Orchestrator 订阅 risk.results 进行 audit/action 时开启。"
    },
    "features.rabbitmq_events_exchange": {
      "label": "Events exchange",
      "description": "casino platform publish 的 topic exchange。空 = legacy direct queue mode。",
      "example": "casino.events"
    },
    "features.rabbitmq_events_exchange_type": {
      "label": "Exchange type",
      "description": "AFS consumer declare/bind 的 RabbitMQ exchange type。",
      "example": "topic"
    },
    "features.rabbitmq_events_queue": {
      "label": "Events queue",
      "description": "bind 到 platform exchange 后 AFS consume 的 queue。",
      "example": "casino.afs"
    },
    "features.rabbitmq_events_binding_key": {
      "label": "Binding key",
      "description": "queue binding 的 routing key 模式。# = exchange 上所有 message。",
      "example": "# — 所有 event；player.* — 仅 player routing key。"
    },
    "features.rabbitmq_prefetch": {
      "label": "Prefetch count",
      "description": "每个 consumer channel 的最大 unacknowledged message。",
      "example": "10 — 保守；50 — 更高 throughput，更多 memory。"
    },
    "features.rabbitmq_results_queue": {
      "label": "Results queue",
      "description": "scored async result 的 outbound queue name。",
      "example": "risk.results"
    },
    "logging.sync_enabled": {
      "label": "Sync request/response logging",
      "description": "在 Postgres 中存储 POST /evaluate 的完整 request 和 response payload。见下方 Log viewer。",
      "example": "集成测试期间启用；高 volume 生产环境若 storage 是顾虑则禁用。"
    },
    "logging.async_enabled": {
      "label": "Async request/response logging",
      "description": "存储 RabbitMQ scored/skipped/rejected/failed message 及可用 payload。",
      "example": "启用以调试 casino.events → AFS pipeline，无需 tail container log。"
    }
  },
  "ja": {
    "decision_thresholds.challenge": {
      "label": "Challenge しきい値",
      "description": "中リスクの最低スコア。結果は通常 allow ではなく challenge（Turnstile、MFA、手動レビュー）です。",
      "example": "40 — スコア 39 のプレイヤーは allow；スコア 40+ は hard-block signal が発火していない限り challenge。"
    },
    "decision_thresholds.high": {
      "label": "高しきい値",
      "description": "高リスクの最低スコア。Login/signup は often block；deposit/withdraw/bet は block または追加チェックが必要な場合があります。",
      "example": "61 — スコア 60 は中/challenge のまま；スコア 61+ は高リスク。"
    },
    "decision_thresholds.block": {
      "label": "Block しきい値（重大）",
      "description": "重大リスクの最低スコア。Decision タブの signal が既に block を強制していない限り、通常 block になります。",
      "example": "85 — スコア 84 はまだ高リスクの可能性；スコア 85+ は重大/block。"
    },
    "operator.platform_name": {
      "label": "プラットフォーム名",
      "description": "この operator インスタンスの内部ラベル。ログと監査エントリに使用 — プレイヤーには送信されません。",
      "example": "DoveBet EU",
      "signal": "unlicensed_jurisdiction（国が licensed markets にない場合）"
    },
    "operator.licensed_markets": {
      "label": "Licensed markets",
      "description": "ギャンブルライセンスを保有する ISO 3166-1 alpha-2 国コード。signup、deposit、bet イベントでプレイヤー国または IP geo により確認。",
      "example": "DE,GB,MT,SE — FR からのプレイヤー、ライセンスなし → unlicensed_jurisdiction。",
      "signal": "unlicensed_jurisdiction"
    },
    "ip_intel.enabled": {
      "label": "有効",
      "description": "マスタートグル。オフの場合、外部 IP ルックアップは実行されず vpn/proxy/tor/hosting signal は発行されません。",
      "example": "アウトバウンド API 呼び出しを避けたいローカル dev ではオフ。",
      "signal": "vpn_detected, proxy_detected, tor_exit_node, hosting_provider_ip"
    },
    "ip_intel.cache_ttl_seconds": {
      "label": "キャッシュ TTL（秒）",
      "description": "各 IP ルックアップ結果が Redis またはメモリにキャッシュされる時間（再取得前）。",
      "example": "3600 — 同一 IP は 1 時間に 1 回確認；VPN 切替は最大 1 時間遅れる可能性。"
    },
    "ip_intel.timeout_seconds": {
      "label": "ルックアップタイムアウト（秒）",
      "description": "外部 IP API リクエストあたりの最大待機。キャッシュミス時の evaluate レイテンシに影響。",
      "example": "2.0 — 迅速な fail または fail-open；5.0 — 遅い API により多くの時間。"
    },
    "ip_intel.fail_open": {
      "label": "ルックアップエラー時 fail open",
      "description": "オン：API タイムアウト/エラーはリスクを追加しない。オフ：ルックアップ失敗は疑わしい（VPN/proxy 疑い）として扱う。",
      "example": "IP API ダウンタイムで login を block してはならない production ではオン；厳格動作ならオフ。"
    },
    "aml.single_deposit_threshold": {
      "label": "単一 deposit レビュー",
      "description": "この金額以上の単一 payment.deposit で compliance review tier 1 をトリガー。",
      "example": "2000 — €2,000 deposit → elevated_deposit_aml_review。",
      "signal": "elevated_deposit_aml_review"
    },
    "aml.large_deposit_threshold": {
      "label": "大口 deposit レビュー",
      "description": "最高 deposit AML tier — 非常に大きな単一 deposit 用。",
      "example": "10000 — €10,000 deposit → large_deposit_aml_review。",
      "signal": "large_deposit_aml_review"
    },
    "aml.withdrawal_review_threshold": {
      "label": "Withdraw レビュー",
      "description": "この金額以上の単一 payment.withdraw で cashout レビュー signal をトリガー。",
      "example": "1000 — €1,000 withdrawal → elevated_withdrawal_review と cashout_review_required。",
      "signal": "elevated_withdrawal_review, cashout_review_required"
    },
    "aml.structuring_threshold": {
      "label": "Structuring しきい値",
      "description": "この金額の 90%～100% の deposit をフラグ — 報告限度直下に留まるパターン。",
      "example": "3000 — €2,850 deposit（3000 の 95%）→ structuring_threshold_deposit。",
      "signal": "structuring_threshold_deposit"
    },
    "aml.micro_deposit_max": {
      "label": "Micro deposit 上限",
      "description": "この金額未満の deposit は bonus-farming / 決済テスト検出をトリガー。",
      "example": "10 — €5 deposit → micro_deposit_bonus_farming。",
      "signal": "micro_deposit_bonus_farming"
    },
    "aml.high_stake_bet_threshold": {
      "label": "高額 bet",
      "description": "この金額以上の単一 wallet.bet / game.bet。€100 超の bet（固定エンジンルール）も elevated_stake_bet を発生。",
      "example": "500 — €500 bet → high_stake_bet。",
      "signal": "high_stake_bet, elevated_stake_bet"
    },
    "aml.blocklist.enabled": {
      "label": "Blocklist スクリーニング有効",
      "description": "すべての AML blocklist エンジン（crypto、bank、country 等）のマスタートグル。",
      "example": "blocklist チェックを AFS 外で完全に実行する場合のみオフ。"
    },
    "aml.blocklist.crypto_enabled": {
      "label": "Crypto wallet スクリーニング",
      "description": "payment.withdraw / payment.deposit の crypto payout アドレスを OFAC sync + 手動リストと照合。",
      "example": "withdraw evaluate で payment_method_type: crypto と payment_method_key: 0xabc… を送信。",
      "signal": "ofac_sanctioned_wallet, blocklisted_payout_address"
    },
    "aml.blocklist.bank_enabled": {
      "label": "Bank account スクリーニング",
      "description": "銀行 payout の IBAN/銀行口座 ID を確認。",
      "example": "payment_method_type: bank, payment_method_key: DE89370400440532013000",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.ewallet_enabled": {
      "label": "E-wallet スクリーニング",
      "description": "e-wallet payout の e-wallet ID またはメールを確認。",
      "example": "payment_method_type: ewallet, payment_method_key: skrill_user@email.com",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.card_enabled": {
      "label": "Card payout スクリーニング",
      "description": "カード withdrawal の card token または payout 参照を確認。",
      "example": "payment_method_type: card, payment_method_key: card_token_abc123",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.country_enabled": {
      "label": "Country blocklist スクリーニング",
      "description": "プレイヤー国が OFAC sync、Lists タブ、または手動 countries と一致すると signup/login/deposit/withdraw を block。",
      "example": "プレイヤー国 KP、country blocklist 有効 → blocklisted_country。",
      "signal": "blocklisted_country"
    },
    "aml.blocklist.sync_ofac_crypto_enabled": {
      "label": "OFAC crypto wallet 自動 sync",
      "description": "米国財務省 SDN crypto アドレスを毎日取得。Risk コンテナからのアウトバウンド HTTPS が必要。",
      "example": "有効化後、下の Sync OFAC lists now ボタンを使用。"
    },
    "aml.blocklist.sync_ofac_countries_enabled": {
      "label": "OFAC countries 自動 sync",
      "description": "各 sync で Treasury 由来の制裁国 ISO コードを Postgres にロード。",
      "example": "スケジュール（sync interval）および手動 sync で実行。"
    },
    "aml.blocklist.sync_interval_hours": {
      "label": "Sync 間隔（時間）",
      "description": "バックグラウンドジョブが OFAC crypto および country リストを更新する頻度。",
      "example": "24 — 1 日 1 回 sync；6 — より頻繁な更新。"
    },
    "aml.blocklist.fail_open": {
      "label": "Sync 不可時 fail open",
      "description": "オン：空/古い blocklist DB は payout を block しない。オフ：sync データ欠如は高リスクとして扱う。",
      "example": "production レジリエンスのためオン；最大 compliance 厳格性のためオフ。"
    },
    "aml.blocklist.use_lists_sanctioned_countries": {
      "label": "Lists タブ制裁国を含める",
      "description": "Lists → sanctioned countries を country blocklist チェックにマージ（OFAC sync と手動に加えて）。",
      "example": "Lists タブに IR を追加 + 有効化 → イランのプレイヤー sanctioned_country。",
      "signal": "sanctioned_country"
    },
    "aml.blocklist.crypto_hit_score": {
      "label": "Payout blocklist hit スコア",
      "description": "payout 先（crypto/bank/e-wallet/card）が blocklist エントリと一致したときのリスクスコア。",
      "example": "90 — 他 signal と組み合わせると通常 block 方向へ。"
    },
    "aml.blocklist.country_hit_score": {
      "label": "Country blocklist hit スコア",
      "description": "プレイヤー国が blocklist と一致したときのリスクスコア。",
      "example": "90 — デフォルト；block より challenge を望む場合 70 に下げる。"
    },
    "aml.blocklist.manual_crypto_wallets": {
      "label": "手動 crypto wallet",
      "description": "block する追加 wallet アドレス — 1 行に 1 つ。OFAC sync に加え crypto payout で確認。",
      "example": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    "aml.blocklist.manual_bank_accounts": {
      "label": "手動 bank account",
      "description": "block する IBAN または銀行口座識別子 — 1 行に 1 つ。",
      "example": "DE89370400440532013000\\nGB82WEST12345698765432"
    },
    "aml.blocklist.manual_ewallet_accounts": {
      "label": "手動 e-wallet account",
      "description": "block する e-wallet ID またはメール — 1 行に 1 つ。",
      "example": "skrill:fraud_ring_01\\nneteller:abuse@test.com"
    },
    "aml.blocklist.manual_card_accounts": {
      "label": "手動 card payout",
      "description": "block する card token または payout 参照 — 1 行に 1 つ。",
      "example": "card_token_stolen_batch_42\\nvisa_payout_ref_99102"
    },
    "aml.blocklist.manual_countries": {
      "label": "手動 blocklist countries",
      "description": "block する ISO 3166-1 alpha-2 コード — 1 行に 1 つ。OFAC sync と Lists タブとマージ。",
      "example": "IR\\nKP\\nSY",
      "signal": "blocklisted_country"
    },
    "withdrawal_method.enabled": {
      "label": "有効",
      "description": "オフ：共有 payout 先チェックをスキップ。",
      "example": "すべての payment.withdraw evaluate に payment_method_type + payment_method_key が必要。",
      "signal": "shared_withdrawal_method, multiple_accounts_shared_payout_method, multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_medium": {
      "label": "異なる user（中）",
      "description": "中 tier が発火する前に、同一 payout key へ withdraw する異なる user_id の数。",
      "example": "2 — user A と B が IBAN DE89… へ withdraw → shared_withdrawal_method。",
      "signal": "shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_high": {
      "label": "異なる user（高）",
      "description": "高 tier multi-account payout 悪用の異なる user しきい値。",
      "example": "3 — 3 アカウントが 1 つの Skrill メールを共有。",
      "signal": "multiple_accounts_shared_payout_method"
    },
    "withdrawal_method.distinct_users_critical": {
      "label": "異なる user（重大）",
      "description": "重大 tier の異なる user しきい値 — 通常 Decision タブ経由で block を強制。",
      "example": "4 — 4 アカウント、同一 crypto wallet → multi_account_shared_withdrawal_method（hard block）。",
      "signal": "multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.medium_score": {
      "label": "中スコア",
      "description": "異なる user 中しきい値到達時に追加されるリスクスコア。",
      "example": "35 — 他エンジンと組み合わせ challenge/high 到達。"
    },
    "withdrawal_method.high_score": {
      "label": "高スコア",
      "description": "異なる user 高しきい値到達時に追加されるリスクスコア。",
      "example": "55"
    },
    "withdrawal_method.critical_score": {
      "label": "重大スコア",
      "description": "異なる user 重大しきい値到達時に追加されるリスクスコア。",
      "example": "80 — decision threshold が ≤80 なら単独で block に十分なことが多い。"
    },
    "betting_patterns.enabled": {
      "label": "有効",
      "description": "順次 burst カウンターと win-rate ratio チェックのマスタートグル。",
      "example": "オフでこのタブのすべての signal を無効化。"
    },
    "betting_patterns.burst_window_seconds": {
      "label": "Burst window（秒）",
      "description": "すべての burst カウンターと win-rate 計算のローリング時間ウィンドウ。",
      "example": "300 — 5 分間の 10 game.bets が burst にカウント；各イベントでウィンドウがスライド。"
    },
    "betting_patterns.game_bet_burst_medium": {
      "label": "game.bet burst — 中",
      "description": "中 burst signal 前のウィンドウ内の順次 game.bet イベント。",
      "example": "10 — 300 秒以内に連続 10 bonus spin。",
      "signal": "sequential_game_bet_burst"
    },
    "betting_patterns.game_bet_burst_high": {
      "label": "game.bet burst — 高",
      "description": "高 tier burst の順次 game.bet カウント。",
      "example": "20",
      "signal": "sequential_game_bet_burst (higher score tier)"
    },
    "betting_patterns.game_bet_burst_critical": {
      "label": "game.bet burst — 重大",
      "description": "重大 tier burst の順次 game.bet カウント。",
      "example": "35",
      "signal": "sequential_game_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_bet_burst_medium": {
      "label": "wallet.bet burst — 中",
      "description": "中 burst 前のウィンドウ内の順次 wallet.bet（リアルマネー）イベント。",
      "example": "20 — 高速 live-casino betting bot パターン。",
      "signal": "sequential_wallet_bet_burst"
    },
    "betting_patterns.wallet_bet_burst_high": {
      "label": "wallet.bet burst — 高",
      "description": "高 tier の順次 wallet.bet カウント。",
      "example": "40",
      "signal": "sequential_wallet_bet_burst (higher score tier)"
    },
    "betting_patterns.wallet_bet_burst_critical": {
      "label": "wallet.bet burst — 重大",
      "description": "重大 tier の順次 wallet.bet カウント。",
      "example": "60",
      "signal": "sequential_wallet_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_win_burst_medium": {
      "label": "wallet.win burst — 中",
      "description": "中 win burst 前のウィンドウ内の順次 wallet.win クレジット。",
      "example": "8 — 短時間に多数の win が付与。",
      "signal": "sequential_wallet_win_burst"
    },
    "betting_patterns.wallet_win_burst_high": {
      "label": "wallet.win burst — 高",
      "description": "高 tier の順次 wallet.win カウント。",
      "example": "15",
      "signal": "sequential_wallet_win_burst (higher score tier)"
    },
    "betting_patterns.wallet_win_burst_critical": {
      "label": "wallet.win burst — 重大",
      "description": "重大 tier の順次 wallet.win カウント。",
      "example": "25",
      "signal": "sequential_wallet_win_burst (critical score tier)"
    },
    "betting_patterns.win_rate_min_bets": {
      "label": "Win rate — 最小 bet",
      "description": "win-rate ratio 評価前のウィンドウ内最小 wallet.bet + game.bet カウント。",
      "example": "5 — 最低 5 bet 必要；4 win / 4 bet は 5 番目の bet まで無視。"
    },
    "betting_patterns.win_rate_high_ratio": {
      "label": "Win rate — 高 ratio",
      "description": "高 win-rate signal をトリガーする win ÷ bet ratio（0–1）。",
      "example": "0.75 — ウィンドウ内 8 bet 中 6 win（75%）→ high_win_rate_in_betting_sequence。",
      "signal": "high_win_rate_in_betting_sequence"
    },
    "betting_patterns.win_rate_critical_ratio": {
      "label": "Win rate — 重大 ratio",
      "description": "重大 win-rate tier の win ÷ bet ratio。",
      "example": "0.90 — 10 bet 中 9 win → critical_win_rate_in_betting_sequence。",
      "signal": "critical_win_rate_in_betting_sequence"
    },
    "hedge_betting.enabled": {
      "label": "有効",
      "description": "hedged-round 検出と volume-washing ratio のマスタートグル。",
      "example": "metadata.game.selection と round_id をまだ送信していない場合はオフ。"
    },
    "hedge_betting.window_seconds": {
      "label": "Stats window（秒）",
      "description": "繰り返し hedged round と gross volume ratio をカウントするローリングウィンドウ。",
      "example": "3600 — user あたり過去 1 時間の hedged round をカウント。"
    },
    "hedge_betting.round_leg_ttl_seconds": {
      "label": "Round leg TTL（秒）",
      "description": "同一 round_id で反対側を待つ間、最初の bet leg を保存する時間。",
      "example": "600 — 12:00:00 banker bet；12:09:59 player bet はまだマッチ；12:10:01 で leg 失効。"
    },
    "hedge_betting.time_pair_window_seconds": {
      "label": "Time-pair window（秒）",
      "description": "round_id 欠如だが table_id ありの fallback グループ — 同一 table でこのウィンドウ内の bet がペア可能。",
      "example": "15 — require_round_id がオフで round_id 欠如の場合のみ使用。"
    },
    "hedge_betting.require_round_id": {
      "label": "round_id 必須",
      "description": "オン：metadata.game.round_id がある場合のみ hedge チェック実行。backend が round_id を送信したら推奨。",
      "example": "production でオン — time-pair fallback の false positive を回避。"
    },
    "hedge_betting.opposite_selection_groups": {
      "label": "Opposite selection groups",
      "description": "グループの JSON 配列。同一内部配列の selection は同一 round で反対として扱う。",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.amount_match_tolerance_percent": {
      "label": "Amount match tolerance（%）",
      "description": "反対 leg の stake は互いにこのパーセント以内である必要あり。",
      "example": "10 — banker €1000 + player €950 はマッチ；player €800 は不可。"
    },
    "hedge_betting.opposite_side_same_round_score": {
      "label": "スコア — opposite sides same round",
      "description": "単一 hedged round（反対 sides、一致 amount）検出時のリスクスコア。",
      "example": "50 — 最初に検出された banker+player ペアで発火。",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.hedged_round_medium": {
      "label": "Hedged rounds — 中",
      "description": "反復パターン signal（中 tier）前の stats window 内の異なる hedged round。",
      "example": "3 — 1 時間に 3 つの別 hedged hand。",
      "signal": "repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_high": {
      "label": "Hedged rounds — 高",
      "description": "高 tier の異なる hedged round。",
      "example": "8",
      "signal": "high_repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_critical": {
      "label": "Hedged rounds — 重大",
      "description": "重大 tier の異なる hedged round。",
      "example": "15",
      "signal": "critical_hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_enabled": {
      "label": "Volume washing チェック",
      "description": "オン：stats window で hedged gross bet volume を total gross bet volume と比較。",
      "example": "プレイヤー 1h で hedged €6000 + normal €4000 → 60% hedged share。",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.min_gross_volume": {
      "label": "Volume washing — 最小 gross",
      "description": "volume-washing ratio 評価前のウィンドウ内最小 total bet volume。",
      "example": "5000 — プレイヤーのウィンドウ内 gross bet が最低 €5000 まで ratio を無視。"
    },
    "hedge_betting.min_hedged_gross_ratio": {
      "label": "Volume washing — 最小 hedged ratio",
      "description": "volume washing signal をトリガーする最小 hedged_gross ÷ total_gross ratio（0–1）。",
      "example": "0.5 — gross volume の 50% 以上が hedged → hedged_bet_volume_washing（Decision にあれば hard block）。",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_score": {
      "label": "スコア — volume washing",
      "description": "volume-washing ratio しきい値到達時に追加されるリスクスコア。",
      "example": "55 — opposite_side スコアと組み合わせてより高い合計。"
    },
    "step_up_verification.enabled": {
      "label": "有効",
      "description": "オフ：step_up_verification metadata を無視し challenge 結果をダウングレードしない。",
      "example": "frontend が challenge 応答で Turnstile を表示する場合オン。"
    },
    "step_up_verification.grant_ttl_days": {
      "label": "Grant 期間（日）",
      "description": "同一 user_id + device fingerprint の成功 verification grant の有効期間。",
      "example": "7 — プレイヤーが Turnstile を 1 回通過；同一 device で 7 日間後続 login allow。"
    },
    "step_up_verification.max_verified_age_minutes": {
      "label": "verified_at 最大 age（分）",
      "description": "metadata.verified_at は evaluate リクエストタイムスタンプからこの分数以内である必要あり。",
      "example": "5 — 12:00 siteverify、12:06 evaluate → grant が stale で拒否。"
    },
    "step_up_verification.downgrade_challenge_to_allow": {
      "label": "Challenge を allow にダウングレード",
      "description": "オン：アクティブ grant が challenge 決定を allow に変更。block または critical signal は決して上書きしない。",
      "example": "オン — Turnstile 通過後の typical production 設定。"
    },
    "step_up_verification.allowed_hostnames": {
      "label": "Allowed hostnames",
      "description": "siteverify 応答からのオプション Cloudflare hostname allowlist — 1 行に 1 つ。空 = チェック省略。",
      "example": "casino.example.com\\nwww.casino.example.com"
    },
    "step_up_verification.applicable_event_types": {
      "label": "Applicable event types",
      "description": "step-up grant が challenge をダウングレードできる event type — 1 行に 1 つ。",
      "example": "player.login\\nplayer.signup\\npayment.deposit"
    },
    "fingerprint.required_channels": {
      "label": "Required channels",
      "description": "context.fingerprint が期待される channel。これらの channel で値欠如は missing_fingerprint。",
      "example": "web,mobile — visitorId なしの web signup → missing_fingerprint。",
      "signal": "missing_fingerprint"
    },
    "fingerprint.min_length": {
      "label": "最小長",
      "description": "有効な FingerprintJS visitorId の最小文字長。",
      "example": "10 — abc123（6 文字）→ malformed_fingerprint。",
      "signal": "malformed_fingerprint"
    },
    "fingerprint.max_length": {
      "label": "最大長",
      "description": "有効な visitorId 最大長。min–max 外の値は拒否。",
      "example": "64",
      "signal": "malformed_fingerprint, invalid_fingerprint"
    },
    "fingerprint.suspicious_values": {
      "label": "疑わしい値",
      "description": "既知の偽または placeholder fingerprint 文字列 — 1 行に 1 つ。完全一致で検証失敗。",
      "example": "undefined\\nnull\\n00000000-0000-0000-0000-000000000000",
      "signal": "invalid_fingerprint"
    },
    "lists.disposable_domains": {
      "label": "Disposable email domains",
      "description": "使い捨て email プロバイダー domain。これらの domain での signup は通常 hard-blocked。",
      "example": "mailinator.com\\n10minutemail.com\\nguerrillamail.com",
      "signal": "disposable_email"
    },
    "lists.high_risk_countries": {
      "label": "High-risk countries",
      "description": "詐欺率が高い ISO country code。geo/IP チェックでスコア追加 — 自動 block ではない。",
      "example": "NG\\nGH\\nPK",
      "signal": "high_risk_country"
    },
    "lists.sanctioned_countries": {
      "label": "Sanctioned countries",
      "description": "制裁またはギャンブル禁止 jurisdiction の ISO code。AML blocklist が Lists タブを含む場合に使用。",
      "example": "IR\\nKP\\nCU",
      "signal": "sanctioned_country"
    },
    "lists.generic_names": {
      "label": "Generic names",
      "description": "signup/identity の placeholder display name — 1 行に 1 つ、大文字小文字無視。",
      "example": "test\\nuser\\nadmin\\nPlayer",
      "signal": "generic_name"
    },
    "lists.role_based_email_locals": {
      "label": "Role-based email locals",
      "description": "非個人アカウントを示す email local part（@ 前）。",
      "example": "admin\\nsupport\\ninfo\\nnoreply",
      "signal": "role_based_email"
    },
    "lists.suspicious_email_tlds": {
      "label": "Suspicious email TLDs",
      "description": "スパムに関連する top-level domain。email がこれら TLD で終わるとマッチ。",
      "example": ".xyz\\n.top\\n.click",
      "signal": "suspicious_email_tld"
    },
    "lists.suspicious_email_local_tokens": {
      "label": "Suspicious email local tokens",
      "description": "使い捨てまたは bot account を示唆する email local part の部分文字列。",
      "example": "temp\\nspam\\nbot\\nfake",
      "signal": "suspicious_email_pattern"
    },
    "lists.bot_user_agent_tokens": {
      "label": "Bot User-Agent tokens",
      "description": "スクリプトまたは自動化を示す User-Agent header の部分文字列。",
      "example": "curl\\npython-requests\\nheadless\\nscrapy",
      "signal": "bot_user_agent"
    },
    "lists.emulator_ua_tokens": {
      "label": "Emulator UA tokens",
      "description": "Android emulator または仮想 device の User-Agent パターン。",
      "example": "genymotion\\nbluestacks\\nsdk_gphone",
      "signal": "emulator_detected"
    },
    "lists.suspicious_referrers": {
      "label": "Suspicious referrers",
      "description": "signup で低信頼として扱う正確な referrer 値。",
      "example": "direct\\nunknown\\n（blank referrer 用の空行）",
      "signal": "suspicious_referrer"
    },
    "lists.bonus_abuse_referrer_tokens": {
      "label": "Bonus abuse referrer tokens",
      "description": "bonus-hunting または affiliate abuse サイトに関連する signup referrer URL の部分文字列。",
      "example": "free-spins\\nno-deposit\\nbonus-hunter",
      "signal": "bonus_abuse_referrer"
    },
    "velocity_thresholds": {
      "label": "Velocity thresholds（JSON）",
      "description": "しきい値名 → 最大 count のマップ。接尾辞 _medium/_high/_critical で tier 選択。キー削除禁止 — エンジンは完全セットを期待。",
      "example": "{\\n  \"login_ip_medium\": 5,\\n  \"login_ip_high\": 15,\\n  \"login_ip_critical\": 30,\\n  \"signup_ip_critical\": 10,\\n  \"deposit_user_high\": 6\\n}",
      "signal": "medium_login_ip_velocity, bulk_login_attack, bulk_signup_attack, rapid_deposit_activity, …"
    },
    "critical_signals": {
      "label": "Hard-block signals",
      "description": "エンジンが emit する正確な signal name 文字列 — 1 行に 1 つ。大文字小文字は完全一致必須。",
      "example": "disposable_email\\nbulk_login_attack\\nhedged_bet_volume_washing\\nmulti_account_shared_withdrawal_method"
    },
    "features.sync_publish_audit": {
      "label": "Sync /evaluate で audit publish",
      "description": "オン：同期 POST /evaluate 結果も Orchestrator audit 用 RabbitMQ に publish。",
      "example": "Orchestrator が async event と同じ pipeline で sync API 決定を見る必要がある場合オン。"
    },
    "features.decision_cache_ttl_seconds": {
      "label": "Decision cache TTL（秒）",
      "description": "同一 event_id 決定を Redis にキャッシュして重複 re-scoring を回避。Redis 有効が必要。",
      "example": "300 — 5 分以内の同一 event_id はキャッシュ決定を返す；0 = 無効。"
    },
    "features.redis_enabled": {
      "label": "Redis 有効",
      "description": "velocity counter、hedge/betting store、オプション decision cache に Redis を使用。",
      "example": "単一インスタンス dev（メモリ counter）はオフ；production multi-instance はオン。"
    },
    "features.redis_velocity_ip_ttl": {
      "label": "Redis IP velocity TTL",
      "description": "Redis の IP velocity key の sliding window 長（秒）。",
      "example": "3600 — login_ip_high が過去 1 時間の 1 IP からの login をカウント。"
    },
    "features.redis_velocity_domain_ttl": {
      "label": "Redis domain velocity TTL",
      "description": "email domain signup velocity counter の sliding window 長。",
      "example": "86400 — signup_domain_* が 24h で domain あたり signup をカウント。"
    },
    "features.rabbitmq_enabled": {
      "label": "RabbitMQ consumer 有効",
      "description": "casino platform exchange/queue から event をスコアリングする async consumer を開始。",
      "example": "platform が casino.events に wallet.bet、player.login 等を publish する場合オン。"
    },
    "features.rabbitmq_publish_results": {
      "label": "Orchestrator に results publish",
      "description": "async scoring 後に scored EvaluateResponse メッセージを results queue に publish。",
      "example": "Orchestrator が audit/action 用に risk.results を subscribe する場合オン。"
    },
    "features.rabbitmq_events_exchange": {
      "label": "Events exchange",
      "description": "casino platform が publish する topic exchange。空 = legacy direct queue mode。",
      "example": "casino.events"
    },
    "features.rabbitmq_events_exchange_type": {
      "label": "Exchange type",
      "description": "AFS consumer が declare/bind する RabbitMQ exchange type。",
      "example": "topic"
    },
    "features.rabbitmq_events_queue": {
      "label": "Events queue",
      "description": "platform exchange に bind 後 AFS が consume する queue。",
      "example": "casino.afs"
    },
    "features.rabbitmq_events_binding_key": {
      "label": "Binding key",
      "description": "queue binding 用 routing key パターン。# = exchange 上のすべての message。",
      "example": "# — すべての event；player.* — player routing key のみ。"
    },
    "features.rabbitmq_prefetch": {
      "label": "Prefetch count",
      "description": "consumer channel あたりの最大 unacknowledged message。",
      "example": "10 — 保守的；50 — より高い throughput、より多い memory。"
    },
    "features.rabbitmq_results_queue": {
      "label": "Results queue",
      "description": "scored async result の outbound queue name。",
      "example": "risk.results"
    },
    "logging.sync_enabled": {
      "label": "Sync request/response logging",
      "description": "POST /evaluate の完全 request/response payload を Postgres に保存。下の Log viewer で確認。",
      "example": "統合テスト中に有効化；高 volume production で storage が懸念なら無効化。"
    },
    "logging.async_enabled": {
      "label": "Async request/response logging",
      "description": "利用可能な場合 payload 付きで RabbitMQ scored/skipped/rejected/failed message を保存。",
      "example": "container log を tail せず casino.events → AFS pipeline をデバッグする場合有効化。"
    }
  },
  "it": {
    "decision_thresholds.challenge": {
      "label": "Soglia challenge",
      "description": "Punteggio minimo per rischio medio. L'esito è di solito challenge (Turnstile, MFA, revisione manuale) invece di allow.",
      "example": "40 — un giocatore con punteggio 39 riceve allow; punteggio 40+ è challenge salvo che un signal di blocco rigido sia scattato."
    },
    "decision_thresholds.high": {
      "label": "Soglia alta",
      "description": "Punteggio minimo per rischio alto. Login/signup spesso bloccati; deposit/withdraw/bet possono bloccare o richiedere controlli aggiuntivi.",
      "example": "61 — punteggio 60 resta medio/challenge; punteggio 61+ è rischio alto."
    },
    "decision_thresholds.block": {
      "label": "Soglia block (critico)",
      "description": "Punteggio minimo per rischio critico. Di solito comporta block salvo che un signal nella scheda Decision abbia già forzato block.",
      "example": "85 — punteggio 84 può restare alto; punteggio 85+ è critico/block."
    },
    "operator.platform_name": {
      "label": "Nome piattaforma",
      "description": "Etichetta interna di questa istanza operator. Usata in log e voci di audit — non inviata ai giocatori.",
      "example": "DoveBet EU",
      "signal": "unlicensed_jurisdiction (quando il paese non è nei mercati licenziati)"
    },
    "operator.licensed_markets": {
      "label": "Mercati licenziati",
      "description": "Codici paese ISO 3166-1 alpha-2 dove si detiene licenza di gioco. Verificati su signup, deposit e bet usando paese giocatore o geo IP.",
      "example": "DE,GB,MT,SE — giocatore da FR senza licenza attiva unlicensed_jurisdiction.",
      "signal": "unlicensed_jurisdiction"
    },
    "ip_intel.enabled": {
      "label": "Attivato",
      "description": "Interruttore principale. Disattivato: nessuna lookup IP esterna e nessun signal vpn/proxy/tor/hosting emesso.",
      "example": "Disattivato in dev locale se non si vogliono chiamate API in uscita.",
      "signal": "vpn_detected, proxy_detected, tor_exit_node, hosting_provider_ip"
    },
    "ip_intel.cache_ttl_seconds": {
      "label": "TTL cache (secondi)",
      "description": "Quanto tempo ogni risultato lookup IP resta in cache su Redis o memoria prima di un nuovo fetch.",
      "example": "3600 — stesso IP controllato una volta all'ora; cambi VPN possono ritardare fino a 1 ora."
    },
    "ip_intel.timeout_seconds": {
      "label": "Timeout lookup (secondi)",
      "description": "Attesa massima per richiesta API IP esterna. Influenza latenza evaluate in cache miss.",
      "example": "2.0 — fail o fail-open rapido; 5.0 — più tempo per API lente."
    },
    "ip_intel.fail_open": {
      "label": "Fail open su errore lookup",
      "description": "Attivo: timeout/errore API non aggiunge rischio. Disattivo: fallimento lookup trattato come sospetto (VPN/proxy presunto).",
      "example": "Attivo in production se downtime API IP non deve bloccare login; disattivo per comportamento rigoroso."
    },
    "aml.single_deposit_threshold": {
      "label": "Revisione deposito singolo",
      "description": "Un payment.deposit pari o superiore a questo importo attiva compliance review tier 1.",
      "example": "2000 — deposito di €2.000 attiva elevated_deposit_aml_review.",
      "signal": "elevated_deposit_aml_review"
    },
    "aml.large_deposit_threshold": {
      "label": "Revisione deposito grande",
      "description": "Tier AML deposito più alto — per depositi singoli molto grandi.",
      "example": "10000 — deposito di €10.000 attiva large_deposit_aml_review.",
      "signal": "large_deposit_aml_review"
    },
    "aml.withdrawal_review_threshold": {
      "label": "Revisione prelievo",
      "description": "Un payment.withdraw pari o superiore a questo importo attiva signal di revisione cashout.",
      "example": "1000 — prelievo di €1.000 attiva elevated_withdrawal_review e cashout_review_required.",
      "signal": "elevated_withdrawal_review, cashout_review_required"
    },
    "aml.structuring_threshold": {
      "label": "Soglia structuring",
      "description": "Segnala depositi tra il 90% e il 100% di questo importo — schema per restare appena sotto i limiti di segnalazione.",
      "example": "3000 — deposito di €2.850 (95% di 3000) attiva structuring_threshold_deposit.",
      "signal": "structuring_threshold_deposit"
    },
    "aml.micro_deposit_max": {
      "label": "Micro deposito max",
      "description": "Depositi strettamente inferiori a questo importo attivano rilevamento bonus-farming / test pagamento.",
      "example": "10 — deposito di €5 attiva micro_deposit_bonus_farming.",
      "signal": "micro_deposit_bonus_farming"
    },
    "aml.high_stake_bet_threshold": {
      "label": "Scommessa ad alto importo",
      "description": "Un wallet.bet / game.bet pari o superiore a questo importo. Scommesse oltre €100 (regola engine fissa) attivano anche elevated_stake_bet.",
      "example": "500 — scommessa di €500 attiva high_stake_bet.",
      "signal": "high_stake_bet, elevated_stake_bet"
    },
    "aml.blocklist.enabled": {
      "label": "Screening blocklist attivato",
      "description": "Interruttore principale per tutti gli engine blocklist AML (crypto, banca, paese, ecc.).",
      "example": "Disattivato solo se i controlli blocklist sono eseguiti interamente fuori AFS."
    },
    "aml.blocklist.crypto_enabled": {
      "label": "Screening wallet crypto",
      "description": "Verifica indirizzi crypto di pagamento su payment.withdraw / payment.deposit contro sync OFAC + lista manuale.",
      "example": "Inviare payment_method_type: crypto e payment_method_key: 0xabc… su evaluate prelievo.",
      "signal": "ofac_sanctioned_wallet, blocklisted_payout_address"
    },
    "aml.blocklist.bank_enabled": {
      "label": "Screening conto bancario",
      "description": "Verifica IBAN/ID conto bancario su pagamenti bancari.",
      "example": "payment_method_type: bank, payment_method_key: DE89370400440532013000",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.ewallet_enabled": {
      "label": "Screening e-wallet",
      "description": "Verifica ID o email e-wallet su pagamenti e-wallet.",
      "example": "payment_method_type: ewallet, payment_method_key: skrill_user@email.com",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.card_enabled": {
      "label": "Screening pagamento carta",
      "description": "Verifica token carta o riferimenti payout su prelievi carta.",
      "example": "payment_method_type: card, payment_method_key: card_token_abc123",
      "signal": "blocklisted_payout_address"
    },
    "aml.blocklist.country_enabled": {
      "label": "Screening blocklist paese",
      "description": "Blocca signup/login/deposit/withdraw quando il paese giocatore corrisponde a sync OFAC, scheda Lists o paesi manuali.",
      "example": "Paese giocatore KP con blocklist paese attiva → blocklisted_country.",
      "signal": "blocklisted_country"
    },
    "aml.blocklist.sync_ofac_crypto_enabled": {
      "label": "Auto-sync wallet crypto OFAC",
      "description": "Scarica quotidianamente indirizzi crypto SDN del Tesoro USA. Richiede HTTPS in uscita dal container Risk.",
      "example": "Usare il pulsante Sync OFAC lists now sotto dopo l'attivazione."
    },
    "aml.blocklist.sync_ofac_countries_enabled": {
      "label": "Auto-sync paesi OFAC",
      "description": "Carica codici ISO paesi sanzionati derivati dal Tesoro in Postgres a ogni sync.",
      "example": "Esegue su programmazione (intervallo sync) e su sync manuale."
    },
    "aml.blocklist.sync_interval_hours": {
      "label": "Intervallo sync (ore)",
      "description": "Frequenza con cui il job in background aggiorna liste crypto e paesi OFAC.",
      "example": "24 — sync una volta al giorno; 6 per aggiornamenti più frequenti."
    },
    "aml.blocklist.fail_open": {
      "label": "Fail open se sync non disponibile",
      "description": "Attivo: DB blocklist vuoto/obsoleto non blocca payout. Disattivo: dati sync mancanti = rischio alto.",
      "example": "Attivo per resilienza production; disattivo per massima conformità rigorosa."
    },
    "aml.blocklist.use_lists_sanctioned_countries": {
      "label": "Includi paesi sanzionati scheda Lists",
      "description": "Unisce Lists → sanctioned countries nei controlli blocklist paese (oltre a sync OFAC e manuale).",
      "example": "Aggiungere IR in scheda Lists + attivare → giocatori iraniani attivano sanctioned_country.",
      "signal": "sanctioned_country"
    },
    "aml.blocklist.crypto_hit_score": {
      "label": "Punteggio hit blocklist payout",
      "description": "Punteggio rischio aggiunto quando una destinazione payout (crypto/banca/e-wallet/carta) corrisponde a voce blocklist.",
      "example": "90 — di solito spinge la decisione verso block combinato con altri signal."
    },
    "aml.blocklist.country_hit_score": {
      "label": "Punteggio hit blocklist paese",
      "description": "Punteggio rischio quando il paese giocatore corrisponde alla blocklist.",
      "example": "90 — predefinito; abbassare a 70 se si preferisce challenge invece di block."
    },
    "aml.blocklist.manual_crypto_wallets": {
      "label": "Wallet crypto manuali",
      "description": "Indirizzi wallet aggiuntivi da bloccare — uno per riga. Verificati su payout crypto oltre a sync OFAC.",
      "example": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    "aml.blocklist.manual_bank_accounts": {
      "label": "Conti bancari manuali",
      "description": "IBAN o identificatori conto bancario da bloccare — uno per riga.",
      "example": "DE89370400440532013000\\nGB82WEST12345698765432"
    },
    "aml.blocklist.manual_ewallet_accounts": {
      "label": "Conti e-wallet manuali",
      "description": "ID o email e-wallet da bloccare — uno per riga.",
      "example": "skrill:fraud_ring_01\\nneteller:abuse@test.com"
    },
    "aml.blocklist.manual_card_accounts": {
      "label": "Pagamenti carta manuali",
      "description": "Token carta o riferimenti payout da bloccare — uno per riga.",
      "example": "card_token_stolen_batch_42\\nvisa_payout_ref_99102"
    },
    "aml.blocklist.manual_countries": {
      "label": "Paesi blocklist manuali",
      "description": "Codici ISO 3166-1 alpha-2 da bloccare — uno per riga. Uniti con sync OFAC e scheda Lists.",
      "example": "IR\\nKP\\nSY",
      "signal": "blocklisted_country"
    },
    "withdrawal_method.enabled": {
      "label": "Attivato",
      "description": "Disattivato: controlli destinazione payout condivisa ignorati.",
      "example": "Richiede payment_method_type + payment_method_key su ogni evaluate payment.withdraw.",
      "signal": "shared_withdrawal_method, multiple_accounts_shared_payout_method, multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_medium": {
      "label": "Utenti distinti (medio)",
      "description": "Quanti user_id distinti devono prelevare sulla stessa payout key prima che scatti il tier medio.",
      "example": "2 — utente A e B prelevano su IBAN DE89… → shared_withdrawal_method.",
      "signal": "shared_withdrawal_method"
    },
    "withdrawal_method.distinct_users_high": {
      "label": "Utenti distinti (alto)",
      "description": "Soglia utenti distinti per abuso payout multi-account tier alto.",
      "example": "3 — tre account condividono una email Skrill.",
      "signal": "multiple_accounts_shared_payout_method"
    },
    "withdrawal_method.distinct_users_critical": {
      "label": "Utenti distinti (critico)",
      "description": "Soglia utenti distinti per tier critico — di solito forza block via scheda Decision.",
      "example": "4 — quattro account, stesso wallet crypto → multi_account_shared_withdrawal_method (blocco rigido).",
      "signal": "multi_account_shared_withdrawal_method"
    },
    "withdrawal_method.medium_score": {
      "label": "Punteggio medio",
      "description": "Punteggio rischio aggiunto al raggiungimento soglia media utenti distinti.",
      "example": "35 — combinato con altri engine per raggiungere challenge/high."
    },
    "withdrawal_method.high_score": {
      "label": "Punteggio alto",
      "description": "Punteggio rischio aggiunto al raggiungimento soglia alta utenti distinti.",
      "example": "55"
    },
    "withdrawal_method.critical_score": {
      "label": "Punteggio critico",
      "description": "Punteggio rischio aggiunto al raggiungimento soglia critica utenti distinti.",
      "example": "80 — spesso sufficiente da solo per block se soglia decisione ≤80."
    },
    "betting_patterns.enabled": {
      "label": "Attivato",
      "description": "Interruttore principale per contatori burst sequenziali e controlli rapporto vincite.",
      "example": "Disattivato disabilita tutti i signal in questa scheda."
    },
    "betting_patterns.burst_window_seconds": {
      "label": "Finestra burst (secondi)",
      "description": "Finestra temporale scorrevole per tutti i contatori burst e calcolo rapporto vincite.",
      "example": "300 — 10 game.bets in 5 minuti contano per burst; finestra scorre a ogni evento."
    },
    "betting_patterns.game_bet_burst_medium": {
      "label": "Burst game.bet — medio",
      "description": "Eventi game.bet sequenziali nella finestra prima del signal burst medio.",
      "example": "10 — 10 spin bonus piazzati di seguito entro 300 s.",
      "signal": "sequential_game_bet_burst"
    },
    "betting_patterns.game_bet_burst_high": {
      "label": "Burst game.bet — alto",
      "description": "Conteggio sequenziale game.bet per burst tier alto.",
      "example": "20",
      "signal": "sequential_game_bet_burst (higher score tier)"
    },
    "betting_patterns.game_bet_burst_critical": {
      "label": "Burst game.bet — critico",
      "description": "Conteggio sequenziale game.bet per burst tier critico.",
      "example": "35",
      "signal": "sequential_game_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_bet_burst_medium": {
      "label": "Burst wallet.bet — medio",
      "description": "Eventi wallet.bet (denaro reale) sequenziali nella finestra prima di burst medio.",
      "example": "20 — schema bot scommesse live-casino rapide.",
      "signal": "sequential_wallet_bet_burst"
    },
    "betting_patterns.wallet_bet_burst_high": {
      "label": "Burst wallet.bet — alto",
      "description": "Conteggio sequenziale wallet.bet per tier alto.",
      "example": "40",
      "signal": "sequential_wallet_bet_burst (higher score tier)"
    },
    "betting_patterns.wallet_bet_burst_critical": {
      "label": "Burst wallet.bet — critico",
      "description": "Conteggio sequenziale wallet.bet per tier critico.",
      "example": "60",
      "signal": "sequential_wallet_bet_burst (critical score tier)"
    },
    "betting_patterns.wallet_win_burst_medium": {
      "label": "Burst wallet.win — medio",
      "description": "Crediti wallet.win sequenziali nella finestra prima di burst vincite medio.",
      "example": "8 — molte vincite accreditate in rapida successione.",
      "signal": "sequential_wallet_win_burst"
    },
    "betting_patterns.wallet_win_burst_high": {
      "label": "Burst wallet.win — alto",
      "description": "Conteggio sequenziale wallet.win per tier alto.",
      "example": "15",
      "signal": "sequential_wallet_win_burst (higher score tier)"
    },
    "betting_patterns.wallet_win_burst_critical": {
      "label": "Burst wallet.win — critico",
      "description": "Conteggio sequenziale wallet.win per tier critico.",
      "example": "25",
      "signal": "sequential_wallet_win_burst (critical score tier)"
    },
    "betting_patterns.win_rate_min_bets": {
      "label": "Tasso vincite — scommesse min.",
      "description": "Conteggio minimo wallet.bet + game.bet nella finestra prima di valutare rapporto vincite.",
      "example": "5 — servono almeno 5 scommesse; 4 vincite / 4 scommesse ignorate fino alla 5ª scommessa."
    },
    "betting_patterns.win_rate_high_ratio": {
      "label": "Tasso vincite — rapporto alto",
      "description": "Rapporto vincite ÷ scommesse che attiva signal tasso vincite alto (0–1).",
      "example": "0.75 — 6 vincite su 8 scommesse (75%) nella finestra attiva high_win_rate_in_betting_sequence.",
      "signal": "high_win_rate_in_betting_sequence"
    },
    "betting_patterns.win_rate_critical_ratio": {
      "label": "Tasso vincite — rapporto critico",
      "description": "Rapporto vincite ÷ scommesse per tier critico tasso vincite.",
      "example": "0.90 — 9 vincite su 10 scommesse attiva critical_win_rate_in_betting_sequence.",
      "signal": "critical_win_rate_in_betting_sequence"
    },
    "hedge_betting.enabled": {
      "label": "Attivato",
      "description": "Interruttore principale per rilevamento round coperti e rapporto volume-washing.",
      "example": "Disattivato se non si inviano ancora metadata.game.selection e round_id."
    },
    "hedge_betting.window_seconds": {
      "label": "Finestra statistiche (secondi)",
      "description": "Finestra scorrevole per contare round coperti ripetuti e rapporto volume lordo.",
      "example": "3600 — contare round coperti nell'ultima ora per utente."
    },
    "hedge_betting.round_leg_ttl_seconds": {
      "label": "TTL gamba round (secondi)",
      "description": "Quanto tempo la prima gamba scommessa resta memorizzata in attesa del lato opposto sullo stesso round_id.",
      "example": "600 — scommessa banker alle 12:00:00; scommessa player alle 12:09:59 corrisponde ancora; alle 12:10:01 gamba scade."
    },
    "hedge_betting.time_pair_window_seconds": {
      "label": "Finestra time-pair (secondi)",
      "description": "Raggruppamento fallback quando round_id assente ma table_id presente — scommesse in questa finestra sullo stesso tavolo possono abbinarsi.",
      "example": "15 — usato solo se require_round_id disattivato e round_id assente."
    },
    "hedge_betting.require_round_id": {
      "label": "Richiedi round_id",
      "description": "Attivo: controlli hedge solo se metadata.game.round_id presente. Consigliato quando il backend invia round_id.",
      "example": "Attivo in production — evita falsi positivi del fallback time-pair."
    },
    "hedge_betting.opposite_selection_groups": {
      "label": "Gruppi selection opposti",
      "description": "Array JSON di gruppi. Selection nello stesso array interno sono trattate come opposte nello stesso round.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.amount_match_tolerance_percent": {
      "label": "Tolleranza corrispondenza importo (%)",
      "description": "Gambe opposte devono avere stake entro questa percentuale l'una dall'altra.",
      "example": "10 — banker €1000 + player €950 corrisponde; player €800 no."
    },
    "hedge_betting.opposite_side_same_round_score": {
      "label": "Punteggio — lati opposti stesso round",
      "description": "Punteggio rischio quando viene rilevato un singolo round coperto (lati opposti, importi corrispondenti).",
      "example": "50 — scatta sulla prima coppia banker+player rilevata.",
      "signal": "opposite_side_bets_same_round"
    },
    "hedge_betting.hedged_round_medium": {
      "label": "Round coperti — medio",
      "description": "Round coperti distinti nella finestra statistiche prima del signal pattern ripetuto (tier medio).",
      "example": "3 — tre mani coperte separate in un'ora.",
      "signal": "repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_high": {
      "label": "Round coperti — alto",
      "description": "Round coperti distinti per tier alto.",
      "example": "8",
      "signal": "high_repeated_hedged_rounds"
    },
    "hedge_betting.hedged_round_critical": {
      "label": "Round coperti — critico",
      "description": "Round coperti distinti per tier critico.",
      "example": "15",
      "signal": "critical_hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_enabled": {
      "label": "Controllo volume washing",
      "description": "Attivo: confronta volume scommesse lordo coperto con volume lordo totale nella finestra statistiche.",
      "example": "Giocatore scommette €6000 coperti + €4000 normali in 1 h → 60% quota coperta.",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.min_gross_volume": {
      "label": "Volume washing — lordo min.",
      "description": "Volume scommesse totale minimo nella finestra prima di valutare rapporto volume-washing.",
      "example": "5000 — ignorare rapporto finché il giocatore non ha almeno €5000 scommesse lorde nella finestra."
    },
    "hedge_betting.min_hedged_gross_ratio": {
      "label": "Volume washing — rapporto coperto min.",
      "description": "Rapporto minimo hedged_gross ÷ total_gross (0–1) per attivare signal volume washing.",
      "example": "0.5 — 50% o più del volume lordo coperto → hedged_bet_volume_washing (blocco rigido se in Decision).",
      "signal": "hedged_bet_volume_washing"
    },
    "hedge_betting.volume_washing_score": {
      "label": "Punteggio — volume washing",
      "description": "Punteggio rischio aggiunto al raggiungimento soglia rapporto volume-washing.",
      "example": "55 — combinare con punteggio opposite_side per totale più alto."
    },
    "step_up_verification.enabled": {
      "label": "Attivato",
      "description": "Disattivato: metadata step_up_verification ignorata e esiti challenge non declassati.",
      "example": "Attivo quando il frontend mostra Turnstile sulle risposte challenge."
    },
    "step_up_verification.grant_ttl_days": {
      "label": "Durata grant (giorni)",
      "description": "Quanto dura un grant di verifica riuscito per lo stesso user_id + device fingerprint.",
      "example": "7 — giocatore supera Turnstile una volta; login successivi consentiti 7 giorni sullo stesso dispositivo."
    },
    "step_up_verification.max_verified_age_minutes": {
      "label": "Età max verified_at (minuti)",
      "description": "metadata.verified_at deve essere entro questo numero di minuti dal timestamp richiesta evaluate.",
      "example": "5 — siteverify alle 12:00, evaluate alle 12:06 → grant rifiutato come obsoleto."
    },
    "step_up_verification.downgrade_challenge_to_allow": {
      "label": "Declassa challenge ad allow",
      "description": "Attivo: grant attivo cambia decisione challenge in allow. Non sovrascrive mai block o signal critici.",
      "example": "Attivo — impostazione production tipica dopo passaggio Turnstile."
    },
    "step_up_verification.allowed_hostnames": {
      "label": "Hostnames consentiti",
      "description": "Allowlist opzionale hostname Cloudflare dalla risposta siteverify — uno per riga. Vuoto = salta controllo.",
      "example": "casino.example.com\\nwww.casino.example.com"
    },
    "step_up_verification.applicable_event_types": {
      "label": "Tipi evento applicabili",
      "description": "Tipi evento dove il grant step-up può declassare challenge — uno per riga.",
      "example": "player.login\\nplayer.signup\\npayment.deposit"
    },
    "fingerprint.required_channels": {
      "label": "Canali richiesti",
      "description": "Canali dove context.fingerprint è atteso. Valore mancante su questi canali attiva missing_fingerprint.",
      "example": "web,mobile — signup su web senza visitorId → missing_fingerprint.",
      "signal": "missing_fingerprint"
    },
    "fingerprint.min_length": {
      "label": "Lunghezza min.",
      "description": "Lunghezza minima valida in caratteri del visitorId FingerprintJS.",
      "example": "10 — abc123 (6 caratteri) → malformed_fingerprint.",
      "signal": "malformed_fingerprint"
    },
    "fingerprint.max_length": {
      "label": "Lunghezza max.",
      "description": "Lunghezza massima valida del visitorId. Valori fuori min–max rifiutati.",
      "example": "64",
      "signal": "malformed_fingerprint, invalid_fingerprint"
    },
    "fingerprint.suspicious_values": {
      "label": "Valori sospetti",
      "description": "Stringhe fingerprint false o placeholder note — una per riga. Corrispondenza esatta fallisce validazione.",
      "example": "undefined\\nnull\\n00000000-0000-0000-0000-000000000000",
      "signal": "invalid_fingerprint"
    },
    "lists.disposable_domains": {
      "label": "Domini email usa e getta",
      "description": "Domini provider email temporanei. Signup con questi domini di solito hard-blocked.",
      "example": "mailinator.com\\n10minutemail.com\\nguerrillamail.com",
      "signal": "disposable_email"
    },
    "lists.high_risk_countries": {
      "label": "Paesi ad alto rischio",
      "description": "Codici paese ISO con tassi frode elevati. Aggiunge punteggio su controlli geo/IP — non blocco automatico.",
      "example": "NG\\nGH\\nPK",
      "signal": "high_risk_country"
    },
    "lists.sanctioned_countries": {
      "label": "Paesi sanzionati",
      "description": "Codici ISO giurisdizioni sanzionate o gioco vietato. Usati quando blocklist AML include scheda Lists.",
      "example": "IR\\nKP\\nCU",
      "signal": "sanctioned_country"
    },
    "lists.generic_names": {
      "label": "Nomi generici",
      "description": "Nomi visualizzati placeholder su signup/identità — uno per riga, senza distinzione maiuscole.",
      "example": "test\\nuser\\nadmin\\nPlayer",
      "signal": "generic_name"
    },
    "lists.role_based_email_locals": {
      "label": "Local part email per ruolo",
      "description": "Parti locali email (prima di @) che indicano account non personali.",
      "example": "admin\\nsupport\\ninfo\\nnoreply",
      "signal": "role_based_email"
    },
    "lists.suspicious_email_tlds": {
      "label": "TLD email sospetti",
      "description": "Domini di primo livello associati a spam. Corrispondenza quando email termina con questi TLD.",
      "example": ".xyz\\n.top\\n.click",
      "signal": "suspicious_email_tld"
    },
    "lists.suspicious_email_local_tokens": {
      "label": "Token local email sospetti",
      "description": "Sottostringhe nella parte locale email che suggeriscono account usa e getta o bot.",
      "example": "temp\\nspam\\nbot\\nfake",
      "signal": "suspicious_email_pattern"
    },
    "lists.bot_user_agent_tokens": {
      "label": "Token User-Agent bot",
      "description": "Sottostringhe nell'header User-Agent che indicano script o automazione.",
      "example": "curl\\npython-requests\\nheadless\\nscrapy",
      "signal": "bot_user_agent"
    },
    "lists.emulator_ua_tokens": {
      "label": "Token UA emulatore",
      "description": "Pattern User-Agent per emulatori Android o dispositivi virtuali.",
      "example": "genymotion\\nbluestacks\\nsdk_gphone",
      "signal": "emulator_detected"
    },
    "lists.suspicious_referrers": {
      "label": "Referrer sospetti",
      "description": "Valori referrer esatti trattati come bassa fiducia su signup.",
      "example": "direct\\nunknown\\n(riga vuota per referrer blank)",
      "signal": "suspicious_referrer"
    },
    "lists.bonus_abuse_referrer_tokens": {
      "label": "Token referrer abuso bonus",
      "description": "Sottostringhe nell'URL referrer signup collegate a caccia bonus o abuso affiliati.",
      "example": "free-spins\\nno-deposit\\nbonus-hunter",
      "signal": "bonus_abuse_referrer"
    },
    "velocity_thresholds": {
      "label": "Soglie velocity (JSON)",
      "description": "Mappa nome soglia → conteggio max. Suffisso _medium/_high/_critical seleziona tier. Non eliminare chiavi — gli engine si aspettano l'insieme completo.",
      "example": "{\\n  \"login_ip_medium\": 5,\\n  \"login_ip_high\": 15,\\n  \"login_ip_critical\": 30,\\n  \"signup_ip_critical\": 10,\\n  \"deposit_user_high\": 6\\n}",
      "signal": "medium_login_ip_velocity, bulk_login_attack, bulk_signup_attack, rapid_deposit_activity, …"
    },
    "critical_signals": {
      "label": "Signal blocco rigido",
      "description": "Stringhe esatte nomi signal emessi dagli engine — una per riga. Maiuscole/minuscole devono corrispondere esattamente.",
      "example": "disposable_email\\nbulk_login_attack\\nhedged_bet_volume_washing\\nmulti_account_shared_withdrawal_method"
    },
    "features.sync_publish_audit": {
      "label": "Pubblica audit su sync /evaluate",
      "description": "Attivo: risultati POST /evaluate sincroni pubblicati anche su RabbitMQ per audit Orchestrator.",
      "example": "Attivo quando Orchestrator deve vedere decisioni API sync nello stesso pipeline degli eventi async."
    },
    "features.decision_cache_ttl_seconds": {
      "label": "TTL cache decisione (secondi)",
      "description": "Mette in cache decisioni event_id identiche su Redis per evitare re-scoring duplicati. Richiede Redis attivato.",
      "example": "300 — stesso event_id entro 5 minuti restituisce decisione in cache; 0 = disattivato."
    },
    "features.redis_enabled": {
      "label": "Redis attivato",
      "description": "Usa Redis per contatori velocity, store hedge/betting e cache decisione opzionale.",
      "example": "Disattivato per dev istanza singola (contatori memoria); attivo per production multi-istanza."
    },
    "features.redis_velocity_ip_ttl": {
      "label": "TTL velocity IP Redis",
      "description": "Lunghezza finestra scorrevole (secondi) per chiavi velocity IP in Redis.",
      "example": "3600 — login_ip_high conta login da un IP nell'ultima ora."
    },
    "features.redis_velocity_domain_ttl": {
      "label": "TTL velocity dominio Redis",
      "description": "Lunghezza finestra scorrevole per contatori velocity signup per dominio email.",
      "example": "86400 — signup_domain_* conta signup per dominio in 24 h."
    },
    "features.rabbitmq_enabled": {
      "label": "Consumer RabbitMQ attivato",
      "description": "Avvia consumer async che valuta eventi dall'exchange/coda piattaforma casino.",
      "example": "Attivo quando la piattaforma pubblica wallet.bet, player.login, ecc. su casino.events."
    },
    "features.rabbitmq_publish_results": {
      "label": "Pubblica risultati su Orchestrator",
      "description": "Pubblica messaggi EvaluateResponse valutati sulla coda risultati dopo scoring async.",
      "example": "Attivo quando Orchestrator è iscritto a risk.results per audit/azioni."
    },
    "features.rabbitmq_events_exchange": {
      "label": "Exchange eventi",
      "description": "Topic exchange su cui la piattaforma casino pubblica. Vuoto = modalità coda diretta legacy.",
      "example": "casino.events"
    },
    "features.rabbitmq_events_exchange_type": {
      "label": "Tipo exchange",
      "description": "Tipo exchange RabbitMQ dichiarato/collegato dal consumer AFS.",
      "example": "topic"
    },
    "features.rabbitmq_events_queue": {
      "label": "Coda eventi",
      "description": "Coda da cui AFS consuma dopo binding all'exchange piattaforma.",
      "example": "casino.afs"
    },
    "features.rabbitmq_events_binding_key": {
      "label": "Binding key",
      "description": "Pattern routing key per binding coda. # = tutti i messaggi sull'exchange.",
      "example": "# — tutti gli eventi; player.* — solo routing key player."
    },
    "features.rabbitmq_prefetch": {
      "label": "Prefetch count",
      "description": "Max messaggi non confermati per canale consumer.",
      "example": "10 — conservativo; 50 — throughput più alto, più memoria."
    },
    "features.rabbitmq_results_queue": {
      "label": "Coda risultati",
      "description": "Nome coda in uscita per risultati async valutati.",
      "example": "risk.results"
    },
    "logging.sync_enabled": {
      "label": "Logging richiesta/risposta sync",
      "description": "Memorizza payload completi richiesta e risposta per POST /evaluate in Postgres. Vedi Log viewer sotto.",
      "example": "Attivare durante test integrazione; disattivare in production ad alto volume se lo storage è un problema."
    },
    "logging.async_enabled": {
      "label": "Logging richiesta/risposta async",
      "description": "Memorizza messaggi RabbitMQ valutati/saltati/rifiutati/falliti con payload dove disponibili.",
      "example": "Attivare per debug pipeline casino.events → AFS senza seguire log container."
    }
  }
};

  function fieldText(path, key, fallback) {
    const locale = window.AdminI18n ? AdminI18n.getLocale() : "en";
    const bundle = FIELD_BUNDLES[locale] || FIELD_BUNDLES.en;
    const entry = bundle[path];
    if (entry && entry[key] != null && entry[key] !== "") {
      return entry[key];
    }
    const enEntry = FIELD_BUNDLES.en[path];
    if (enEntry && enEntry[key] != null && enEntry[key] !== "") {
      return enEntry[key];
    }
    return fallback;
  }

  function localizeField(field) {
    if (!field || !field.path) {
      return field;
    }
    return {
      ...field,
      label: fieldText(field.path, "label", field.label),
      description: fieldText(field.path, "description", field.description),
      example: fieldText(field.path, "example", field.example),
      signal: fieldText(field.path, "signal", field.signal),
    };
  }

  window.AdminI18n = window.AdminI18n || {};
  AdminI18n.fieldText = fieldText;
  AdminI18n.localizeField = localizeField;
})();
