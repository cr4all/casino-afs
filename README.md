# AFS — Anti-Fraud & Risk Service for iGaming

AFS is a fraud and compliance risk platform for casino / iGaming operators. It scores player events (signup, login, deposit, withdrawal, bet) in real time and returns a decision: **allow**, **challenge**, or **block**.

The platform supports:

- **Synchronous API** — your backend calls Risk during login/signup/checkout and waits for a decision
- **Asynchronous pipeline** — events flow through RabbitMQ; the Orchestrator persists audit logs and publishes enforcement actions

---

## Table of contents

1. [Architecture](#architecture)
2. [Project structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Step 1 — Install dependencies](#step-1--install-dependencies)
5. [Step 2 — Configure environment](#step-2--configure-environment)
6. [Step 3 — Start infrastructure (optional)](#step-3--start-infrastructure-optional)
7. [Step 4 — Run the services](#step-4--run-the-services)
8. [Step 5 — Verify health](#step-5--verify-health)
9. [Step 6 — Integrate your platform](#step-6--integrate-your-platform)
10. [Step 7 — Collect device fingerprint (web)](#step-7--collect-device-fingerprint-web)
11. [Step 8 — Call the Risk API (sync)](#step-8--call-the-risk-api-sync)
12. [Step 9 — Use async events (RabbitMQ)](#step-9--use-async-events-rabbitmq)
13. [Step 10 — Consume actions (Orchestrator)](#step-10--consume-actions-orchestrator)
14. [Event reference](#event-reference)
15. [Decisions and risk levels](#decisions-and-risk-levels)
16. [Scoring engines](#scoring-engines)
17. [Configuration reference](#configuration-reference)
18. [Testing](#testing)
19. [Docker](#docker)
20. [Production notes](#production-notes)
21. [Troubleshooting](#troubleshooting)

---

## Architecture

AFS sits behind **your casino backend**. The player never calls AFS directly. Your API collects device context, builds a canonical event, sends it to Risk (sync or async), and enforces the decision.

### End-to-end platform diagram

```mermaid
flowchart TB
    subgraph Client["Player client"]
        WEB["Web browser\n(FingerprintJS OSS)"]
        MOB["Native app\n(device_id)"]
    end

    subgraph Platform["Your casino / iGaming backend"]
        API["Your API\n(login, signup, payments)"]
        ENF["Decision enforcement\nallow / challenge / block"]
        ACT["Action consumer\n(optional, async mode)"]
    end

    subgraph AFS["AFS services"]
        RISK["Risk Service\n:8001\n13 scoring engines"]
        ORCH["Orchestrator\n:8002\naudit + action mapping"]
    end

    subgraph Infra["Shared infrastructure"]
        RMQ[("RabbitMQ")]
        DB[("SQLite / Postgres\ntrusted devices\n+ audit log")]
        REDIS[("Redis\noptional\nvelocity + cache")]
    end

    WEB -->|"fingerprint, UA,\ntimezone, screen"| API
    MOB -->|"device_id,\nchannel=mobile"| API
    API -->|"server-side: ip,\ncountry, user profile"| API

    API -->|"① Sync\nPOST /evaluate\ncanonical event"| RISK
    API -->|"② Async\npublish casino.events\n(same canonical event)"| RMQ

    RMQ -->|"queue: casino.afs\nbinding: #"| RISK
    RISK --> REDIS
    RISK --> DB
    RISK -->|"risk.results"| RMQ
    RMQ -->|"risk.results"| ORCH
    ORCH --> DB
    ORCH -->|"risk.actions"| RMQ
    RMQ -->|"risk.actions"| ACT

    RISK -->|"EvaluateResponse\nallow / challenge / block"| API
    API --> ENF
    ACT --> ENF
    ENF -->|"proceed, MFA,\nhold payout, reject"| Client
```

### Fingerprint and device context

Fingerprint is **not** a separate queue or service. It is collected on the client, merged into `context` by your backend, and scored as part of every canonical event (sync or async).

```mermaid
flowchart LR
    subgraph Collect["1 — Collect (client)"]
        FPJS["FingerprintJS OSS\nvisitorId"]
        BR["Browser signals\nUA, timezone, language"]
        NATIVE["Native apps\ndevice_id instead of FP"]
    end

    subgraph Merge["2 — Merge (your backend)"]
        CTX["context object\nfingerprint + ip + country\n+ user_agent + …"]
    end

    subgraph Send["3 — Send to AFS"]
        SYNC["Sync: POST /evaluate"]
        ASYNC["Async: RabbitMQ\ncasino.events"]
    end

    subgraph Score["4 — Score (Risk)"]
        ENG["fingerprint engine\n+ trusted_device engine\n+ velocity engine\n+ 10 others"]
        TRUST["Register trusted device\n(on allow/challenge login|signup)"]
    end

    FPJS --> CTX
    BR --> CTX
    NATIVE --> CTX
    CTX --> SYNC
    CTX --> ASYNC
    SYNC --> ENG
    ASYNC --> ENG
    ENG --> TRUST
    TRUST --> DB[("Shared DB")]
```

| Field | Where it comes from |
|-------|---------------------|
| `context.fingerprint` | FingerprintJS `visitorId` (web) |
| `context.device_id` | Native iOS/Android app |
| `context.ip`, `context.country` | Your backend (request / geo) |
| `context.user_agent`, `timezone`, … | Browser or app |
| `metadata.channel` | `"web"`, `"mobile"`, or `"api"` |

Helper script: `GET /integration/device-context` · served from Risk at `/client/fingerprint-collector.js`

### Sync vs async decision paths

Both paths use the **same** `RiskEvaluator` and scoring engines. The difference is transport and how your backend gets the decision.

```mermaid
sequenceDiagram
    autonumber
    participant P as Player
    participant B as Your backend
    participant R as Risk :8001
    participant Q as RabbitMQ
    participant O as Orchestrator :8002

    Note over P,B: Device context collected first (fingerprint or device_id)

    rect rgb(240, 248, 255)
        Note right of B: Sync path — gate before action completes
        P->>B: login / signup / withdrawal
        B->>B: build canonical event (context.fingerprint, ip, user, …)
        B->>R: POST /evaluate
        R->>R: 13 engines → allow | challenge | block
        R-->>B: EvaluateResponse (~50–200 ms)
        opt SYNC_PUBLISH_AUDIT=true
            R->>Q: publish risk.results (background audit)
        end
        B->>B: enforce decision immediately
        B-->>P: proceed / MFA / rejected
    end

    rect rgb(255, 248, 240)
        Note right of B: Async path — decoupled scoring + action queue
        P->>B: login_failed, bet, audit events, …
        B->>B: build canonical event
        B->>Q: publish → exchange casino.events
        Q->>R: consume queue casino.afs
        R->>R: 13 engines → allow | challenge | block
        R->>Q: publish risk.results
        Q->>O: consume risk.results
        O->>O: write audit log + map decision → action
        O->>Q: publish risk.actions
        Q->>B: consume risk.actions (require_mfa, hold_withdrawal, …)
        B->>B: enforce action asynchronously
    end
```

| Path | Endpoint / queue | Best for | Decision returned via |
|------|------------------|----------|------------------------|
| **Sync** | `POST /evaluate` | Signup, login, deposit, withdrawal (real-time gate) | HTTP response to your backend |
| **Async in** | Exchange `casino.events` → queue `casino.afs` | Failed auth, bets, fire-and-forget audit | — |
| **Async out** | Queue `risk.actions` | Enforcement after async scoring | RabbitMQ message to your backend |

Recommended mode by event:

| Player action | Event type | Mode |
|---------------|------------|------|
| Registration | `signup` | Sync |
| Login | `login` | Sync |
| Withdrawal | `withdrawal` | Sync (always before payout) |
| Deposit | `deposit` | Sync |
| Login / signup failed | `login_failed`, `signup_failed` | Async |
| Place bet | `bet` | Sync or async |

### RabbitMQ topology

```mermaid
flowchart LR
    subgraph Casino["Your casino backend"]
        PUB["Event publisher"]
        SUB["Action consumer"]
    end

    subgraph RabbitMQ["RabbitMQ"]
        EX(("casino.events\ntopic exchange"))
        QIN["casino.afs\n(inbound)"]
        QRES["risk.results"]
        QACT["risk.actions"]
    end

    subgraph AFS["AFS"]
        RISK["Risk Service"]
        ORCH["Orchestrator"]
    end

    PUB -->|"routing keys e.g.\nplayer.login\ntransaction.withdrawal\nplayer.login.failed"| EX
    EX -->|"binding: #"| QIN
    QIN --> RISK
    RISK --> QRES
    QRES --> ORCH
    ORCH --> QACT
    QACT --> SUB
```

| Component | Name | Direction | Purpose |
|-----------|------|-----------|---------|
| Exchange | `casino.events` (topic) | Casino → AFS | Platform publishes player events |
| Queue | `casino.afs` | AFS consumes | Inbound risk events (binding `#`) |
| Queue | `risk.results` | Risk → Orchestrator | Full scoring result + audit |
| Queue | `risk.actions` | Orchestrator → Casino | Mapped enforcement action |

Legacy mode (no casino exchange): set `RABBITMQ_EVENTS_EXCHANGE=` empty and publish directly to queue `risk.events`.

Non-risk messages on the same exchange (e.g. `bonus.granted`) are **acked and skipped** — only signup, login, deposit, withdrawal, bet, and `*_failed` auth events are scored.

### Scoring pipeline (inside Risk)

Every event — sync or async — runs the same pipeline:

```mermaid
flowchart TD
    IN["Canonical event\n(event_id, event_type, user,\ncontext incl. fingerprint, transaction)"]
    ENG["13 engines\nemail · phone · ip · identity · device\nfingerprint · signup · login · auth_failure\ntrusted_device · gaming · velocity · transaction"]
    AGG["Aggregator\ncapped score 0–100"]
    DEC{"Decision\nallow · challenge · block"}
    TRUST["Trusted device registry\n(login|signup + allow|challenge)"]
    OUT["EvaluateResponse"]
    PUB["Publish risk.results\n(async always; sync if SYNC_PUBLISH_AUDIT)"]

    IN --> ENG --> AGG --> DEC --> OUT
    DEC --> TRUST
    OUT --> PUB
```

Hard-block signals (e.g. `new_device_on_withdrawal`, `brute_force_login_suspected`, `sanctioned_country`) force **block** regardless of score. Withdrawals are blocked at **medium** risk or above.

### Shared infrastructure

```mermaid
flowchart TB
    RISK["Risk Service"]
    ORCH["Orchestrator"]
    DB[("DATABASE_URL\nSQLite or Postgres")]
    REDIS[("REDIS_URL\noptional")]

    RISK --> DB
    RISK --> REDIS
    ORCH --> DB

    DB --- TD["trusted_devices\n(fingerprint / device_id per user)"]
    DB --- AL["risk_audit_log\n(every scored event)"]
    REDIS --- VEL["velocity counters\n(IP, fingerprint, domain)"]
    REDIS --- CACHE["decision cache\n(sync, by event_id)"]
```

| Component | Required | Used for |
|-----------|----------|----------|
| SQLite / Postgres | Yes | Trusted devices, audit log |
| RabbitMQ | Async mode only | Events in, results out, actions out |
| Redis | Optional | Cross-instance velocity; sync decision cache |

### Decision enforcement (your backend)

```mermaid
flowchart TD
    D{"decision"}
    D -->|allow| A["Proceed with action"]
    D -->|challenge| C["Step-up: MFA, captcha,\nKYC verification"]
    D -->|block| B["Reject: block login,\nhold withdrawal, reject signup"]

    C --> MAP["Async only: action from risk.actions\ne.g. require_mfa,\nmanual_review_withdrawal"]
    B --> MAP2["Async only: action from risk.actions\ne.g. hold_withdrawal,\nblock_login, rate_limit_ip"]
```

Sync callers read `decision` from the `/evaluate` HTTP response. Async callers subscribe to `risk.actions` and map `action` to platform behaviour (see [Step 10 — Consume actions](#step-10--consume-actions-orchestrator)).

---

## Project structure

```
AFS/
├── Risk/                 # Risk scoring service (FastAPI, port 8001)
│   ├── app/
│   │   ├── api/          # HTTP routes (/evaluate, /health, …)
│   │   ├── engines/      # 13 scoring engines
│   │   ├── messaging/    # RabbitMQ consumer + publisher
│   │   ├── services/     # Evaluator, trusted devices
│   │   └── …
│   └── tests/
├── Orchestrator/         # Result consumer + action publisher (port 8002)
│   ├── app/
│   └── tests/
├── shared/               # Shared DB models (TrustedDevice, RiskAuditLog)
│   └── db/
├── client/               # Browser fingerprint helper (FingerprintJS OSS)
├── data/                 # SQLite database (created at runtime)
├── run_all.py            # Start Risk + Orchestrator together
├── run_tests.py          # Run all tests
├── requirement.txt
├── requirement-prod.txt  # Runtime deps for Docker (no pytest)
└── Dockerfile            # Multi-stage: risk | orchestrator
├── docker-compose.yml    # Postgres + RabbitMQ + Risk + Orchestrator
├── .env.docker.example   # Optional compose env overrides
```

---

## Prerequisites

| Requirement | Version | Required |
|-------------|---------|----------|
| Python | 3.11+ (3.14 not supported yet) | Yes |
| RabbitMQ | 3.x | For async mode |
| Redis | 6+ | Optional (velocity + cache) |
| Docker | Any recent | Optional |

Use Python 3.11 explicitly on Windows if 3.14 is your default:

```powershell
py -3.11 --version
```

---

## Step 1 — Install dependencies

From the repository root:

```powershell
cd "f:\Dev Works\AFS"
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirement.txt
```

---

## Step 2 — Configure environment

Copy `.env.docker.example` to `.env` in the **repository root**. Risk, Orchestrator, and Docker Compose all use this single file.

### Risk service settings

```env
# Database (shared between Risk and Orchestrator)
DATABASE_URL=sqlite:///../data/afs_risk.db

# iGaming operator
LICENSED_MARKETS=DE,MT,GB,SE,FI,NL,AT,IE

# IP intelligence (free tier: ip-api.com + ippriv.com fallback)
IP_INTEL_ENABLED=true
IP_INTEL_FAIL_OPEN=true

# Redis (optional — in-memory velocity used if disabled)
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379/0

# RabbitMQ — async inbound events
RABBITMQ_ENABLED=true
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
RABBITMQ_EVENTS_QUEUE=risk.events
RABBITMQ_PREFETCH=10

# RabbitMQ — outbound results to Orchestrator
RABBITMQ_PUBLISH_RESULTS=true
RABBITMQ_RESULTS_QUEUE=risk.results

# Sync API behaviour
SYNC_PUBLISH_AUDIT=true
DECISION_CACHE_TTL_SECONDS=60
```

### Orchestrator settings

```env
DATABASE_URL=sqlite:///../data/afs_risk.db

RABBITMQ_URL=amqp://guest:guest@localhost:5672/
RABBITMQ_RESULTS_QUEUE=risk.results
RABBITMQ_ACTIONS_QUEUE=risk.actions
RABBITMQ_PREFETCH=10
```

### Local development without RabbitMQ

If you only need the sync API:

```env
RABBITMQ_ENABLED=false
RABBITMQ_PUBLISH_RESULTS=false
```

---

## Step 3 — Start infrastructure (optional)

### RabbitMQ (Docker)

```powershell
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Management UI: http://localhost:15672 (guest / guest)

Queues and exchanges are declared automatically on startup:

**Casino platform subscription (default inbound)**

| Component | Value |
|-----------|-------|
| Exchange | `casino.events` (topic) |
| Queue | `casino.afs` |
| Binding | `#` (all platform events) |
| Consumer | Risk service |

**AFS internal / outbound**

| Queue | Producer | Consumer |
|-------|----------|----------|
| `risk.results` | Risk service | Orchestrator |
| `risk.actions` | Orchestrator | Your platform |

The Risk consumer **acks and skips** non-risk events (e.g. `bonus.granted`) when the binding is `#`. Only `signup`, `login`, `deposit`, `withdrawal`, `bet`, and `*_failed` auth events are scored.

### Redis (optional)

```powershell
docker run -d --name redis -p 6379:6379 redis:7
```

Then set `REDIS_ENABLED=true` in the root `.env`.

---

## Step 4 — Run the services

Both services require `PYTHONPATH` pointing at the repo root (handled automatically by `run_all.py`).

### Option A — Start everything (recommended)

```powershell
py -3.11 run_all.py
```

This starts:

- **Risk** at http://localhost:8001
- **Orchestrator** at http://localhost:8002

### Option B — Run services individually

**PowerShell:**

```powershell
$env:PYTHONPATH = "f:\Dev Works\AFS"

# Terminal 1 — Risk
cd Risk
py -3.11 -m uvicorn app.main:app --port 8001 --reload

# Terminal 2 — Orchestrator
cd Orchestrator
py -3.11 -m uvicorn app.main:app --port 8002 --reload
```

### Option C — Risk only (sync API, no RabbitMQ)

```powershell
$env:PYTHONPATH = "f:\Dev Works\AFS"
cd Risk
$env:RABBITMQ_ENABLED = "false"
$env:RABBITMQ_PUBLISH_RESULTS = "false"
py -3.11 -m uvicorn app.main:app --port 8001 --reload
```

---

## Step 5 — Verify health

```powershell
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8001/integration/device-context
```

Expected Risk health response:

```json
{
  "status": "ok",
  "rabbitmq_consumer_enabled": true,
  "rabbitmq_publish_results": true,
  "redis_enabled": false,
  "sync_publish_audit": true
}
```

Interactive API docs: http://localhost:8001/docs

---

## Step 6 — Integrate your platform

Your casino backend sits between the player and AFS. It must:

1. Collect device context (fingerprint, user agent, timezone) on the client
2. Add server-side data (IP, country, user profile)
3. Send a **canonical event** to Risk
4. Act on the decision (`allow` / `challenge` / `block`)

```
Player browser ──► Your API ──► AFS Risk ──► decision
                     │
                     ├── allow     → proceed
                     ├── challenge → MFA / step-up / manual review
                     └── block     → reject action
```

**Where to call Risk**

| Player action | Event type | Recommended mode |
|---------------|------------|------------------|
| Registration | `signup` | Sync `/evaluate` |
| Registration failed | `signup_failed` | Async |
| Login | `login` | Sync `/evaluate` |
| Login failed | `login_failed` | Async (or sync for rate limit) |
| Deposit | `deposit` | Sync |
| Withdrawal | `withdrawal` | Sync (always gate before payout) |
| Place bet | `bet` | Sync or async |

Use a **unique `event_id`** per request (UUID). Risk caches sync decisions by `event_id` when Redis is enabled.

---

## Step 7 — Collect device fingerprint (web)

Risk uses [FingerprintJS open-source](https://github.com/fingerprintjs/fingerprintjs) (MIT, free). The helper script is served from the Risk service.

### Add scripts to your frontend

```html
<script src="https://openfpcdn.io/fingerprintjs/v4/iife.min.js"></script>
<script src="http://localhost:8001/client/fingerprint-collector.js"></script>
```

### Collect context before signup/login

```javascript
async function getRiskContext() {
  const device = await collectDeviceContext();
  return {
    ...device,
    // Your backend adds these server-side:
    // ip, country, device_id (native apps)
  };
}

// Example: send to your backend during login
const ctx = await getRiskContext();
await fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, riskContext: ctx }),
});
```

### Fields collected

| Field | Source |
|-------|--------|
| `fingerprint` | FingerprintJS `visitorId` |
| `fingerprint_version` | FingerprintJS version |
| `user_agent` | `navigator.userAgent` |
| `browser_language` | `navigator.language` |
| `timezone` | `Intl` resolved timezone |
| `platform` | `navigator.platform` |
| `screen_resolution` | `screen.width x screen.height` |

For **native iOS/Android apps**, skip FingerprintJS and send `device_id` instead. Set `metadata.channel` to `"mobile"`.

See `GET /integration/device-context` for the live schema.

---

## Step 8 — Call the Risk API (sync)

### Endpoint

```
POST http://localhost:8001/evaluate
Content-Type: application/json
```

### Example — signup

```powershell
curl -X POST http://localhost:8001/evaluate `
  -H "Content-Type: application/json" `
  -d '{
    "event_id": "signup_001",
    "event_type": "signup",
    "timestamp": "2026-06-21T12:00:00Z",
    "user": {
      "user_id": "player_123",
      "email": "maria@gmail.com",
      "phone": "+491701234567",
      "name": "Maria Garcia"
    },
    "context": {
      "ip": "203.0.113.10",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      "device_id": "device_001",
      "country": "DE",
      "fingerprint": "a1b2c3d4e5f6789012345678abcdef01",
      "fingerprint_version": "v4.2.0",
      "browser_language": "de-DE",
      "timezone": "Europe/Berlin",
      "platform": "Win32",
      "screen_resolution": "1920x1080"
    },
    "metadata": {
      "channel": "web",
      "session_id": "sess_abc",
      "referrer": "google.com"
    }
  }'
```

### Example response

```json
{
  "event_id": "signup_001",
  "user_id": "player_123",
  "event_type": "signup",
  "decision": "allow",
  "final_score": 12,
  "risk_level": "low",
  "engines": {
    "email": { "engine": "email", "score": 0, "signals": [] },
    "velocity": { "engine": "velocity", "score": 0, "signals": [] }
  },
  "latency_ms": 45,
  "source": "sync",
  "scored_at": "2026-06-21T12:00:01Z"
}
```

### Act on the decision

```python
result = response.json()

if result["decision"] == "block":
    raise HTTPException(403, "Registration blocked for compliance reasons")

if result["decision"] == "challenge":
    # Require email OTP, KYC step-up, or captcha
    return {"status": "verification_required"}

# allow — proceed with registration
```

### Legacy endpoint

`POST /score` returns a simplified shape (`score`, `risk_level`, flat `signals` list) for backward compatibility.

---

## Step 9 — Use async events (RabbitMQ)

### Casino backend (recommended)

Your casino platform publishes to a **shared topic exchange**. AFS subscribes with:

```
Exchange: casino.events (topic)
Queue:    casino.afs
Binding:  #   (all platform events)
```

Configure in the root `.env` (defaults match this setup):

```env
RABBITMQ_EVENTS_EXCHANGE=casino.events
RABBITMQ_EVENTS_EXCHANGE_TYPE=topic
RABBITMQ_EVENTS_QUEUE=casino.afs
RABBITMQ_EVENTS_BINDING_KEY=#
```

**Publish from casino backend** — use routing keys such as `player.login`, `player.signup`, `transaction.withdrawal`:

```python
import asyncio
import json
import uuid
from datetime import datetime, timezone

import aio_pika

async def publish_casino_event(routing_key: str, event: dict):
    connection = await aio_pika.connect_robust("amqp://guest:guest@localhost:5672/")
    async with connection:
        channel = await connection.channel()
        exchange = await channel.declare_exchange("casino.events", aio_pika.ExchangeType.TOPIC, durable=True)
        body = json.dumps(event).encode()
        await exchange.publish(
            aio_pika.Message(body, content_type="application/json", delivery_mode=aio_pika.DeliveryMode.PERSISTENT),
            routing_key=routing_key,
        )

event = {
    "event_id": str(uuid.uuid4()),
    "event_type": "login_failed",
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "user": {"user_id": "player_123", "email": "maria@gmail.com"},
    "context": {"ip": "198.51.100.50", "user_agent": "Mozilla/5.0 ...", "country": "DE"},
    "metadata": {"channel": "web", "failure_reason": "invalid_password"},
}

asyncio.run(publish_casino_event("player.login.failed", event))
```

**Message body options**

- Flat canonical event (same as `POST /evaluate`)
- Wrapped envelope: `{ "payload": { ... } }`, `{ "data": { ... } }`, or `{ "event": { ... } }`
- `event_type` can be omitted if the routing key ends with a known suffix (`login`, `signup`, `withdrawal`, etc.)

Non-risk events on the same exchange are ignored safely (acked, not scored).

### Legacy direct queue (optional)

To use a dedicated queue without the casino exchange, set `RABBITMQ_EVENTS_EXCHANGE=` (empty) and `RABBITMQ_EVENTS_QUEUE=risk.events`.

The Risk consumer processes the message, scores it, and (if enabled) publishes the full result to `risk.results`.

### Login / signup failure events

Send these when authentication **fails** so velocity can detect brute-force attacks:

```json
{
  "event_id": "fail_001",
  "event_type": "login_failed",
  "timestamp": "2026-06-21T12:00:00Z",
  "user": { "user_id": "player_123", "email": "maria@gmail.com" },
  "context": { "ip": "198.51.100.50", "country": "DE" },
  "metadata": { "failure_reason": "invalid_password" }
}
```

After enough failures from the same IP, Risk emits `brute_force_login_suspected` and returns `block`.

---

## Step 10 — Consume actions (Orchestrator)

The Orchestrator:

1. Consumes `risk.results`
2. Writes an audit row to `risk_audit_log` (shared DB)
3. Maps the decision to an **action**
4. Publishes to `risk.actions`

Your platform should subscribe to `risk.actions` and enforce the action.

### Action mapping

| Decision | Event type | Action |
|----------|------------|--------|
| allow | any | `allow` |
| block | withdrawal | `hold_withdrawal` |
| block | login | `block_login` |
| block | signup | `reject_signup` |
| block | login_failed | `rate_limit_ip` |
| block | deposit | `block_deposit` |
| challenge | login | `require_mfa` |
| challenge | withdrawal | `manual_review_withdrawal` |
| challenge | signup | `step_up_verification` |

### Example action message

```json
{
  "event_id": "withdrawal_001",
  "user_id": "player_123",
  "event_type": "withdrawal",
  "decision": "block",
  "final_score": 85,
  "risk_level": "high",
  "action": "hold_withdrawal",
  "signals": ["new_device_on_withdrawal"],
  "processed_at": "2026-06-21T12:00:02Z"
}
```

### Python consumer sketch

```python
import asyncio
import json
import aio_pika

async def consume_actions():
    connection = await aio_pika.connect_robust("amqp://guest:guest@localhost:5672/")
    channel = await connection.channel()
    queue = await channel.declare_queue("risk.actions", durable=True)

    async with queue.iterator() as queue_iter:
        async for message in queue_iter:
            async with message.process():
                action = json.loads(message.body)
                if action["action"] == "hold_withdrawal":
                    # Flag withdrawal in your back-office
                    pass
                elif action["action"] == "require_mfa":
                    # Trigger MFA flow
                    pass

asyncio.run(consume_actions())
```

---

## Event reference

### Supported event types

| `event_type` | Description |
|--------------|-------------|
| `signup` | New account registration |
| `signup_failed` | Failed registration attempt |
| `login` | Successful authentication |
| `login_failed` | Failed login attempt |
| `deposit` | Player deposit |
| `withdrawal` | Player withdrawal |
| `bet` | Wager placed |

### Canonical event schema

```json
{
  "event_id": "string (unique)",
  "event_type": "signup | signup_failed | login | login_failed | deposit | withdrawal | bet",
  "timestamp": "ISO-8601 datetime",
  "user": {
    "user_id": "string (required)",
    "email": "string | null",
    "phone": "string | null",
    "name": "string | null"
  },
  "context": {
    "ip": "string | null",
    "user_agent": "string | null",
    "device_id": "string | null",
    "country": "ISO country code | null",
    "fingerprint": "FingerprintJS visitorId | null",
    "fingerprint_version": "string | null",
    "browser_language": "string | null",
    "timezone": "string | null",
    "platform": "string | null",
    "screen_resolution": "string | null"
  },
  "transaction": {
    "amount": "number | null",
    "currency": "string | null"
  },
  "metadata": {
    "channel": "web | mobile | api",
    "session_id": "string | null",
    "referrer": "string | null",
    "failure_reason": "string | null"
  }
}
```

`transaction` is required for `deposit`, `withdrawal`, and `bet`.

### Example — withdrawal

```json
{
  "event_id": "wd_001",
  "event_type": "withdrawal",
  "timestamp": "2026-06-21T14:00:00Z",
  "user": { "user_id": "player_123", "email": "maria@gmail.com" },
  "context": {
    "ip": "203.0.113.10",
    "country": "DE",
    "fingerprint": "a1b2c3d4e5f6789012345678abcdef01",
    "user_agent": "Mozilla/5.0 ..."
  },
  "transaction": { "amount": 500.0, "currency": "EUR" },
  "metadata": { "channel": "web" }
}
```

---

## Decisions and risk levels

### Decisions

| Decision | Meaning | Typical platform response |
|----------|---------|---------------------------|
| `allow` | Low risk | Proceed |
| `challenge` | Medium risk | MFA, captcha, step-up KYC |
| `block` | High/critical risk or critical signal | Reject action |

### Risk levels

Scores are aggregated from all engines (capped at 100):

| Level | Score range |
|-------|-------------|
| `low` | 0–30 |
| `medium` | 31–60 |
| `high` | 61–80 |
| `critical` | 81–100 |

### Hard blocks (examples)

These signals force `block` regardless of score:

- `disposable_email`
- `bulk_login_attack` / `bulk_signup_attack`
- `credential_stuffing_suspected`
- `brute_force_login_suspected`
- `sanctioned_country`
- `vpn_withdrawal_attempt` (on withdrawal)
- `new_device_on_withdrawal`
- `multi_account_fingerprint_abuse`
- `emulator_detected`

Withdrawals are always blocked at `medium` risk or above.

---

## Scoring engines

Risk runs **13 engines** on every event. Each returns a score (0–100) and signal names.

| Engine | Checks |
|--------|--------|
| `email` | Disposable email, format, suspicious TLD |
| `phone` | Format, repeated digits, missing on signup |
| `ip` | VPN/proxy/Tor/hosting (free APIs), high-risk country |
| `identity` | Name quality, generic names |
| `device` | Bot UA, emulators, missing UA |
| `fingerprint` | Missing/invalid FP, timezone mismatch, platform mismatch |
| `signup` | Suspicious referrer, API signup without device |
| `login` | Automated attempts, missing identifier |
| `auth_failure` | Brute-force velocity (`login_failed`, `signup_failed`) |
| `trusted_device` | New device on withdrawal, untrusted login/deposit |
| `gaming` | Licensed markets, sanctioned countries, bonus abuse |
| `velocity` | Bulk login/signup, credential stuffing, multi-account IP/device/FP |
| `transaction` | High amounts, structuring, micro-deposits, high stakes |

### Trusted devices

After a successful `login` or `signup` with decision `allow` or `challenge`, the fingerprint (or `device_id`) is stored in the shared database.

On later events:

- Withdrawal from an **unknown device** → `new_device_on_withdrawal` → block
- Login from an **unknown device** → `untrusted_device_login` → challenge (MFA)

---

## Configuration reference

All settings are environment variables (case-insensitive).

### Risk service

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///../data/afs_risk.db` | Shared DB path |
| `LICENSED_MARKETS` | `DE,MT,GB,SE,FI,NL,AT,IE` | Comma-separated ISO codes |
| `IP_INTEL_ENABLED` | `true` | VPN/proxy detection via free APIs |
| `IP_INTEL_FAIL_OPEN` | `true` | Allow if IP lookup fails |
| `REDIS_ENABLED` | `false` | Use Redis for velocity + cache |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `RABBITMQ_ENABLED` | `true` | Enable async event consumer |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672/` | RabbitMQ connection |
| `RABBITMQ_EVENTS_EXCHANGE` | `casino.events` | Topic exchange (empty = legacy queue mode) |
| `RABBITMQ_EVENTS_EXCHANGE_TYPE` | `topic` | Exchange type |
| `RABBITMQ_EVENTS_QUEUE` | `casino.afs` | Inbound subscription queue |
| `RABBITMQ_EVENTS_BINDING_KEY` | `#` | Binding key (`#` = all platform events) |
| `RABBITMQ_PUBLISH_RESULTS` | `true` | Publish to Orchestrator |
| `RABBITMQ_RESULTS_QUEUE` | `risk.results` | Outbound results queue |
| `SYNC_PUBLISH_AUDIT` | `true` | Also publish after sync `/evaluate` |
| `DECISION_CACHE_TTL_SECONDS` | `60` | Redis cache TTL for sync decisions |

### Orchestrator

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///../data/afs_risk.db` | Same DB as Risk |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672/` | RabbitMQ connection |
| `RABBITMQ_RESULTS_QUEUE` | `risk.results` | Inbound queue |
| `RABBITMQ_ACTIONS_QUEUE` | `risk.actions` | Outbound actions queue |

---

## Testing

Run the full suite from the repo root:

```powershell
py -3.11 run_tests.py
```

This runs **115 Risk tests** and **8 Orchestrator tests**.

Run individually:

```powershell
$env:PYTHONPATH = "f:\Dev Works\AFS"
cd Risk
py -3.11 -m pytest tests -v
```

---

## Docker

Full stack with **PostgreSQL**, **Redis**, **Risk**, and **Orchestrator** (RabbitMQ is the external casino broker):

```powershell
cd "f:\Dev Works\AFS"

# Optional: copy and edit compose env overrides
copy .env.docker.example .env.docker

# BuildKit improves pip caching on rebuilds (recommended on Windows)
$env:DOCKER_BUILDKIT = "1"
.\scripts\docker-build.ps1 -Up
```

Or without the helper script:

```powershell
$env:DOCKER_BUILDKIT = "1"
docker compose --env-file .env.docker up --build
```

**RabbitMQ:** Risk and Orchestrator connect to the shared casino broker (`RABBITMQ_URL=amqp://casino:secret@10.10.51.60:5672/`). Override in `.env.docker` if the broker address changes.

This starts:

| Service | URL / port | Default credentials |
|---------|------------|---------------------|
| Risk | http://localhost:8001 | — |
| Orchestrator | http://localhost:8002 | — |
| PostgreSQL | localhost:5432 | user `afs` / pass `afs` / db `afs` |
| Redis | localhost:6379 | no auth (internal network only) |
| RabbitMQ (external) | `10.10.51.60:5672` | user `casino` / pass `secret` |

Risk health should report `"redis_enabled": true` when the stack is up.

Verify:

```powershell
curl http://localhost:8001/health
curl http://localhost:8002/health
```

Stop and remove containers:

```powershell
docker compose down
```

Remove containers **and** persisted DB/queue data:

```powershell
docker compose down -v
```

### Compose file layout

```
docker-compose.yml       # postgres + redis + risk + orchestrator
Dockerfile               # multi-stage: targets risk | orchestrator
.env.docker.example      # optional compose variable overrides
.dockerignore
```

### Build individual images

```powershell
docker build --target risk -t afs-risk .
docker build --target orchestrator -t afs-orchestrator .
```

Run Risk alone (requires external Postgres, RabbitMQ, and Redis URLs):

```powershell
docker run -p 8001:8001 `
  -e DATABASE_URL=postgresql+psycopg2://afs:afs@host.docker.internal:5432/afs `
  -e RABBITMQ_URL=amqp://casino:secret@10.10.51.60:5672/ `
  -e REDIS_ENABLED=true `
  -e REDIS_URL=redis://host.docker.internal:6379/0 `
  afs-risk
```

---

## Production notes

1. **Use PostgreSQL** instead of SQLite: `DATABASE_URL=postgresql://user:pass@host:5432/afs`
2. **Enable Redis** for accurate velocity across multiple Risk instances
3. **Run multiple Risk replicas** behind a load balancer for sync `/evaluate`
4. **Use one RabbitMQ cluster** for async; set `RABBITMQ_PREFETCH` based on throughput
5. **Subscribe to `risk.actions`** in your platform service — do not rely on players to self-enforce
6. **ip-api.com free tier** is non-commercial; use a commercial IP intelligence provider in production
7. **FingerprintJS OSS** is client-side and spoofable — combine with velocity and trusted devices
8. Set `IP_INTEL_FAIL_OPEN=false` if you prefer blocking when IP lookup is unavailable

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'shared'`

Set `PYTHONPATH` to the repo root:

```powershell
$env:PYTHONPATH = "f:\Dev Works\AFS"
```

`run_all.py` and `run_tests.py` do this automatically.

### `unable to open database file`

The `data/` directory is created automatically. Ensure the service has write permission to the repo root, or set an absolute `DATABASE_URL`.

### RabbitMQ connection refused

Start RabbitMQ or disable async:

```env
RABBITMQ_ENABLED=false
RABBITMQ_PUBLISH_RESULTS=false
```

### Risk starts but Orchestrator gets no messages

Check `RABBITMQ_PUBLISH_RESULTS=true` in Risk and that both services use the same `RABBITMQ_RESULTS_QUEUE` name.

### Docker build fails on `pip install` (Read timed out / `No matching distribution found for sqlalchemy`)

This is almost always **PyPI network access from inside Docker Desktop on Windows**, not a missing package. When the index request fails, pip reports `(from versions: none)` for packages like `sqlalchemy`.

The Dockerfile uses **pinned versions** in `requirement-prod.txt`, explicit `pypi.org`, 600s timeout, and **5 automatic retries**.

Retry:

```powershell
$env:DOCKER_BUILDKIT = "1"
.\scripts\docker-build.ps1 -Up
```

Or manually:

```powershell
$env:DOCKER_BUILDKIT = "1"
docker pull python:3.11-slim-bookworm
docker compose build --no-cache
docker compose up
```

**Windows Docker Desktop fixes** (Settings → Docker Engine is not needed; use the UI):

| Setting | Value |
|---------|--------|
| Resources → Memory | 4 GB or more |
| Network → DNS server | `8.8.8.8` or `1.1.1.1` |
| VPN | Turn off during first build, or allow Docker Desktop |

If PyPI stays unreachable, build on a faster connection once — the pip cache mount reuses downloaded wheels on retry.

Local dev (outside Docker) still uses `requirement.txt` (includes pytest).

### Python 3.14 / missing packages

Use Python 3.11:

```powershell
py -3.11 -m pip install -r requirement.txt
```

### `/client/fingerprint-collector.js` 404

Ensure Risk is running and `client/` exists at the repo root (not inside `Risk/`).

---

## Quick start checklist

- [ ] Install Python 3.11 and `pip install -r requirement.txt`
- [ ] Copy `.env.docker.example` to the root `.env`
- [ ] Start RabbitMQ (or disable async in `.env`)
- [ ] Run `py -3.11 run_all.py`
- [ ] Verify `GET http://localhost:8001/health`
- [ ] Add FingerprintJS + `/client/fingerprint-collector.js` to your frontend
- [ ] Call `POST /evaluate` on signup/login/withdrawal
- [ ] Publish `login_failed` / `signup_failed` to `risk.events`
- [ ] Subscribe to `risk.actions` and enforce actions
- [ ] Run `py -3.11 run_tests.py` to confirm everything works
