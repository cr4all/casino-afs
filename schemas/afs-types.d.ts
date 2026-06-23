/** AFS scoring types — event_type values aligned with casino-api-contract. */

export type PlatformEventType =
  | "wallet.bet"
  | "wallet.win"
  | "wallet.rollback"
  | "game.bet"
  | "payment.deposit"
  | "payment.withdraw"
  | "bonus.created"
  | "bonus.completed"
  | "affiliate.commission"
  | "notification.send";

/** Event types scored by AFS (platform subset + auth gates). */
export type ScoredEventType =
  | "wallet.bet"
  | "wallet.win"
  | "game.bet"
  | "payment.deposit"
  | "payment.withdraw"
  | "bonus.created"
  | "player.signup"
  | "player.signup.failed"
  | "player.login"
  | "player.login.failed";

export type Channel = "web" | "mobile" | "api";

export interface UserData {
  user_id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
}

export interface ContextData {
  ip?: string | null;
  user_agent?: string | null;
  device_id?: string | null;
  country?: string | null;
  fingerprint?: string | null;
  fingerprint_version?: string | null;
  browser_language?: string | null;
  timezone?: string | null;
  platform?: string | null;
  screen_resolution?: string | null;
}

export interface TransactionData {
  amount?: number | null;
  currency?: string | null;
  payment_method_type?: string | null;
  payment_method_key?: string | null;
}

export interface MetadataData {
  channel?: Channel | null;
  session_id?: string | null;
  referrer?: string | null;
  failure_reason?: string | null;
}

/** POST /evaluate and mapped platform envelope. */
export interface CanonicalEvent {
  event_id: string;
  event_type: ScoredEventType;
  timestamp: string;
  user: UserData;
  context: ContextData;
  transaction?: TransactionData | null;
  metadata?: MetadataData | null;
}

/** casino-api-contract PlatformEventEnvelope (async RabbitMQ). */
export interface PlatformEventEnvelope {
  event_id: string;
  event_type: PlatformEventType;
  occurred_at: string;
  version: "1.0";
  data: Record<string, unknown>;
}

export type Decision = "allow" | "challenge" | "block";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface EngineResult {
  engine: string;
  score: number;
  signals: string[];
}

export interface EvaluateResponse {
  event_id: string;
  user_id: string;
  event_type: ScoredEventType;
  decision: Decision;
  final_score: number;
  risk_level: RiskLevel;
  engines: Record<string, EngineResult>;
  latency_ms: number;
  source: "sync" | "async";
  scored_at: string;
}

export type RiskAction =
  | "allow"
  | "hold_withdrawal"
  | "block_login"
  | "reject_signup"
  | "rate_limit_ip"
  | "rate_limit_signup"
  | "block_deposit"
  | "block_bet"
  | "hold_win_credit"
  | "block"
  | "require_mfa"
  | "manual_review_withdrawal"
  | "step_up_verification"
  | "flag_for_review";

export interface RiskActionMessage {
  event_id: string;
  user_id: string;
  event_type: string;
  decision: Decision;
  final_score: number;
  risk_level: RiskLevel;
  action: RiskAction;
  signals: string[];
  processed_at: string;
}
