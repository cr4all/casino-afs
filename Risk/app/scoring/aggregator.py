from app.models import EngineResult, RiskLevel
from app.runtime_config import get_runtime_config


def aggregate(engine_results: dict[str, EngineResult]) -> tuple[int, RiskLevel]:
    total = sum(result.score for result in engine_results.values())
    total = min(total, 100)

    thresholds = get_runtime_config().decision_thresholds
    if total < thresholds.challenge:
        level: RiskLevel = "low"
    elif total < thresholds.high:
        level = "medium"
    elif total < thresholds.block:
        level = "high"
    else:
        level = "critical"

    return total, level
