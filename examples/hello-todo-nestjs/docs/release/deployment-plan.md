# deployment plan — hello-todo-nestjs v0.1.0

## goal

Release: v0.1.0 — initial public release.
Target environment: any Linux/macOS host or container that can run Node.js 22 and expose
a TCP port.

## scope

Single Node.js process (`node dist/main.js`) with zero external runtime dependencies
(no database, no cache, no message queue).

Out of scope: TLS termination (delegate to a reverse proxy or load balancer), auth,
persistent storage.

## pre-deployment checklist

- [ ] All automated tests passing (`make test`).
- [ ] CI pipeline green.
- [ ] No environment variables beyond `PORT` are required.
- [ ] Previous build is archived or tagged (rollback artifact).
- [ ] Runbook reviewed.
- [ ] Rollback plan reviewed.
- [ ] Go-live checklist reviewed.

## deployment steps

### option A — bare Node.js process on a host

1. Build the release bundle on the CI machine or locally:

   ```bash
   make build
   # produces dist/
   ```

2. Copy the dist directory to the target host:

   ```bash
   rsync -av dist/ user@host:/opt/hello-todo-nestjs/dist/
   rsync -av package.json package-lock.json user@host:/opt/hello-todo-nestjs/
   ssh user@host "cd /opt/hello-todo-nestjs && npm ci --omit=dev"
   ```

3. Set environment and start:

   ```bash
   PORT=3000 node /opt/hello-todo-nestjs/dist/main.js
   ```

   For a managed service, create a systemd unit or use your process supervisor.

4. Verify:

   ```bash
   curl http://<host>:3000/healthz
   ```

   Expected: `{"status":"ok"}`.

### option B — Docker container

A minimal two-stage Dockerfile (not committed to the repo; provided here as a reference):

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

Build and run:

```bash
docker build -t hello-todo-nestjs:0.1.0 .
docker run -e PORT=3000 -p 3000:3000 hello-todo-nestjs:0.1.0
```

## migration steps

No database migrations. The in-memory store is initialised on startup; no pre-flight
data steps are needed.

| step | description | reversible? |
|---|---|---|
| 1 | replace dist/ on host and restart | yes — keep the previous dist/ |
| 2 | restart the process | yes — start the previous version |

## verification

- health endpoint: `GET /healthz` → 200 `{"status":"ok"}`.
- log signals: first log line should mention the startup port. No ERROR lines in the
  first 60 seconds.
- smoke: create a todo, retrieve it, delete it.

## owners

- primary: team lead / on-call engineer.
- escalation: check `docs/maintenance/runbook.md`.

## timing window

- no downtime window required for v0.1.0 (stateless; data is in-memory, not persistent).
- if a hard cutover is needed, schedule during low-traffic hours.

## communication

| audience | channel | timing |
|---|---|---|
| internal team | Slack / email | before deploy |
| users | none required for v0.1.0 (no external users yet) | — |
