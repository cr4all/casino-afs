from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


Decision = Literal["allow", "challenge", "block"]
RiskLevel = Literal["low", "medium", "high", "critical"]


class EngineResult(BaseModel):
    engine: str
    score: int
    signals: list[str] = Field(default_factory=list)


class EvaluateResponse(BaseModel):
    event_id: str
    user_id: str
    event_type: str
    decision: Decision
    final_score: int
    risk_level: RiskLevel
    engines: dict[str, EngineResult]
    latency_ms: int
    source: str
    scored_at: datetime


class RiskResultMessage(EvaluateResponse):
    published_at: datetime = Field(default_factory=datetime.utcnow)


class RiskActionMessage(BaseModel):
    event_id: str
    user_id: str
    event_type: str
    decision: Decision
    final_score: int
    risk_level: RiskLevel
    action: str
    signals: list[str] = Field(default_factory=list)
    processed_at: datetime = Field(default_factory=datetime.utcnow)
