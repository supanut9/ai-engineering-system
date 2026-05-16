# Deployment Plan — hello-todo-fastify v0.1.0

## Goal

Release: v0.1.0 — initial public release.
Target environment: any Linux/macOS host or container that can run Node.js 22 and
expose a TCP port.

## Scope

Single Node.js process (`dist/index.js`) with zero external runtime dependencies (no
database, no cache, no message queue).

Out of scope: TLS termination (delegate to a reverse proxy or load balancer), auth,
persistent storage.

## Pre-deployment checklist

- [ ] All automated tests passing (`make test`, type-check clean).
- [ ] CI pipeline green.
- [ ] No environment variables beyond `PORT` and `LOG_LEVEL` are required.
- [ ] Previous build is archived or tagged (rollback artifact).
- [ ] Runbook reviewed.
- [ ] Rollback plan reviewed.
- [ ] Go-live checklist reviewed.

## Deployment steps

### Option A — bare Node.js process on a host

1. Build the release bundle on the CI machine or locally:

   ```bash
   make build
   # produces dist/index.js
   ```

2. Copy the dist directory to the target host:

   ```bash
   rsync -av dist/ user@host:/opt/hello-todo-fastify/dist/
   rsync -av package.json node_modules/ user@host:/opt/hello-todo-fastify/
   ```

   Alternatively, copy only `dist/` if the host already has Node 22 and
   `node_modules` installed via `npm ci --omit=dev`.

3. Set environment and start:

   ```bash
   PORT=8080 node /opt/hello-todo-fastify/dist/index.js
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
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t hello-todo-fastify:0.1.0 .
docker run -e PORT=8080 -p 8080:8080 hello-todo-fastify:0.1.0
```

## Migration steps

No database migrations. The in-memory store is initialised on startup; no pre-flight
data steps are needed.

| Step | Description | Reversible? |
|------|-------------|-------------|
| 1 | Replace `dist/` on host (or redeploy container) | Yes — keep the previous dist |
| 2 | Restart the process | Yes — start the previous version |

## Verification

- Health endpoint: `GET /healthz` → 200 `{"status":"ok"}`.
- Log signals: first JSON log line should include `"msg":"Server listening at ..."`.
  No ERROR lines in the first 60 seconds.
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
