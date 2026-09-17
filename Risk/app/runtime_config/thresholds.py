from app import config as static_config


def merge_velocity_thresholds(custom: dict[str, int] | None = None) -> dict[str, int]:
    """Return full velocity threshold map; missing keys use factory defaults."""
    return {**static_config.VELOCITY_THRESHOLDS, **(custom or {})}


def merge_score_weights(custom: dict[str, int] | None = None) -> dict[str, int]:
    """Return full score-weight map; missing keys use factory defaults."""
    return {**static_config.SCORE_WEIGHTS, **(custom or {})}


def velocity_threshold(key: str, custom: dict[str, int] | None = None) -> int:
    merged = merge_velocity_thresholds(custom)
    if key not in merged:
        raise KeyError(f"Unknown velocity threshold key: {key}")
    return merged[key]
