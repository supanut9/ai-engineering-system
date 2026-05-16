# Runbook — hello-todo-fastify

## System overview

`hello-todo-fastify` is a single-process Node.js HTTP API. It stores todos in memory;
data is lost when the process restarts. There are no external dependencies (no database,
no cache, no queue).

- Entry point: `dist/index.js` (compiled) or `src/index.ts` (dev via `tsx`)
- Default port: `8080` (override with `PORT` env var)
- Logs: JSON to stdout only (pino)

## Starting the service

```bash
# Development (tsx watch, auto-restarts on file changes)
make run

# From compiled output
PORT=8080 node dist/index.js

# With Docker
docker run -e PORT=8080 -p 8080:8080 hello-todo-fastify:0.1.0
```

The first log line confirms startup:

```json
{"level":30,"time":...,"pid":...,"hostname":"...","msg":"Server listening at http://0.0.0.0:8080"}
```

## Stopping the service

Send `SIGTERM` for a graceful shutdown:

```bash
kill -TERM <pid>
```

Or `SIGINT` (Ctrl-C in the terminal). The process calls `fastify.close()`, which drains
in-flight requests, then exits 0.

Do not use `SIGKILL` unless the process is unresponsive; it bypasses the drain.

## Changing the port

```bash
PORT=9090 node dist/index.js
```

## Checking service health

```bash
curl http://localhost:8080/healthz
# Expected: {"status":"ok"}
```

A non-200 response or connection refused means the service is down or not listening on
the expected port.

## Where logs go

All logs are written to **stdout** as JSON (pino format). Pipe or redirect as needed:

```bash
node dist/index.js 2>&1 | tee app.log
```

There is no log file rotation built in; delegate rotation to the process supervisor
(systemd journal, Docker log driver, etc.).

Key pino log fields: `level` (number: 30=info, 40=warn, 50=error), `time` (epoch ms),
`msg`, plus Fastify request fields (`reqId`, `method`, `url`, `statusCode`, `responseTime`).

## Redeploying

1. Build the new bundle: `make build`.
2. Stop the running process: `kill -TERM <pid>`.
3. Replace the dist directory: `cp -r dist /opt/hello-todo-fastify/dist`.
4. Start the new process.
5. Verify: `curl /healthz`.

See `docs/release/deployment-plan.md` for the full deployment checklist.

## Common failures

### Port already in use

Symptom: error log with `EADDRINUSE` and address `:::8080`, process exits immediately.

Fix:
```bash
lsof -i :8080       # find the process holding the port
kill <pid>          # stop it, then restart the service
```
Or set a different port: `PORT=9090 node dist/index.js`.

### Startup crash (unhandled exception)

Symptom: error log then process exits non-zero.

Fix: read the pino error log. Common causes:
- Invalid `PORT` value (e.g. `PORT=abc`). Set a valid numeric port.
- Missing `node_modules` — run `npm ci` first.

Capture full output for investigation:
```bash
node dist/index.js 2>&1 | tee crash.log
```

### High memory growth

Symptom: RSS growing indefinitely.

Cause: in-memory store grows unbounded as todos accumulate; there is no eviction or
pagination cap in v0.1.0.

Mitigation: restart the service periodically (data will be lost). For production use,
switch to a persistent adapter — see `known-issues.md`.

### Service responds slowly

Symptom: `curl /healthz` takes more than 1 second.

Possible cause: the event loop is blocked by a synchronous operation, or the OS has run
out of file descriptors.

Check:
```bash
lsof -p <pid> | wc -l    # file descriptor count
top -p <pid>              # CPU and memory
```

## Inspecting the in-memory store

There is no admin endpoint or CLI to inspect live store contents. To see current todos,
use the list endpoint:

```bash
curl http://localhost:8080/v1/todos
```

This is a known maintenance gap (see `known-issues.md`). Adding a debug/admin endpoint
or switching to a persistent store would address it.

## Rollback

See `docs/release/rollback-plan.md`.
