import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def repo_env() -> dict[str, str]:
    env = os.environ.copy()
    env["PYTHONPATH"] = str(ROOT)
    return env


services = [
    {
        "name": "Risk",
        "cwd": ROOT / "Risk",
        "cmd": [
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--port", "8001",
            "--reload",
        ],
    },
    {
        "name": "Orchestrator",
        "cwd": ROOT / "Orchestrator",
        "cmd": [
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--port", "8002",
            "--reload",
        ],
    },
]

processes = []

try:
    for service in services:
        print(f"Starting {service['name']}...")

        p = subprocess.Popen(
            service["cmd"],
            cwd=service["cwd"],
            env=repo_env(),
        )

        processes.append(p)

    for p in processes:
        p.wait()

except KeyboardInterrupt:
    print("Stopping all services...")
    for p in processes:
        p.terminate()
