# Deployment Plan — hello-todo-fastapi v0.1.0

## Goal

Release: v0.1.0 — initial public release.
Target environment: any Linux/macOS host or container that can run Python 3.12 and expose a TCP port.

## Scope

Single Python process (`uvicorn hello_todo_fastapi.main:app`) with zero external runtime dependencies (no database, no cache, no message queue).

Out of scope: TLS termination (delegate to a reverse proxy or load balancer), auth, persistent storage.

## Pre-deployment checklist

- [ ] All automated tests passing (`make test`, `make lint`, `make typecheck`).
- [ ] CI pipeline green.
- [ ] No environment variables beyond `PORT` and `LOG_LEVEL` are required.
- [ ] Previous package / image is archived or tagged (rollback artifact).
- [ ] Runbook reviewed.
- [ ] Rollback plan reviewed.
- [ ] Go-live checklist reviewed.

## Deployment steps

### Option A — run directly from a virtualenv

1. Create the virtualenv and install the package on the target host:

   ```bash
   python3.12 -m venv /opt/hello-todo-fastapi/.venv
   /opt/hello-todo-fastapi/.venv/bin/pip install hello-todo-fastapi==0.1.0
   ```

2. Set environment and start:

   ```bash
   PORT=8000 /opt/hello-todo-fastapi/.venv/bin/uvicorn \
     hello_todo_fastapi.main:app \
     --host 0.0.0.0 --port 8000
   ```

   For a managed service, create a systemd unit or use your process supervisor.

3. Verify:

   ```bash
   curl http://<host>:8000/healthz
   ```

   Expected: `{"status":"ok"}`.

### Option B — Docker container

A minimal two-stage Dockerfile (not committed to the repo; provided here as a reference):

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml README.md ./
COPY src/ ./src/
RUN pip install --no-cache-dir -e .

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /app /app
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
EXPOSE 8000
CMD ["uvicorn", "hello_todo_fastapi.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t hello-todo-fastapi:0.1.0 .
docker run -e PORT=8000 -p 8000:8000 hello-todo-fastapi:0.1.0
```

## Migration steps

No database migrations. The in-memory store is initialised on startup; no pre-flight data steps are needed.

| Step | Description | Reversible? |
|------|-------------|-------------|
| 1 | Install new package / image | Yes — keep the previous version tagged |
| 2 | Restart the process | Yes — start the previous version |

## Verification

- Health endpoint: `GET /healthz` → 200 `{"status":"ok"}`.
- Log signals: first JSON log line should be `"message":"server starting"`. No ERROR lines in the first 60 seconds.
- Smoke: create a todo, retrieve it, delete it.

## Owners

- Primary: team lead / on-call engineer.
- Escalation: check `docs/maintenance/runbook.md`.

## Timing window

- No downtime window required for v0.1.0 (stateless; data is in-memory, not persistent).
- If a hard cutover is needed, schedule during low-traffic hours.

## Communication

| Audience | Channel | Timing |
|----------|---------|--------|
| Internal team | Slack / email | Before deploy |
| Users | None required for v0.1.0 (no external users yet) | — |
