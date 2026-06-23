#!/usr/bin/env bash
# Run on the Ubuntu server from the repo root: bash scripts/deploy-check.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== AFS deploy check ($(date -u +%Y-%m-%dT%H:%M:%SZ)) ==="
echo "Working directory: $ROOT"
echo

if [[ ! -f docker-compose.yml ]]; then
  echo "ERROR: docker-compose.yml not found. cd to the afs repo root first."
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "WARN: .env missing — copy .env.docker.example to .env and set secrets."
fi

echo "=== docker compose ps ==="
docker compose ps
echo

echo "=== Required services ==="
for svc in postgres redis rabbitmq risk orchestrator; do
  if ! docker compose ps --status running --services | grep -qx "$svc"; then
    echo "FAIL: $svc is not running"
  else
    echo "OK:   $svc is running"
  fi
done
echo

echo "=== Risk /health ==="
if curl -sf --max-time 5 http://127.0.0.1:8001/health | python3 -m json.tool; then
  echo
else
  echo "FAIL: Risk not reachable on http://127.0.0.1:8001/health"
  echo "=== risk logs (last 25 lines) ==="
  docker compose logs risk --tail 25
  echo
fi

echo "=== Orchestrator /health ==="
curl -sf --max-time 5 http://127.0.0.1:8002/health | python3 -m json.tool || echo "WARN: Orchestrator not reachable on :8002"
echo

echo "=== RabbitMQ env inside Risk container ==="
docker compose exec -T risk env 2>/dev/null | grep '^RABBITMQ_' | sort || echo "WARN: cannot read Risk env"
echo

echo "=== RabbitMQ logs (last 15 lines) ==="
docker compose logs rabbitmq --tail 15
echo

echo "=== POST /evaluate smoke test ==="
RESP="$(curl -sf --max-time 10 -X POST http://127.0.0.1:8001/evaluate \
  -H 'Content-Type: application/json' \
  -d '{
    "event_id":"deploy-check-1",
    "event_type":"player.login",
    "timestamp":"2026-06-22T12:00:00Z",
    "user":{"user_id":"1","email":"test@example.com"},
    "context":{"ip":"1.2.3.4","country":"DE","fingerprint":"a1b2c3d4e5f6789012345678abcdef01","user_agent":"Mozilla/5.0"},
    "metadata":{"channel":"web"}
  }' 2>&1)" || true

if [[ -n "$RESP" ]]; then
  echo "$RESP" | python3 -m json.tool 2>/dev/null || echo "$RESP"
else
  echo "FAIL: empty response from /evaluate"
fi

echo
echo "=== Done ==="
echo "If RabbitMQ consumer failed: ensure .env has RABBITMQ_USER/PASSWORD (no old RABBITMQ_URL to 10.x)."
echo "After password change: docker compose down && docker volume rm afs_rabbitmq_data && docker compose up -d --build"
