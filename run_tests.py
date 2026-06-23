import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RISK = ROOT / "Risk"
ORCHESTRATOR = ROOT / "Orchestrator"


def repo_env() -> dict[str, str]:
    env = os.environ.copy()
    env["PYTHONPATH"] = str(ROOT)
    return env


def main() -> int:
    risk_code = subprocess.call(
        [sys.executable, "-m", "pytest", str(RISK / "tests"), "-v"],
        cwd=RISK,
        env=repo_env(),
    )

    orchestrator_code = subprocess.call(
        [sys.executable, "-m", "pytest", str(ORCHESTRATOR / "tests"), "-v"],
        cwd=ORCHESTRATOR,
        env=repo_env(),
    )

    return risk_code or orchestrator_code


if __name__ == "__main__":
    raise SystemExit(main())
