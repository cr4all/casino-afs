FROM python:3.11-slim-bookworm AS base

WORKDIR /app

# Slow/unstable PyPI from Docker Desktop on Windows is common — pin index, timeout, retries.
ENV PIP_INDEX_URL=https://pypi.org/simple \
    PIP_TRUSTED_HOST="pypi.org files.pythonhosted.org" \
    PIP_DEFAULT_TIMEOUT=600 \
    PIP_RETRIES=10 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirement-prod.txt .

# Retry pip up to 5 times (transient PyPI failures show as "from versions: none").
RUN --mount=type=cache,target=/root/.cache/pip \
    set -ex; \
    pip install --upgrade "pip>=24,<26" setuptools wheel; \
    ok=0; \
    for attempt in 1 2 3 4 5; do \
      echo "pip install attempt ${attempt}/5..."; \
      if pip install --prefer-binary \
        --index-url https://pypi.org/simple \
        --default-timeout=600 \
        -r requirement-prod.txt; then \
        ok=1; \
        break; \
      fi; \
      echo "pip install failed, waiting 20s before retry..."; \
      sleep 20; \
    done; \
    test "$ok" -eq 1

COPY shared ./shared
COPY admin ./admin
COPY client ./client
COPY schemas ./schemas
COPY Risk/app ./Risk/app
COPY Orchestrator/app ./Orchestrator/app

ENV PYTHONPATH=/app

FROM base AS risk

WORKDIR /app/Risk
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

FROM base AS orchestrator

WORKDIR /app/Orchestrator
EXPOSE 8002
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
