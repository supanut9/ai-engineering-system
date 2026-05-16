# deployment plan — hello-todo-nextjs v0.1.0

## goal

Release: v0.1.0 — initial public release.
Target environment: any Linux/macOS host or container that can run Node.js 22 and expose
a TCP port.

## scope

Single Node.js process (`next start`) with zero external runtime dependencies
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
   # produces .next/
   ```

2. Copy the build to the target host:

   ```bash
   rsync -av .next/ user@host:/opt/hello-todo-nextjs/.next/
   rsync -av public/ user@host:/opt/hello-todo-nextjs/public/
   rsync -av package.json package-lock.json next.config.mjs \
     user@host:/opt/hello-todo-nextjs/
   ssh user@host "cd /opt/hello-todo-nextjs && npm ci --omit=dev"
   ```

3. Set environment and start:

   ```bash
   PORT=3000 npx next start /opt/hello-todo-nextjs
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
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Requires `output: 'standalone'` in `next.config.mjs`.

Build and run:

```bash
docker build -t hello-todo-nextjs:0.1.0 .
docker run -e PORT=3000 -p 3000:3000 hello-todo-nextjs:0.1.0
```

## migration steps

No database migrations. The in-memory store is initialised on startup; no pre-flight
data steps are needed.

| step | description | reversible? |
|---|---|---|
| 1 | replace `.next/` on host and restart | yes — keep the previous `.next/` |
| 2 | restart the process | yes — start the previous version |

## verification

- health endpoint: `GET /healthz` → 200 `{"status":"ok"}`.
- home page: `GET /` → 200 HTML response containing "Todos".
- log signals: first log lines should mention the startup port. No ERROR lines in the
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
