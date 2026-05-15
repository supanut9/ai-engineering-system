# Deployment Plan — hello-todo-go v0.1.0

## Goal

Release: v0.1.0 — initial public release.
Target environment: any Linux/macOS host or container that can run a Go binary and expose a TCP port.

## Scope

Single binary (`bin/api`) with zero external runtime dependencies (no database, no cache, no message queue).

Out of scope: TLS termination (delegate to a reverse proxy or load balancer), auth, persistent storage.

## Pre-deployment checklist

- [ ] All automated tests passing (`make test`, race-clean).
- [ ] CI pipeline green.
- [ ] No environment variables beyond `PORT` are required.
- [ ] Previous binary is archived or tagged (rollback artifact).
- [ ] Runbook reviewed.
- [ ] Rollback plan reviewed.
- [ ] Go-live checklist reviewed.

## Deployment steps

### Option A — bare binary on a host

1. Build the release binary on the CI machine or locally:

   ```bash
   make build
   # produces bin/api
   ```

2. Copy the binary to the target host:

   ```bash
   scp bin/api user@host:/opt/hello-todo-go/api
   ssh user@host "chmod +x /opt/hello-todo-go/api"
   ```

3. Set environment and start:

   ```bash
   PORT=8080 /opt/hello-todo-go/api
   ```

   For a managed service, create a systemd unit or use your process supervisor.

4. Verify:

   ```bash
   curl http://<host>:8080/healthz
   ```

   Expected: `{"status":"ok"}`.

### Option B — Docker container

A minimal two-stage Dockerfile (not committed to the repo; provided here as a reference):

```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /bin/api ./cmd/api

FROM scratch
COPY --from=builder /bin/api /api
EXPOSE 8080
ENTRYPOINT ["/api"]
```

Build and run:

```bash
docker build -t hello-todo-go:0.1.0 .
docker run -e PORT=8080 -p 8080:8080 hello-todo-go:0.1.0
```

## Migration steps

No database migrations. The in-memory store is initialised on startup; no pre-flight data steps are needed.

| Step | Description | Reversible? |
|------|-------------|-------------|
| 1 | Replace binary on host | Yes — keep the previous binary |
| 2 | Restart the process | Yes — start the previous binary |

## Verification

- Health endpoint: `GET /healthz` → 200 `{"status":"ok"}`.
- Log signals: first JSON log line should be `"msg":"server starting"`. No ERROR lines in the first 60 seconds.
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
