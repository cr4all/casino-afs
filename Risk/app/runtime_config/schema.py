from pydantic import BaseModel, Field, field_validator, model_validator


class DecisionThresholds(BaseModel):
    challenge: int = Field(31, ge=0, le=100)
    high: int = Field(61, ge=0, le=100)
    block: int = Field(81, ge=0, le=100)

    @field_validator("high")
    @classmethod
    def high_after_challenge(cls, value: int, info) -> int:
        challenge = info.data.get("challenge", 31)
        if value <= challenge:
            raise ValueError("high threshold must be greater than challenge threshold")
        return value

    @field_validator("block")
    @classmethod
    def block_after_high(cls, value: int, info) -> int:
        high = info.data.get("high", 61)
        if value <= high:
            raise ValueError("block threshold must be greater than high threshold")
        return value


class OperatorConfig(BaseModel):
    platform_name: str = "casino"
    licensed_markets: str = "DE,MT,GB,SE,FI,NL,AT,IE"

    def licensed_market_set(self) -> set[str]:
        return {code.strip().upper() for code in self.licensed_markets.split(",") if code.strip()}


class IpIntelConfig(BaseModel):
    enabled: bool = True
    cache_ttl_seconds: int = Field(86400, ge=60)
    timeout_seconds: float = Field(3.0, ge=0.5, le=30.0)
    fail_open: bool = True


class AmlBlocklistConfig(BaseModel):
    enabled: bool = True
    crypto_enabled: bool = True
    bank_enabled: bool = True
    ewallet_enabled: bool = True
    card_enabled: bool = True
    country_enabled: bool = True
    sync_ofac_crypto_enabled: bool = True
    sync_ofac_countries_enabled: bool = True
    sync_interval_hours: int = Field(24, ge=1, le=168)
    fail_open: bool = True
    use_lists_sanctioned_countries: bool = True
    crypto_hit_score: int = Field(90, ge=0, le=100)
    country_hit_score: int = Field(90, ge=0, le=100)
    manual_crypto_wallets: list[str] = Field(default_factory=list)
    manual_bank_accounts: list[str] = Field(default_factory=list)
    manual_ewallet_accounts: list[str] = Field(default_factory=list)
    manual_card_accounts: list[str] = Field(default_factory=list)
    manual_countries: list[str] = Field(default_factory=list)


class AmlConfig(BaseModel):
    single_deposit_threshold: int = Field(2_000, ge=0)
    large_deposit_threshold: int = Field(10_000, ge=0)
    withdrawal_review_threshold: int = Field(1_000, ge=0)
    structuring_threshold: int = Field(3_000, ge=0)
    micro_deposit_max: int = Field(10, ge=0)
    high_stake_bet_threshold: int = Field(500, ge=0)
    blocklist: AmlBlocklistConfig = Field(default_factory=AmlBlocklistConfig)


class FingerprintConfig(BaseModel):
    required_channels: list[str] = Field(default_factory=lambda: ["web", "mobile"])
    min_length: int = Field(16, ge=8, le=128)
    max_length: int = Field(64, ge=16, le=256)
    suspicious_values: list[str] = Field(default_factory=list)


class StringListConfig(BaseModel):
    disposable_domains: list[str] = Field(default_factory=list)
    generic_names: list[str] = Field(default_factory=list)
    role_based_email_locals: list[str] = Field(default_factory=list)
    suspicious_email_tlds: list[str] = Field(default_factory=list)
    suspicious_email_local_tokens: list[str] = Field(default_factory=list)
    high_risk_countries: list[str] = Field(default_factory=list)
    sanctioned_countries: list[str] = Field(default_factory=list)
    bot_user_agent_tokens: list[str] = Field(default_factory=list)
    emulator_ua_tokens: list[str] = Field(default_factory=list)
    suspicious_referrers: list[str] = Field(default_factory=list)
    bonus_abuse_referrer_tokens: list[str] = Field(default_factory=list)


class WithdrawalMethodConfig(BaseModel):
    enabled: bool = True
    distinct_users_medium: int = Field(2, ge=2, le=100)
    distinct_users_high: int = Field(3, ge=2, le=100)
    distinct_users_critical: int = Field(4, ge=2, le=100)
    medium_score: int = Field(35, ge=0, le=100)
    high_score: int = Field(55, ge=0, le=100)
    critical_score: int = Field(80, ge=0, le=100)

    @model_validator(mode="after")
    def validate_threshold_order(self) -> "WithdrawalMethodConfig":
        if not (self.distinct_users_medium <= self.distinct_users_high <= self.distinct_users_critical):
            raise ValueError(
                "distinct_users thresholds must be ordered: medium <= high <= critical"
            )
        return self


class LoggingConfig(BaseModel):
    sync_enabled: bool = False
    async_enabled: bool = False


class BettingPatternConfig(BaseModel):
    enabled: bool = True
    burst_window_seconds: int = Field(300, ge=60, le=3600)
    game_bet_burst_medium: int = Field(10, ge=1, le=1000)
    game_bet_burst_high: int = Field(20, ge=1, le=1000)
    game_bet_burst_critical: int = Field(35, ge=1, le=1000)
    game_bet_medium_score: int = Field(25, ge=0, le=100)
    game_bet_high_score: int = Field(40, ge=0, le=100)
    game_bet_critical_score: int = Field(60, ge=0, le=100)
    wallet_bet_burst_medium: int = Field(20, ge=1, le=1000)
    wallet_bet_burst_high: int = Field(40, ge=1, le=1000)
    wallet_bet_burst_critical: int = Field(70, ge=1, le=1000)
    wallet_bet_medium_score: int = Field(20, ge=0, le=100)
    wallet_bet_high_score: int = Field(35, ge=0, le=100)
    wallet_bet_critical_score: int = Field(50, ge=0, le=100)
    wallet_win_burst_medium: int = Field(8, ge=1, le=1000)
    wallet_win_burst_high: int = Field(15, ge=1, le=1000)
    wallet_win_burst_critical: int = Field(25, ge=1, le=1000)
    wallet_win_medium_score: int = Field(25, ge=0, le=100)
    wallet_win_high_score: int = Field(45, ge=0, le=100)
    wallet_win_critical_score: int = Field(65, ge=0, le=100)
    win_rate_min_bets: int = Field(5, ge=1, le=1000)
    win_rate_high_ratio: float = Field(0.75, ge=0.0, le=1.0)
    win_rate_critical_ratio: float = Field(0.9, ge=0.0, le=1.0)
    win_rate_high_score: int = Field(40, ge=0, le=100)
    win_rate_critical_score: int = Field(65, ge=0, le=100)

    @model_validator(mode="after")
    def validate_threshold_order(self) -> "BettingPatternConfig":
        for medium, high, critical, label in (
            (self.game_bet_burst_medium, self.game_bet_burst_high, self.game_bet_burst_critical, "game_bet_burst"),
            (self.wallet_bet_burst_medium, self.wallet_bet_burst_high, self.wallet_bet_burst_critical, "wallet_bet_burst"),
            (self.wallet_win_burst_medium, self.wallet_win_burst_high, self.wallet_win_burst_critical, "wallet_win_burst"),
        ):
            if not (medium <= high <= critical):
                raise ValueError(f"{label} thresholds must be ordered: medium <= high <= critical")
        if self.win_rate_high_ratio > self.win_rate_critical_ratio:
            raise ValueError("win_rate_high_ratio must be <= win_rate_critical_ratio")
        return self


class StepUpVerificationConfig(BaseModel):
    enabled: bool = True
    grant_ttl_days: int = Field(7, ge=1, le=365)
    max_verified_age_minutes: int = Field(5, ge=1, le=120)
    downgrade_challenge_to_allow: bool = True
    allowed_hostnames: list[str] = Field(default_factory=list)
    applicable_event_types: list[str] = Field(
        default_factory=lambda: [
            "player.login",
            "player.signup",
            "payment.deposit",
        ]
    )


class FeatureFlags(BaseModel):
    sync_publish_audit: bool = True
    decision_cache_ttl_seconds: int = Field(60, ge=0)
    redis_enabled: bool = False
    redis_velocity_ip_ttl: int = Field(3600, ge=60)
    redis_velocity_domain_ttl: int = Field(86400, ge=60)
    rabbitmq_enabled: bool = True
    rabbitmq_publish_results: bool = True
    rabbitmq_events_exchange: str = "casino.events"
    rabbitmq_events_exchange_type: str = "topic"
    rabbitmq_events_queue: str = "casino.afs"
    rabbitmq_events_binding_key: str = "#"
    rabbitmq_prefetch: int = Field(10, ge=1, le=1000)
    rabbitmq_results_queue: str = "risk.results"


class RuntimeConfigData(BaseModel):
    version: int = 1
    decision_thresholds: DecisionThresholds = Field(default_factory=DecisionThresholds)
    operator: OperatorConfig = Field(default_factory=OperatorConfig)
    ip_intel: IpIntelConfig = Field(default_factory=IpIntelConfig)
    aml: AmlConfig = Field(default_factory=AmlConfig)
    fingerprint: FingerprintConfig = Field(default_factory=FingerprintConfig)
    lists: StringListConfig = Field(default_factory=StringListConfig)
    velocity_thresholds: dict[str, int] = Field(default_factory=dict)
    score_weights: dict[str, int] = Field(default_factory=dict)
    critical_signals: list[str] = Field(default_factory=list)
    withdrawal_method: WithdrawalMethodConfig = Field(default_factory=WithdrawalMethodConfig)
    betting_patterns: BettingPatternConfig = Field(default_factory=BettingPatternConfig)
    step_up_verification: StepUpVerificationConfig = Field(default_factory=StepUpVerificationConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)
    features: FeatureFlags = Field(default_factory=FeatureFlags)

    @model_validator(mode="before")
    @classmethod
    def migrate_legacy_file_logging(cls, data):
        if not isinstance(data, dict) or "logging" in data:
            return data

        features = data.get("features") or {}
        file_enabled = features.get("evaluate_file_log_enabled", False)
        data["logging"] = {
            "sync_enabled": file_enabled,
            "async_enabled": file_enabled,
        }
        return data

    def list_set(self, name: str) -> set[str]:
        values = getattr(self.lists, name)
        if name.endswith("_countries"):
            return {value.strip().upper() for value in values if value.strip()}
        if name == "suspicious_email_tlds":
            return {value.strip().lower() for value in values if value.strip()}
        return {value.strip().lower() for value in values if value.strip()}
