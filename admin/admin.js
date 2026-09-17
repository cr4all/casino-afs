const STORAGE_KEY = "afs_admin_api_key";

const TAB_SECTIONS = [
  {
    id: "decision",
    label: "Decision",
    description:
      "Maps the aggregated risk score (0–100) to risk levels and drives allow / challenge / block outcomes. Lower thresholds = stricter. Hard-block signals listed below force block regardless of total score.",
    fields: [
      {
        path: "decision_thresholds.challenge",
        label: "Challenge threshold",
        type: "number",
        description:
          "Minimum score for medium risk. Outcome is usually challenge (Turnstile, MFA, manual review) instead of allow.",
        example: "40 — a player with score 39 is allow; score 40+ is challenge unless a hard-block signal fired.",
      },
      {
        path: "decision_thresholds.high",
        label: "High threshold",
        type: "number",
        description:
          "Minimum score for high risk. Login/signup often block; deposits/withdrawals/bets may block or need extra checks.",
        example: "61 — score 60 stays medium/challenge; score 61+ is high risk.",
      },
      {
        path: "decision_thresholds.block",
        label: "Block threshold (critical)",
        type: "number",
        description:
          "Minimum score for critical risk. Usually results in block unless a hard-block signal on this tab already forced block.",
        example: "85 — score 84 may still be high; score 85+ is critical/block.",
      },
      {
        path: "critical_signals",
        label: "Hard-block signals",
        type: "textarea",
        list: true,
        description: "Exact signal name strings emitted by engines — one per line. Must match case exactly.",
        example: "disposable_email\nbulk_login_attack\nhedged_bet_volume_washing\nmulti_account_shared_withdrawal_method",
      },
    ],
  },
  {
    id: "operator",
    label: "Operator",
    description:
      "Your casino operator context. Licensed markets define where players are allowed to sign up, deposit, and bet. Events from unlisted countries raise unlicensed_jurisdiction.",
    fields: [
      {
        path: "operator.platform_name",
        label: "Platform name",
        type: "text",
        description: "Internal label for this operator instance. Used in logs and audit entries — not sent to players.",
        example: "DoveBet EU",
        signal: "unlicensed_jurisdiction (when country not in licensed markets)",
      },
      {
        path: "operator.licensed_markets",
        label: "Licensed markets",
        type: "countries",
        countryFormat: "csv",
        description:
          "Countries where you hold a gambling licence. Checked on signup, deposit, and bet events using player country or IP geo.",
        example: "Select DE, GB, MT, SE — a player from FR with no licence raises unlicensed_jurisdiction.",
        signal: "unlicensed_jurisdiction",
      },
    ],
  },
  {
    id: "ip_intel",
    label: "IP Intelligence",
    description:
      "Free-tier VPN/proxy/Tor/hosting detection via public IP APIs. Runs on login, signup, withdrawal, and other events that include context.ip.",
    fields: [
      {
        path: "ip_intel.enabled",
        label: "Enabled",
        type: "checkbox",
        description: "Master toggle. When off, no external IP lookups run and no vpn/proxy/tor/hosting signals are emitted.",
        example: "Off during local dev if you don't want outbound API calls.",
        signal: "vpn_detected, proxy_detected, tor_exit_node, hosting_provider_ip",
      },
      {
        path: "ip_intel.cache_ttl_seconds",
        label: "Cache TTL (seconds)",
        type: "number",
        description: "How long each IP lookup result is cached in Redis or memory before re-fetching.",
        example: "3600 — same IP checked once per hour; lowers API usage but VPN toggles may lag up to 1 hour.",
      },
      {
        path: "ip_intel.timeout_seconds",
        label: "Lookup timeout (seconds)",
        type: "number",
        step: "0.1",
        description: "Max wait per external IP API request. Affects evaluate latency when cache misses.",
        example: "2.0 — fail or fail-open quickly; 5.0 — more time for slow APIs.",
      },
      {
        path: "ip_intel.fail_open",
        label: "Fail open on lookup error",
        type: "checkbox",
        description:
          "When on, API timeout/error does not add risk. When off, lookup failure is treated as suspicious (VPN/proxy suspected).",
        example: "On in production if IP API downtime must not block logins; off if you prefer strict behaviour.",
      },
    ],
  },
  {
    id: "aml",
    label: "AML & Transactions",
    description:
      "Amount-based AML rules and payout blocklists. Amounts use major currency units (EUR by default). Blocklist checks need transaction.payment_method_type and payment_method_key on payment events.",
    fields: [
      {
        path: "aml.single_deposit_threshold",
        label: "Single deposit review",
        type: "number",
        description: "Single payment.deposit at or above this amount triggers compliance review tier 1.",
        example: "2000 — deposit of €2,000 raises elevated_deposit_aml_review.",
        signal: "elevated_deposit_aml_review",
      },
      {
        path: "aml.large_deposit_threshold",
        label: "Large deposit review",
        type: "number",
        description: "Highest deposit AML tier — for very large single deposits.",
        example: "10000 — deposit of €10,000 raises large_deposit_aml_review.",
        signal: "large_deposit_aml_review",
      },
      {
        path: "aml.withdrawal_review_threshold",
        label: "Withdrawal review",
        type: "number",
        description: "Single payment.withdraw at or above this amount triggers cashout review signals.",
        example: "1000 — withdrawal of €1,000 raises elevated_withdrawal_review and cashout_review_required.",
        signal: "elevated_withdrawal_review, cashout_review_required",
      },
      {
        path: "aml.structuring_threshold",
        label: "Structuring threshold",
        type: "number",
        description:
          "Flags deposits between 90% and 100% of this amount — pattern used to stay just under reporting limits.",
        example: "3000 — deposit of €2,850 (95% of 3000) raises structuring_threshold_deposit.",
        signal: "structuring_threshold_deposit",
      },
      {
        path: "aml.micro_deposit_max",
        label: "Micro deposit max",
        type: "number",
        description: "Deposits strictly below this amount trigger bonus-farming / payment-testing detection.",
        example: "10 — deposit of €5 raises micro_deposit_bonus_farming.",
        signal: "micro_deposit_bonus_farming",
      },
      {
        path: "aml.high_stake_bet_threshold",
        label: "High stake bet",
        type: "number",
        description: "Single wallet.bet / game.bet at or above this amount. Bets above €100 (fixed engine rule) also raise elevated_stake_bet.",
        example: "500 — bet of €500 raises high_stake_bet.",
        signal: "high_stake_bet, elevated_stake_bet",
      },
      {
        path: "aml.blocklist.enabled",
        label: "Blocklist screening enabled",
        type: "checkbox",
        description: "Master toggle for all AML blocklist engines (crypto, bank, country, etc.).",
        example: "Off only if you run blocklist checks entirely outside AFS.",
      },
      {
        path: "aml.blocklist.crypto_enabled",
        label: "Crypto wallet screening",
        type: "checkbox",
        description: "Check crypto payout addresses on payment.withdraw / payment.deposit against OFAC sync + manual list.",
        example: "Send payment_method_type: crypto and payment_method_key: 0xabc… on withdraw evaluate.",
        signal: "ofac_sanctioned_wallet, blocklisted_payout_address",
      },
      {
        path: "aml.blocklist.bank_enabled",
        label: "Bank account screening",
        type: "checkbox",
        description: "Check IBAN/bank account ids on bank payouts.",
        example: "payment_method_type: bank, payment_method_key: DE89370400440532013000",
        signal: "blocklisted_payout_address",
      },
      {
        path: "aml.blocklist.ewallet_enabled",
        label: "E-wallet screening",
        type: "checkbox",
        description: "Check e-wallet ids or emails on e-wallet payouts.",
        example: "payment_method_type: ewallet, payment_method_key: skrill_user@email.com",
        signal: "blocklisted_payout_address",
      },
      {
        path: "aml.blocklist.card_enabled",
        label: "Card payout screening",
        type: "checkbox",
        description: "Check card tokens or payout references on card withdrawals.",
        example: "payment_method_type: card, payment_method_key: card_token_abc123",
        signal: "blocklisted_payout_address",
      },
      {
        path: "aml.blocklist.country_enabled",
        label: "Country blocklist screening",
        type: "checkbox",
        description: "Block signup/login/deposit/withdraw when player country matches OFAC sync, Lists tab, or manual countries.",
        example: "Player country KP with country blocklist enabled → blocklisted_country.",
        signal: "blocklisted_country",
      },
      {
        path: "aml.blocklist.sync_ofac_crypto_enabled",
        label: "Auto-sync OFAC crypto wallets",
        type: "checkbox",
        description: "Pull U.S. Treasury SDN crypto addresses daily. Requires outbound HTTPS from Risk container.",
        example: "Use Sync OFAC lists now button below after enabling.",
      },
      {
        path: "aml.blocklist.sync_ofac_countries_enabled",
        label: "Auto-sync OFAC countries",
        type: "checkbox",
        description: "Load Treasury-derived sanctioned country ISO codes into Postgres on each sync.",
        example: "Runs on schedule (sync interval) and on manual sync.",
      },
      {
        path: "aml.blocklist.sync_interval_hours",
        label: "Sync interval (hours)",
        type: "number",
        description: "How often the background job refreshes OFAC crypto and country lists.",
        example: "24 — sync once per day; 6 for more frequent updates.",
      },
      {
        path: "aml.blocklist.fail_open",
        label: "Fail open if sync unavailable",
        type: "checkbox",
        description: "When on, empty/stale blocklist DB does not block payouts. When off, missing sync data is treated as high risk.",
        example: "On for production resilience; off for maximum compliance strictness.",
      },
      {
        path: "aml.blocklist.use_lists_sanctioned_countries",
        label: "Include Lists tab sanctioned countries",
        type: "checkbox",
        description: "Merge Lists → sanctioned countries into country blocklist checks (in addition to OFAC sync and manual).",
        example: "Add IR in Lists tab + enable this → Iranian players hit sanctioned_country.",
        signal: "sanctioned_country",
      },
      {
        path: "aml.blocklist.crypto_hit_score",
        label: "Payout blocklist hit score",
        type: "number",
        description: "Risk score added when any payout destination (crypto/bank/e-wallet/card) matches a blocklist entry.",
        example: "90 — usually pushes decision toward block when combined with other signals.",
      },
      {
        path: "aml.blocklist.country_hit_score",
        label: "Country blocklist hit score",
        type: "number",
        description: "Risk score when player country matches blocklist.",
        example: "90 — default; lower to 70 if you prefer challenge over block.",
      },
      {
        path: "aml.blocklist.manual_crypto_wallets",
        label: "Manual crypto wallets",
        type: "textarea",
        list: true,
        description: "Extra wallet addresses to block — one per line. Checked on crypto payouts in addition to OFAC sync.",
        example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      },
      {
        path: "aml.blocklist.manual_bank_accounts",
        label: "Manual bank accounts",
        type: "textarea",
        list: true,
        description: "IBANs or bank account identifiers to block — one per line.",
        example: "DE89370400440532013000\nGB82WEST12345698765432",
      },
      {
        path: "aml.blocklist.manual_ewallet_accounts",
        label: "Manual e-wallet accounts",
        type: "textarea",
        list: true,
        description: "E-wallet ids or emails to block — one per line.",
        example: "skrill:fraud_ring_01\nneteller:abuse@test.com",
      },
      {
        path: "aml.blocklist.manual_card_accounts",
        label: "Manual card payouts",
        type: "textarea",
        list: true,
        description: "Card tokens or payout references to block — one per line.",
        example: "card_token_stolen_batch_42\nvisa_payout_ref_99102",
      },
      {
        path: "aml.blocklist.manual_countries",
        label: "Manual blocklisted countries",
        type: "countries",
        description: "Countries to block on signup/login/deposit/withdraw. Merged with OFAC sync and Lists tab.",
        example: "Select IR, KP, SY — players from those countries hit blocklisted_country when screening is on.",
        signal: "blocklisted_country",
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
        description: "When off, shared payout destination checks are skipped.",
        example: "Requires payment_method_type + payment_method_key on every payment.withdraw evaluate.",
        signal: "shared_withdrawal_method, multiple_accounts_shared_payout_method, multi_account_shared_withdrawal_method",
      },
      {
        path: "withdrawal_method.distinct_users_medium",
        label: "Distinct users (medium)",
        type: "number",
        description: "How many different user_ids must withdraw to the same payout key before medium tier fires.",
        example: "2 — user A and user B both withdraw to IBAN DE89… → shared_withdrawal_method.",
        signal: "shared_withdrawal_method",
      },
      {
        path: "withdrawal_method.distinct_users_high",
        label: "Distinct users (high)",
        type: "number",
        description: "Distinct users threshold for high tier multi-account payout abuse.",
        example: "3 — three accounts sharing one Skrill email.",
        signal: "multiple_accounts_shared_payout_method",
      },
      {
        path: "withdrawal_method.distinct_users_critical",
        label: "Distinct users (critical)",
        type: "number",
        description: "Distinct users threshold for critical tier — usually forces block when listed as a hard-block signal on the Decision tab.",
        example: "4 — four accounts, same crypto wallet → multi_account_shared_withdrawal_method (hard block).",
        signal: "multi_account_shared_withdrawal_method",
      },
      {
        path: "withdrawal_method.medium_score",
        label: "Medium score",
        type: "number",
        description: "Risk score added when distinct-users medium threshold is reached.",
        example: "35 — combined with other engines to reach challenge/high.",
      },
      {
        path: "withdrawal_method.high_score",
        label: "High score",
        type: "number",
        description: "Risk score added when distinct-users high threshold is reached.",
        example: "55",
      },
      {
        path: "withdrawal_method.critical_score",
        label: "Critical score",
        type: "number",
        description: "Risk score added when distinct-users critical threshold is reached.",
        example: "80 — often enough alone to block if decision threshold is ≤80.",
      },
    ],
  },
  {
    id: "betting_patterns",
    label: "Betting patterns",
    description:
      "Detect rapid sequential betting and suspicious win streaks in a rolling window. game.bet = bonus/free-spin bets; wallet.bet = real-money bets; wallet.win = win credits. Win-rate compares wins to recent bets in the same window.",
    fields: [
      {
        path: "betting_patterns.enabled",
        label: "Enabled",
        type: "checkbox",
        description: "Master toggle for sequential burst counters and win-rate ratio checks.",
        example: "Off disables all signals in this tab.",
      },
      {
        path: "betting_patterns.burst_window_seconds",
        label: "Burst window (seconds)",
        type: "number",
        description: "Rolling time window for all burst counters and win-rate calculation.",
        example: "300 — 10 game.bets in 5 minutes counts toward burst; window slides on each event.",
      },
      {
        path: "betting_patterns.game_bet_burst_medium",
        label: "game.bet burst — medium",
        type: "number",
        description: "Sequential game.bet events in window before medium burst signal.",
        example: "10 — 10 bonus spins placed back-to-back within 300s.",
        signal: "sequential_game_bet_burst",
      },
      {
        path: "betting_patterns.game_bet_burst_high",
        label: "game.bet burst — high",
        type: "number",
        description: "Sequential game.bet count for high tier burst.",
        example: "20",
        signal: "sequential_game_bet_burst (higher score tier)",
      },
      {
        path: "betting_patterns.game_bet_burst_critical",
        label: "game.bet burst — critical",
        type: "number",
        description: "Sequential game.bet count for critical tier burst.",
        example: "35",
        signal: "sequential_game_bet_burst (critical score tier)",
      },
      {
        path: "betting_patterns.wallet_bet_burst_medium",
        label: "wallet.bet burst — medium",
        type: "number",
        description: "Sequential wallet.bet (real-money) events in window before medium burst.",
        example: "20 — rapid live-casino betting bot pattern.",
        signal: "sequential_wallet_bet_burst",
      },
      {
        path: "betting_patterns.wallet_bet_burst_high",
        label: "wallet.bet burst — high",
        type: "number",
        description: "Sequential wallet.bet count for high tier.",
        example: "40",
        signal: "sequential_wallet_bet_burst (higher score tier)",
      },
      {
        path: "betting_patterns.wallet_bet_burst_critical",
        label: "wallet.bet burst — critical",
        type: "number",
        description: "Sequential wallet.bet count for critical tier.",
        example: "60",
        signal: "sequential_wallet_bet_burst (critical score tier)",
      },
      {
        path: "betting_patterns.wallet_win_burst_medium",
        label: "wallet.win burst — medium",
        type: "number",
        description: "Sequential wallet.win credits in window before medium win burst.",
        example: "8 — many wins credited in quick succession.",
        signal: "sequential_wallet_win_burst",
      },
      {
        path: "betting_patterns.wallet_win_burst_high",
        label: "wallet.win burst — high",
        type: "number",
        description: "Sequential wallet.win count for high tier.",
        example: "15",
        signal: "sequential_wallet_win_burst (higher score tier)",
      },
      {
        path: "betting_patterns.wallet_win_burst_critical",
        label: "wallet.win burst — critical",
        type: "number",
        description: "Sequential wallet.win count for critical tier.",
        example: "25",
        signal: "sequential_wallet_win_burst (critical score tier)",
      },
      {
        path: "betting_patterns.win_rate_min_bets",
        label: "Win rate — min bets",
        type: "number",
        description: "Minimum wallet.bet + game.bet count in window before win-rate ratio is evaluated.",
        example: "5 — need at least 5 bets; 4 wins / 4 bets is ignored until 5th bet arrives.",
      },
      {
        path: "betting_patterns.win_rate_high_ratio",
        label: "Win rate — high ratio",
        type: "number",
        description: "Wins ÷ bets ratio that triggers high win-rate signal (0–1).",
        example: "0.75 — 6 wins out of 8 bets (75%) in window raises high_win_rate_in_betting_sequence.",
        signal: "high_win_rate_in_betting_sequence",
      },
      {
        path: "betting_patterns.win_rate_critical_ratio",
        label: "Win rate — critical ratio",
        type: "number",
        description: "Wins ÷ bets ratio for critical win-rate tier.",
        example: "0.90 — 9 wins out of 10 bets raises critical_win_rate_in_betting_sequence.",
        signal: "critical_win_rate_in_betting_sequence",
      },
    ],
  },
  {
    id: "hedge_betting",
    label: "Hedged betting",
    description:
      "Detect matched opposite live-casino bets (e.g. baccarat banker + player same round) used to inflate transaction volume. Your backend must send metadata.game on every wallet.bet / game.bet — see INTEGRATION_GUIDE.md.",
    fields: [
      {
        path: "hedge_betting.enabled",
        label: "Enabled",
        type: "checkbox",
        description: "Master toggle for hedged-round detection and volume-washing ratio.",
        example: "Off if you do not send metadata.game.selection and round_id yet.",
      },
      {
        path: "hedge_betting.window_seconds",
        label: "Stats window (seconds)",
        type: "number",
        description: "Rolling window for counting repeated hedged rounds and gross volume ratio.",
        example: "3600 — count hedged rounds in the last hour per user.",
      },
      {
        path: "hedge_betting.round_leg_ttl_seconds",
        label: "Round leg TTL (seconds)",
        type: "number",
        description: "How long the first bet leg is stored while waiting for the opposite side on the same round_id.",
        example: "600 — banker bet at 12:00:00; player bet at 12:09:59 still matches; at 12:10:01 leg expires.",
      },
      {
        path: "hedge_betting.time_pair_window_seconds",
        label: "Time-pair window (seconds)",
        type: "number",
        description: "Fallback grouping bucket when round_id is missing but table_id is present — bets within this window on same table may pair.",
        example: "15 — only used if require_round_id is off and round_id absent.",
      },
      {
        path: "hedge_betting.require_round_id",
        label: "Require round_id",
        type: "checkbox",
        description: "When on, hedge checks run only if metadata.game.round_id is present. Recommended once your backend sends round_id.",
        example: "On in production — avoids false positives from time-pair fallback.",
      },
      {
        path: "hedge_betting.opposite_selection_groups",
        label: "Opposite selection groups",
        type: "json",
        description:
          "JSON array of groups. Selections in the same inner array are treated as opposites on the same round.",
        example: '[["banker","player"],["red","black"]]',
        signal: "opposite_side_bets_same_round",
      },
      {
        path: "hedge_betting.amount_match_tolerance_percent",
        label: "Amount match tolerance (%)",
        type: "number",
        step: "0.1",
        description: "Opposite legs must have stakes within this percentage of each other.",
        example: "10 — banker €1000 + player €950 matches; player €800 does not.",
      },
      {
        path: "hedge_betting.opposite_side_same_round_score",
        label: "Score — opposite sides same round",
        type: "number",
        description: "Risk score when a single hedged round (opposite sides, matching amounts) is detected.",
        example: "50 — fires on first detected banker+player pair.",
        signal: "opposite_side_bets_same_round",
      },
      {
        path: "hedge_betting.hedged_round_medium",
        label: "Hedged rounds — medium",
        type: "number",
        description: "Distinct hedged rounds in stats window before repeated-pattern signal (medium tier).",
        example: "3 — three separate hedged hands in one hour.",
        signal: "repeated_hedged_rounds",
      },
      {
        path: "hedge_betting.hedged_round_high",
        label: "Hedged rounds — high",
        type: "number",
        description: "Distinct hedged rounds for high tier.",
        example: "8",
        signal: "high_repeated_hedged_rounds",
      },
      {
        path: "hedge_betting.hedged_round_critical",
        label: "Hedged rounds — critical",
        type: "number",
        description: "Distinct hedged rounds for critical tier.",
        example: "15",
        signal: "critical_hedged_bet_volume_washing",
      },
      {
        path: "hedge_betting.volume_washing_enabled",
        label: "Volume washing check",
        type: "checkbox",
        description: "When on, compare hedged gross bet volume to total gross bet volume in the stats window.",
        example: "Player bets €6000 hedged + €4000 normal in 1h → 60% hedged share.",
        signal: "hedged_bet_volume_washing",
      },
      {
        path: "hedge_betting.min_gross_volume",
        label: "Volume washing — min gross",
        type: "number",
        step: "0.01",
        description: "Minimum total bet volume in window before volume-washing ratio is evaluated.",
        example: "5000 — ignore ratio until player has at least €5000 gross bets in window.",
      },
      {
        path: "hedge_betting.min_hedged_gross_ratio",
        label: "Volume washing — min hedged ratio",
        type: "number",
        step: "0.01",
        description: "Minimum hedged_gross ÷ total_gross ratio (0–1) to trigger volume washing signal.",
        example: "0.5 — 50% or more of gross volume is hedged → hedged_bet_volume_washing (hard block if listed on Decision tab).",
        signal: "hedged_bet_volume_washing",
      },
      {
        path: "hedge_betting.volume_washing_score",
        label: "Score — volume washing",
        type: "number",
        description: "Risk score added when volume-washing ratio threshold is met.",
        example: "55 — combine with opposite_side score for higher total.",
      },
    ],
  },
  {
    id: "step_up",
    label: "Step-up (Turnstile)",
    description:
      "After your backend verifies Cloudflare Turnstile (siteverify API), send metadata.step_up_verification on the next POST /evaluate. AFS may downgrade challenge → allow and cache a grant per user+device.",
    fields: [
      {
        path: "step_up_verification.enabled",
        label: "Enabled",
        type: "checkbox",
        description: "When off, step_up_verification metadata is ignored and challenge outcomes are not downgraded.",
        example: "On when your frontend shows Turnstile on challenge responses.",
      },
      {
        path: "step_up_verification.grant_ttl_days",
        label: "Grant duration (days)",
        type: "number",
        description: "How long a successful verification grant lasts for the same user_id + device fingerprint.",
        example: "7 — player passes Turnstile once; subsequent logins allow for 7 days on same device.",
      },
      {
        path: "step_up_verification.max_verified_age_minutes",
        label: "Max verified_at age (minutes)",
        type: "number",
        description: "metadata.verified_at must be within this many minutes of the evaluate request timestamp.",
        example: "5 — siteverify at 12:00, evaluate at 12:06 → grant rejected as stale.",
      },
      {
        path: "step_up_verification.downgrade_challenge_to_allow",
        label: "Downgrade challenge to allow",
        type: "checkbox",
        description: "When on, active grant changes challenge decision to allow. Never overrides block or critical signals.",
        example: "On — typical production setting after Turnstile pass.",
      },
      {
        path: "step_up_verification.allowed_hostnames",
        label: "Allowed hostnames",
        type: "textarea",
        list: true,
        description: "Optional Cloudflare hostname allowlist from siteverify response — one per line. Empty = skip check.",
        example: "casino.example.com\nwww.casino.example.com",
      },
      {
        path: "step_up_verification.applicable_event_types",
        label: "Applicable event types",
        type: "textarea",
        list: true,
        description: "Event types where step-up grant can downgrade challenge — one per line.",
        example: "player.login\nplayer.signup\npayment.deposit",
      },
    ],
  },
  {
    id: "fingerprint",
    label: "Fingerprint",
    description:
      "FingerprintJS visitorId validation. Missing or invalid fingerprints raise device-trust signals; required on configured channels (especially withdrawals).",
    fields: [
      {
        path: "fingerprint.required_channels",
        label: "Required channels",
        type: "text",
        list: true,
        description: "Channels where context.fingerprint is expected. Missing value on these channels raises missing_fingerprint.",
        example: "web,mobile — signup on web without visitorId → missing_fingerprint.",
        signal: "missing_fingerprint",
      },
      {
        path: "fingerprint.min_length",
        label: "Min length",
        type: "number",
        description: "Minimum valid FingerprintJS visitorId character length.",
        example: "10 — abc123 (6 chars) → malformed_fingerprint.",
        signal: "malformed_fingerprint",
      },
      {
        path: "fingerprint.max_length",
        label: "Max length",
        type: "number",
        description: "Maximum valid visitorId length. Values outside min–max are rejected.",
        example: "64",
        signal: "malformed_fingerprint, invalid_fingerprint",
      },
      {
        path: "fingerprint.suspicious_values",
        label: "Suspicious values",
        type: "textarea",
        list: true,
        description: "Known fake or placeholder fingerprint strings — one per line. Exact match fails validation.",
        example: "undefined\nnull\n00000000-0000-0000-0000-000000000000",
        signal: "invalid_fingerprint",
      },
    ],
  },
  {
    id: "lists",
    label: "Lists",
    description:
      "Blocklists and pattern lists used by email, identity, device, signup, and gaming engines. One entry per line (or comma-separated for short text fields). Changes apply immediately after Save.",
    fields: [
      {
        path: "lists.disposable_domains",
        label: "Disposable email domains",
        type: "textarea",
        list: true,
        description: "Throwaway email provider domains. Signup with these domains is usually hard-blocked.",
        example: "mailinator.com\n10minutemail.com\nguerrillamail.com",
        signal: "disposable_email",
      },
      {
        path: "lists.high_risk_countries",
        label: "High-risk countries",
        type: "countries",
        description: "Countries with elevated fraud rates. Adds score on geo/IP checks — not an automatic block.",
        example: "Select NG, GH, PK — raises high_risk_country on matching geo/IP context.",
        signal: "high_risk_country",
      },
      {
        path: "lists.sanctioned_countries",
        label: "Sanctioned countries",
        type: "countries",
        description: "Sanctioned or gambling-prohibited jurisdictions. Used when AML blocklist includes Lists tab.",
        example: "Select IR, KP, CU — raises sanctioned_country on money events and login.",
        signal: "sanctioned_country",
      },
      {
        path: "lists.generic_names",
        label: "Generic names",
        type: "textarea",
        list: true,
        description: "Placeholder display names on signup/identity — one per line, case-insensitive.",
        example: "test\nuser\nadmin\nPlayer",
        signal: "generic_name",
      },
      {
        path: "lists.role_based_email_locals",
        label: "Role-based email locals",
        type: "textarea",
        list: true,
        description: "Email local parts (before @) that indicate non-personal accounts.",
        example: "admin\nsupport\ninfo\nnoreply",
        signal: "role_based_email",
      },
      {
        path: "lists.suspicious_email_tlds",
        label: "Suspicious email TLDs",
        type: "textarea",
        list: true,
        description: "Top-level domains associated with spam. Match when email ends with these TLDs.",
        example: ".xyz\n.top\n.click",
        signal: "suspicious_email_tld",
      },
      {
        path: "lists.suspicious_email_local_tokens",
        label: "Suspicious email local tokens",
        type: "textarea",
        list: true,
        description: "Substrings in email local part that suggest throwaway or bot accounts.",
        example: "temp\nspam\nbot\nfake",
        signal: "suspicious_email_pattern",
      },
      {
        path: "lists.bot_user_agent_tokens",
        label: "Bot user-agent tokens",
        type: "textarea",
        list: true,
        description: "Substrings in User-Agent header indicating scripts or automation.",
        example: "curl\npython-requests\nheadless\nscrapy",
        signal: "bot_user_agent",
      },
      {
        path: "lists.emulator_ua_tokens",
        label: "Emulator UA tokens",
        type: "textarea",
        list: true,
        description: "User-Agent patterns for Android emulators or virtual devices.",
        example: "genymotion\nbluestacks\nsdk_gphone",
        signal: "emulator_detected",
      },
      {
        path: "lists.suspicious_referrers",
        label: "Suspicious referrers",
        type: "textarea",
        list: true,
        description: "Exact referrer values treated as low-trust on signup.",
        example: "direct\nunknown\n(empty line for blank referrer)",
        signal: "suspicious_referrer",
      },
      {
        path: "lists.bonus_abuse_referrer_tokens",
        label: "Bonus abuse referrer tokens",
        type: "textarea",
        list: true,
        description: "Substrings in signup referrer URL linked to bonus-hunting or affiliate abuse sites.",
        example: "free-spins\nno-deposit\nbonus-hunter",
        signal: "bonus_abuse_referrer",
      },
    ],
  },
  {
    id: "velocity",
    label: "Velocity",
    description:
      "Rate limits per sliding time window. Window length = Redis IP/domain TTL under Features tab (or unbounded in memory mode). Each key is a max event count before its tier fires.",
    fields: [
      {
        path: "velocity_thresholds",
        label: "Velocity thresholds (JSON)",
        type: "json",
        description:
          "Map of threshold name → max count. Suffix _medium/_high/_critical selects tier. Do not delete keys — engines expect the full set.",
        example:
          '{\n  "login_ip_medium": 5,\n  "login_ip_high": 15,\n  "login_ip_critical": 30,\n  "signup_ip_critical": 10,\n  "deposit_user_high": 6\n}',
        signal: "medium_login_ip_velocity, bulk_login_attack, bulk_signup_attack, rapid_deposit_activity, …",
      },
    ],
  },
  {
    id: "features",
    label: "Features & Messaging",
    description:
      "Integration toggles for Redis, RabbitMQ, audit logging, and sync API behaviour. Connection URLs stay in .env / docker-compose — only behaviour flags are here. RabbitMQ/Redis toggles require Risk service restart.",
    fields: [
      {
        path: "features.sync_publish_audit",
        label: "Publish audit on sync /evaluate",
        type: "checkbox",
        description: "When on, synchronous POST /evaluate results are also published to RabbitMQ for Orchestrator audit.",
        example: "On when Orchestrator must see sync API decisions in the same pipeline as async events.",
      },
      {
        path: "features.decision_cache_ttl_seconds",
        label: "Decision cache TTL (seconds)",
        type: "number",
        description: "Cache identical event_id decisions in Redis to avoid re-scoring duplicates. Requires Redis enabled.",
        example: "300 — same event_id within 5 minutes returns cached decision; 0 = disabled.",
      },
      {
        path: "features.redis_enabled",
        label: "Redis enabled",
        type: "checkbox",
        note: "Requires restart",
        description: "Use Redis for velocity counters, hedge/betting stores, and optional decision cache.",
        example: "Off for single-instance dev (in-memory counters); on for production multi-instance.",
      },
      {
        path: "features.redis_velocity_ip_ttl",
        label: "Redis IP velocity TTL",
        type: "number",
        description: "Sliding window length (seconds) for IP-based velocity keys in Redis.",
        example: "3600 — login_ip_high counts logins from one IP in the last hour.",
      },
      {
        path: "features.redis_velocity_domain_ttl",
        label: "Redis domain velocity TTL",
        type: "number",
        description: "Sliding window length for email-domain signup velocity counters.",
        example: "86400 — signup_domain_* counts signups per domain in 24h.",
      },
      {
        path: "features.rabbitmq_enabled",
        label: "RabbitMQ consumer enabled",
        type: "checkbox",
        note: "Requires restart",
        description: "Start async consumer that scores events from the casino platform exchange/queue.",
        example: "On when platform publishes wallet.bet, player.login, etc. to casino.events.",
      },
      {
        path: "features.rabbitmq_publish_results",
        label: "Publish results to Orchestrator",
        type: "checkbox",
        note: "Requires restart",
        description: "Publish scored EvaluateResponse messages to the results queue after async scoring.",
        example: "On when Orchestrator subscribes to risk.results for audit/actions.",
      },
      {
        path: "features.rabbitmq_events_exchange",
        label: "Events exchange",
        type: "text",
        note: "Requires restart",
        description: "Topic exchange the casino platform publishes to. Empty = legacy direct queue mode.",
        example: "casino.events",
      },
      {
        path: "features.rabbitmq_events_exchange_type",
        label: "Exchange type",
        type: "text",
        note: "Requires restart",
        description: "RabbitMQ exchange type declared/bound by AFS consumer.",
        example: "topic",
      },
      {
        path: "features.rabbitmq_events_queue",
        label: "Events queue",
        type: "text",
        note: "Requires restart",
        description: "Queue AFS consumes from after binding to the platform exchange.",
        example: "casino.afs",
      },
      {
        path: "features.rabbitmq_events_binding_key",
        label: "Binding key",
        type: "text",
        note: "Requires restart",
        description: "Routing key pattern for queue binding. # = all messages on exchange.",
        example: "# — all events; player.* — only player routing keys.",
      },
      {
        path: "features.rabbitmq_prefetch",
        label: "Prefetch count",
        type: "number",
        note: "Requires restart",
        description: "Max unacknowledged messages per consumer channel.",
        example: "10 — conservative; 50 — higher throughput, more memory.",
      },
      {
        path: "features.rabbitmq_results_queue",
        label: "Results queue",
        type: "text",
        note: "Requires restart",
        description: "Outbound queue name for scored async results.",
        example: "risk.results",
      },
    ],
  },
];

const LOGS_SECTION = {
  id: "logs",
  isLogsViewer: true,
};

const DASHBOARD_SECTION = {
  id: "dashboard",
  isDashboard: true,
};

let tabTooltipEl = null;

let config = null;
let apiKey = sessionStorage.getItem(STORAGE_KEY) || "";

const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const loginError = document.getElementById("login-error");
const statusBanner = document.getElementById("status-banner");

function ui(key) {
  return window.AdminI18n ? AdminI18n.ui(key) : key;
}

function localizeField(field) {
  if (window.AdminI18n?.localizeField) {
    return AdminI18n.localizeField(field);
  }
  return field;
}

const LOGS_PAGE_SIZE_KEY = "afs_admin_log_page_size";
const LOGS_PAGE_SIZES = [10, 50, 100];

const PAGER_SVG = {
  first:
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"/></svg>',
  prev: '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
  next: '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
  last: '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"/></svg>',
};

let logsState = {
  offset: 0,
  limit: (() => {
    try {
      const stored = Number(sessionStorage.getItem(LOGS_PAGE_SIZE_KEY));
      return LOGS_PAGE_SIZES.includes(stored) ? stored : 50;
    } catch {
      return 50;
    }
  })(),
  total: 0,
};

function ensureTabTooltipRoot() {
  if (!tabTooltipEl) {
    tabTooltipEl = document.createElement("div");
    tabTooltipEl.id = "tab-tooltip-root";
    tabTooltipEl.className = "tab-tooltip-root hidden";
    tabTooltipEl.setAttribute("role", "tooltip");
    document.body.appendChild(tabTooltipEl);
  }
  return tabTooltipEl;
}

function showTabTooltip(tab, sectionId) {
  if (!window.AdminI18n) {
    return;
  }
  const meta = AdminI18n.tabMeta(sectionId);
  const root = ensureTabTooltipRoot();
  root.innerHTML = `
    <span class="tab-tooltip-row"><strong>${escapeHtml(ui("tooltipWhat"))}:</strong> ${escapeHtml(meta.what)}</span>
    <span class="tab-tooltip-row"><strong>${escapeHtml(ui("tooltipWhere"))}:</strong> ${escapeHtml(meta.where)}</span>
  `;
  root.classList.remove("hidden");
  positionTabTooltip(tab);
}

function hideTabTooltip() {
  tabTooltipEl?.classList.add("hidden");
}

function positionTabTooltip(tab) {
  if (!tabTooltipEl) {
    return;
  }
  const rect = tab.getBoundingClientRect();
  tabTooltipEl.style.left = `${rect.left + rect.width / 2}px`;
  tabTooltipEl.style.top = `${rect.bottom + 8}px`;
}

function attachTabTooltip(tab, sectionId) {
  tab.addEventListener("mouseenter", () => showTabTooltip(tab, sectionId));
  tab.addEventListener("focus", () => showTabTooltip(tab, sectionId));
  tab.addEventListener("mouseleave", hideTabTooltip);
  tab.addEventListener("blur", hideTabTooltip);
}

function initTabTooltipScrollHide() {
  document.getElementById("tabs")?.addEventListener("scroll", hideTabTooltip, { passive: true });
  window.addEventListener("scroll", hideTabTooltip, { passive: true, capture: true });
}

function populateLocaleSelect(selectEl) {
  if (!selectEl || !window.AdminI18n) {
    return;
  }
  selectEl.innerHTML = "";
  Object.entries(AdminI18n.LOCALES).forEach(([code, name]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    selectEl.appendChild(option);
  });
  selectEl.value = AdminI18n.getLocale();
}

function syncLocaleSelects(locale) {
  ["locale-select-login", "locale-select-app"].forEach((id) => {
    const select = document.getElementById(id);
    if (select) {
      select.value = locale;
    }
  });
}

function applyStaticUi() {
  const textMap = [
    ["login-title", "loginTitle"],
    ["login-subtitle", "loginSubtitle"],
    ["login-api-key-label", "apiKeyLabel"],
    ["app-title", "appTitle"],
    ["audit-title", "recentChanges"],
  ];
  textMap.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = ui(key);
    }
  });

  const apiInput = document.getElementById("api-key-input");
  if (apiInput) {
    apiInput.placeholder = ui("apiKeyPlaceholder");
  }

  const buttonMap = [
    ["login-btn", "connect"],
    ["reload-btn", "reload"],
    ["reset-btn", "resetDefaults"],
    ["save-btn", "saveChanges"],
  ];
  buttonMap.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = ui(key);
    }
  });

  ["locale-select-login", "locale-select-app"].forEach((id) => {
    const select = document.getElementById(id);
    if (select) {
      select.setAttribute("aria-label", ui("language"));
    }
  });
}

function getActiveTabId() {
  const active = document.querySelector(".tab.active");
  return active?.dataset.panel || "decision";
}

async function changeLocale(locale) {
  if (!window.AdminI18n) {
    return;
  }
  AdminI18n.setLocale(locale);
  syncLocaleSelects(AdminI18n.getLocale());
  applyStaticUi();

  const activeTab = getActiveTabId();
  let formSnapshot = null;
  if (config) {
    try {
      formSnapshot = collectForm();
    } catch {
      formSnapshot = null;
    }
  }

  buildTabs();
  if (formSnapshot) {
    config = formSnapshot;
    populateForm();
  }
  activateTab(activeTab);

  if (activeTab === "logs" && document.getElementById("log-table-body")) {
    await loadEvaluateLogs().catch(() => {});
  }
  if (activeTab === "aml" && document.getElementById("blocklist-status-box")) {
    await loadBlocklistStatus().catch(() => {});
  }
}

function initLocaleControls() {
  populateLocaleSelect(document.getElementById("locale-select-login"));
  populateLocaleSelect(document.getElementById("locale-select-app"));
  applyStaticUi();

  ["locale-select-login", "locale-select-app"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", (event) => {
      changeLocale(event.target.value).catch(() => {});
    });
  });
}

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

function appendFieldHelp(parent, field) {
  if (field.description) {
    const description = document.createElement("p");
    description.className = "field-description";
    description.textContent = field.description;
    parent.appendChild(description);
  }

  if (field.example) {
    const example = document.createElement("div");
    example.className = "field-example";
    const label = document.createElement("strong");
    label.textContent = `${ui("example")}: `;
    example.appendChild(label);
    const value = field.example;
    if (value.includes("\n") || value.startsWith("{") || value.startsWith("[")) {
      const pre = document.createElement("pre");
      pre.textContent = value;
      example.appendChild(pre);
    } else {
      example.appendChild(document.createTextNode(value));
    }
    parent.appendChild(example);
  }

  if (field.signal) {
    const signal = document.createElement("p");
    signal.className = "field-signal";
    signal.textContent = `${ui("signals")}: ${field.signal}`;
    parent.appendChild(signal);
  }
}

function buildLogsViewerPanel(panel) {
  panel.classList.add("panel-logs");

  const layout = document.createElement("div");
  layout.className = "logs-layout";

  const sidebar = document.createElement("aside");
  sidebar.className = "logs-sidebar";

  const settingsTitle = document.createElement("h3");
  settingsTitle.className = "section-title";
  settingsTitle.textContent = ui("loggingSettings");
  sidebar.appendChild(settingsTitle);

  const settingsStack = document.createElement("div");
  settingsStack.className = "fields-stack logs-settings-stack";

  [
    {
      path: "logging.sync_enabled",
      label: "Sync request/response logging",
      description:
        "Store full request and response payloads for POST /evaluate in Postgres. View entries in the log table on the right.",
      example: "Enable during integration testing; disable in high-volume production if storage is a concern.",
    },
    {
      path: "logging.async_enabled",
      label: "Async request/response logging",
      description:
        "Store RabbitMQ scored/skipped/rejected/failed messages with payloads where available.",
      example: "Enable to debug casino.events → AFS pipeline without tailing container logs.",
    },
  ].forEach((fieldDef) => {
    const field = localizeField(fieldDef);
    const wrapper = document.createElement("div");
    wrapper.className = "field field-card";
    const label = document.createElement("label");
    label.htmlFor = field.path;
    label.textContent = field.label;
    wrapper.appendChild(label);
    appendFieldHelp(wrapper, field);
    const row = document.createElement("div");
    row.className = "field-checkbox-row";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = field.path;
    input.dataset.path = field.path;
    input.dataset.type = "checkbox";
    row.appendChild(input);
    const enableLabel = document.createElement("span");
    enableLabel.textContent = ui("enable");
    row.appendChild(enableLabel);
    wrapper.appendChild(row);
    settingsStack.appendChild(wrapper);
  });

  sidebar.appendChild(settingsStack);

  const main = document.createElement("div");
  main.className = "logs-main";

  const filters = document.createElement("div");
  filters.className = "log-filters";
  filters.innerHTML = `
    <label>${ui("logChannel")}<select id="log-filter-channel"><option value="">${ui("logAll")}</option><option value="sync">Sync</option><option value="async">Async</option></select></label>
    <label>${ui("logStatus")}<select id="log-filter-status"><option value="">${ui("logAll")}</option><option value="scored">Scored</option><option value="skipped">Skipped</option><option value="rejected">Rejected</option><option value="failed">Failed</option></select></label>
    <label>${ui("logEventId")}<input id="log-filter-event-id" type="text" placeholder="${ui("logSearchPlaceholder")}"></label>
    <label class="log-filter-page-size">${ui("logRowsPerPage")}<select id="log-page-size" aria-label="${escapeHtml(ui("logRowsPerPage"))}">${LOGS_PAGE_SIZES.map((n) => `<option value="${n}"${n === logsState.limit ? " selected" : ""}>${n}</option>`).join("")}</select></label>
    <button type="button" id="log-refresh-btn" class="secondary log-filter-refresh">${ui("logRefresh")}</button>
  `;
  main.appendChild(filters);

  const meta = document.createElement("p");
  meta.id = "log-meta";
  meta.className = "hint log-meta-bar";
  main.appendChild(meta);

  const tableWrap = document.createElement("div");
  tableWrap.className = "log-table-wrap";
  tableWrap.innerHTML = `<table class="log-table"><thead><tr><th>Time</th><th>Channel</th><th>Status</th><th>${ui("logDecision")}</th><th>${ui("logScore")}</th><th>Event</th><th>Summary</th><th></th></tr></thead><tbody id="log-table-body"></tbody></table>`;
  main.appendChild(tableWrap);

  const pager = document.createElement("div");
  pager.className = "log-pager";
  pager.innerHTML = `
    <nav class="log-pager-nav" aria-label="${escapeHtml(ui("logPagination"))}">
      <div class="log-pager-group">
        <button type="button" id="log-first-btn" class="log-pager-icon-btn" title="${escapeHtml(ui("logFirst"))}" aria-label="${escapeHtml(ui("logFirst"))}">${PAGER_SVG.first}</button>
        <button type="button" id="log-prev-btn" class="log-pager-icon-btn" title="${escapeHtml(ui("logPrevious"))}" aria-label="${escapeHtml(ui("logPrevious"))}">${PAGER_SVG.prev}</button>
        <div class="log-pager-jump">
          <span class="log-pager-jump-label">${ui("logPage")}</span>
          <select id="log-page-select" class="log-page-select" aria-label="${escapeHtml(ui("logGoToPage"))}"></select>
          <span id="log-page-total" class="log-pager-total"></span>
        </div>
        <button type="button" id="log-next-btn" class="log-pager-icon-btn" title="${escapeHtml(ui("logNext"))}" aria-label="${escapeHtml(ui("logNext"))}">${PAGER_SVG.next}</button>
        <button type="button" id="log-last-btn" class="log-pager-icon-btn" title="${escapeHtml(ui("logLast"))}" aria-label="${escapeHtml(ui("logLast"))}">${PAGER_SVG.last}</button>
      </div>
    </nav>
  `;
  main.appendChild(pager);

  layout.appendChild(sidebar);
  layout.appendChild(main);
  panel.appendChild(layout);

  ensureLogDetailModal();

  panel.querySelector("#log-refresh-btn").addEventListener("click", () => {
    logsState.offset = 0;
    loadEvaluateLogs();
  });
  panel.querySelector("#log-page-size").addEventListener("change", (event) => {
    const next = Number(event.target.value);
    if (!LOGS_PAGE_SIZES.includes(next)) {
      return;
    }
    logsState.limit = next;
    logsState.offset = 0;
    try {
      sessionStorage.setItem(LOGS_PAGE_SIZE_KEY, String(next));
    } catch {
      /* ignore */
    }
    loadEvaluateLogs();
  });
  panel.querySelector("#log-first-btn").addEventListener("click", () => goToLogsPage(1));
  panel.querySelector("#log-prev-btn").addEventListener("click", () => goToLogsPage(getLogsCurrentPage() - 1));
  panel.querySelector("#log-next-btn").addEventListener("click", () => goToLogsPage(getLogsCurrentPage() + 1));
  panel.querySelector("#log-last-btn").addEventListener("click", () => goToLogsPage(getLogsTotalPages()));
  panel.querySelector("#log-page-select").addEventListener("change", (event) => {
    goToLogsPage(Number(event.target.value));
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
  if (!tbody) {
    return;
  }
  tbody.innerHTML = "";
  hideLogDetailModal();

  if (!data.entries.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="log-empty">${escapeHtml(ui("logEmpty"))}</td></tr>`;
  } else {
    data.entries.forEach((entry) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${formatLogTime(entry.logged_at)}</td>
        <td><span class="log-badge log-badge-${entry.channel}">${entry.channel}</span></td>
        <td><span class="log-badge log-badge-${entry.status}">${entry.status}</span></td>
        <td>${renderLogDecisionBadge(entry)}</td>
        <td class="log-score">${renderLogScore(entry)}</td>
        <td>${escapeHtml(entry.event_type || "-")}<br><small>${escapeHtml(entry.event_id || "-")}</small></td>
        <td class="log-summary">${escapeHtml(entry.summary)}</td>
        <td><button type="button" class="secondary log-view-btn" data-id="${entry.id}">${escapeHtml(ui("logView"))}</button></td>
      `;
      row.querySelector(".log-view-btn").addEventListener("click", () => showLogDetail(entry.id));
      tbody.appendChild(row);
    });
  }

  const from = data.total ? logsState.offset + 1 : 0;
  const to = Math.min(logsState.offset + data.entries.length, data.total);
  const metaEl = document.getElementById("log-meta");
  if (metaEl) {
    metaEl.textContent = ui("logShowing")
      .replace("{from}", String(from))
      .replace("{to}", String(to))
      .replace("{total}", String(data.total));
  }
  updateLogsPagerUi();
}

function getLogsTotalPages() {
  if (!logsState.total) {
    return 1;
  }
  return Math.max(1, Math.ceil(logsState.total / logsState.limit));
}

function getLogsCurrentPage() {
  return Math.floor(logsState.offset / logsState.limit) + 1;
}

function goToLogsPage(page) {
  const totalPages = getLogsTotalPages();
  const clamped = Math.min(Math.max(1, page), totalPages);
  logsState.offset = (clamped - 1) * logsState.limit;
  loadEvaluateLogs();
}

function updateLogsPagerUi() {
  const current = getLogsCurrentPage();
  const totalPages = getLogsTotalPages();

  const pageSelect = document.getElementById("log-page-select");
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      return `<option value="${page}"${page === current ? " selected" : ""}>${page}</option>`;
    }).join("");
  }

  const totalLabel = document.getElementById("log-page-total");
  if (totalLabel) {
    totalLabel.textContent = ui("logPageTotal").replace("{total}", String(totalPages));
  }

  const firstBtn = document.getElementById("log-first-btn");
  const prevBtn = document.getElementById("log-prev-btn");
  const nextBtn = document.getElementById("log-next-btn");
  const lastBtn = document.getElementById("log-last-btn");
  const atStart = logsState.offset === 0 || logsState.total === 0;
  const atEnd = logsState.offset + logsState.limit >= logsState.total || logsState.total === 0;
  if (firstBtn) firstBtn.disabled = atStart;
  if (prevBtn) prevBtn.disabled = atStart;
  if (nextBtn) nextBtn.disabled = atEnd;
  if (lastBtn) lastBtn.disabled = atEnd;

  const sizeSelect = document.getElementById("log-page-size");
  if (sizeSelect && Number(sizeSelect.value) !== logsState.limit) {
    sizeSelect.value = String(logsState.limit);
  }
}

async function showLogDetail(logId) {
  const modal = ensureLogDetailModal();
  const body = modal.querySelector(".log-detail-body");
  const title = modal.querySelector(".log-modal-title");
  body.textContent = ui("logLoading");
  title.textContent = ui("logDetailTitle");
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  try {
    const entry = await api(`/logs/${logId}`);
    const label = [entry.event_type, entry.event_id].filter(Boolean).join(" · ") || `#${logId}`;
    title.textContent = `${ui("logDetailTitle")} — ${label}`;
    body.textContent = JSON.stringify(entry, null, 2);
  } catch (error) {
    body.textContent = error.message;
  }
}

function ensureLogDetailModal() {
  let modal = document.getElementById("log-detail-modal");
  if (modal) {
    return modal;
  }

  modal = document.createElement("div");
  modal.id = "log-detail-modal";
  modal.className = "modal-overlay hidden";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `
    <div class="modal-card log-modal">
      <div class="modal-header">
        <h3 class="log-modal-title">${escapeHtml(ui("logDetailTitle"))}</h3>
        <button type="button" class="modal-close" aria-label="${escapeHtml(ui("logClose"))}">×</button>
      </div>
      <pre class="log-detail-body"></pre>
    </div>
  `;

  modal.querySelector(".modal-card").addEventListener("click", (event) => {
    event.stopPropagation();
  });

  modal.querySelector(".modal-close").addEventListener("click", hideLogDetailModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      hideLogDetailModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      hideLogDetailModal();
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function hideLogDetailModal() {
  const modal = document.getElementById("log-detail-modal");
  modal?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function formatLogTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function renderLogDecisionBadge(entry) {
  if (entry.status !== "scored" || !entry.decision) {
    return `<span class="log-decision-empty">—</span>`;
  }
  const isCritical = entry.risk_level === "critical";
  const badgeKey = isCritical ? "critical" : entry.decision;
  const label = isCritical ? "CRITICAL" : entry.decision.toUpperCase();
  return `<span class="log-badge log-badge-decision log-badge-decision-${badgeKey}">${escapeHtml(label)}</span>`;
}

function renderLogScore(entry) {
  if (entry.status !== "scored" || entry.final_score == null) {
    return `<span class="log-decision-empty">—</span>`;
  }
  return escapeHtml(String(entry.final_score));
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
  title.textContent = ui("blocklistStatus");
  panel.appendChild(title);

  const statusBox = document.createElement("div");
  statusBox.id = "blocklist-status-box";
  statusBox.className = "info-card blocklist-status";
  statusBox.textContent = "Loading blocklist status…";
  panel.appendChild(statusBox);

  const actions = document.createElement("div");
  actions.className = "log-filters";
  const syncBtn = document.createElement("button");
  syncBtn.type = "button";
  syncBtn.className = "secondary";
  syncBtn.id = "blocklist-sync-btn";
  syncBtn.textContent = ui("syncOfacNow");
  syncBtn.addEventListener("click", async () => {
    syncBtn.disabled = true;
    syncBtn.textContent = ui("syncing");
    try {
      await api("/blocklist/sync", { method: "POST" });
      await loadBlocklistStatus();
    } catch (err) {
      statusBox.textContent = `Sync failed: ${err.message}`;
    } finally {
      syncBtn.disabled = false;
      syncBtn.textContent = ui("syncOfacNow");
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

  const allSections = [DASHBOARD_SECTION, ...TAB_SECTIONS, LOGS_SECTION];

  allSections.forEach((section, index) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = `tab${index === 0 ? " active" : ""}`;
    tab.textContent = window.AdminI18n ? AdminI18n.tabMeta(section.id).label : section.label || section.id;
    tab.dataset.panel = section.id;
    tab.addEventListener("click", () => activateTab(section.id));
    if (window.AdminI18n) {
      attachTabTooltip(tab, section.id);
    }
    tabsEl.appendChild(tab);

    const panel = document.createElement("div");
    panel.className = `panel${index === 0 ? " active" : ""}`;
    panel.id = `panel-${section.id}`;

    const introText = window.AdminI18n
      ? AdminI18n.sectionDescription(section.id, section.description)
      : section.description;
    if (introText && !section.isDashboard && !section.isLogsViewer) {
      const panelIntro = document.createElement("p");
      panelIntro.className = "panel-description";
      panelIntro.textContent = introText;
      panel.appendChild(panelIntro);
    }

    if (section.isDashboard) {
      initDashboardTab(panel);
      panelsEl.appendChild(panel);
      return;
    }

    if (section.isLogsViewer) {
      buildLogsViewerPanel(panel);
      panelsEl.appendChild(panel);
      return;
    }

    const fieldsStack = document.createElement("div");
    fieldsStack.className = "fields-stack";

    section.fields.forEach((fieldDef) => {
      const field = localizeField(fieldDef);
      const wrapper = document.createElement("div");
      wrapper.className = "field field-card";

      const label = document.createElement("label");
      label.htmlFor = field.path;
      label.textContent = field.label;
      wrapper.appendChild(label);
      appendFieldHelp(wrapper, field);

      if (field.type === "countries") {
        wrapper.appendChild(createCountryMultiselect(field));
      } else if (field.type === "checkbox") {
        const row = document.createElement("div");
        row.className = "field-checkbox-row";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = field.path;
        input.dataset.path = field.path;
        input.dataset.type = field.type;
        row.appendChild(input);
        const enableLabel = document.createElement("span");
        enableLabel.textContent = ui("enable");
        row.appendChild(enableLabel);
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
        note.textContent = field.note === "Requires restart" ? ui("requiresRestart") : field.note;
        wrapper.appendChild(note);
      }

      fieldsStack.appendChild(wrapper);
    });

    panel.appendChild(fieldsStack);

    if (section.hasBlocklistStatus) {
      buildBlocklistStatusPanel(panel);
    }

    panelsEl.appendChild(panel);
  });
}

function activateTab(panelId) {
  hideTabTooltip();
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.panel === panelId);
  });
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${panelId}`);
  });
  document.querySelector(".audit-section")?.classList.toggle("hidden", panelId === "logs" || panelId === "dashboard");
  if (panelId === "dashboard" && document.getElementById("dash-stats")) {
    loadDashboard().catch((error) => showBanner(error.message, "error"));
    if (document.getElementById("dash-auto-refresh")?.checked) {
      startDashboardAutoRefresh();
    }
  } else {
    stopDashboardAutoRefresh();
  }
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

    if (input.dataset.type === "countries") {
      setCountryMultiselectValue(input, value);
      return;
    }

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
    } else if (input.dataset.type === "countries") {
      value = getCountryMultiselectValue(input);
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
    container.textContent = ui("noAudit");
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
  if (window.stopNotificationPolling) {
    stopNotificationPolling();
  }
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
    showLogin(ui("enterApiKey"));
    return;
  }

  try {
    const status = await api("/status", { auth: false });
    if (!status.admin_enabled) {
      showLogin(ui("adminDisabled"));
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, apiKey);
    buildTabs();
    await loadConfig();
    showApp();
    if (window.initNotificationCenter) {
      initNotificationCenter();
    }
    if (window.startNotificationPolling) {
      startNotificationPolling(config);
    }
    activateTab("dashboard");
  } catch (error) {
    sessionStorage.removeItem(STORAGE_KEY);
    if (error.message.includes("Invalid or missing admin API key")) {
      showLogin(ui("invalidApiKey"));
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
    if (window.restartNotificationPolling) {
      restartNotificationPolling(config);
    }
    showBanner(ui("configReloaded"));
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
    if (window.restartNotificationPolling) {
      restartNotificationPolling(config);
    }
    showBanner(ui("configSaved"));
  } catch (error) {
    showBanner(error.message, "error");
  }
});

document.getElementById("reset-btn").addEventListener("click", async () => {
  if (!window.confirm(ui("resetConfirm"))) {
    return;
  }
  try {
    config = await api("/config/reset", { method: "POST" });
    populateForm();
    await loadAudit();
    showBanner(ui("configReset"));
  } catch (error) {
    showBanner(error.message, "error");
  }
});

initLocaleControls();
initTabTooltipScrollHide();
buildTabs();
showLogin();
