# runbook — hello-todo-nextjs

## system overview

`hello-todo-nextjs` is a single-process Node.js application built with Next.js (App
Router). It stores todos in memory; data is lost when the process restarts. There are no
external dependencies (no database, no cache, no queue).

- entry point: `next start` (production) or `next dev` (development)
- default port: `3000` (override with `PORT` env var)
- logs: Next.js internal request logs + `console.log` / `console.error` to stdout only

## starting the service

```bash
# Development mode (watch, HMR)
make dev

# Production (requires a prior build)
make build
make start

# With Docker
docker run -e PORT=3000 -p 3000:3000 hello-todo-nextjs:0.1.0
```

The first log lines confirm startup:

```
  ▲ Next.js 15.x
  - Local:        http://localhost:3000
  - Network:      http://0.0.0.0:3000
```

## stopping the service

Send `SIGTERM` for a graceful shutdown:

```bash
kill -TERM <pid>
```

Or `SIGINT` (Ctrl-C in the terminal). Next.js exits after completing in-flight requests.

Do not use `SIGKILL` unless the process is unresponsive; it bypasses the graceful drain.

## checking service health

```bash
curl http://localhost:3000/healthz
# Expected: {"status":"ok"}
```

A non-200 response or connection refused means the service is down or not listening on
the expected port.

## where logs go

All logs are written to **stdout**. Next.js logs HTTP request lines automatically.
Application logs use `console.log` (info) and `console.error` (errors). Pipe or redirect
as needed:

```bash
PORT=3000 npx next start 2>&1 | tee app.log
```

There is no log file rotation built in; delegate rotation to the process supervisor
(systemd journal, Docker log driver, etc.).

## redeploying

1. Build the new bundle: `make build`.
2. Stop the running process: `kill -TERM <pid>`.
3. Replace the `.next/` directory on the host.
4. Start the new process: `make start`.
5. Verify: `curl /healthz`.

See `docs/release/deployment-plan.md` for the full deployment checklist.

## common failures

### port already in use

Symptom: process exits immediately with `EADDRINUSE :3000`.

Fix:
```bash
lsof -i :3000         # find the process holding the port
kill <pid>            # stop it, then restart the service
```
Or set a different port: `PORT=9090 make start`.

### build artifacts missing

Symptom: `next start` fails with "Could not find a production build in the '.next'
directory".

Fix: run `make build` to produce the `.next/` directory before starting in production
mode. During development, use `make dev` instead.

### high memory growth

Symptom: RSS growing indefinitely.

Cause: in-memory store grows unbounded as todos accumulate; there is no eviction or
pagination cap in v0.1.0.

Mitigation: restart the service periodically (data will be lost). For production use,
switch to a persistent adapter — see `known-issues.md`.

### service responds slowly

Symptom: `curl /healthz` takes more than 1 second.

Possible cause: the OS has run out of file descriptors or the process is under heavy
load.

Check:
```bash
lsof -p <pid> | wc -l    # file descriptor count
top -p <pid>              # CPU and memory
```

## inspecting the in-memory store

There is no admin endpoint or CLI to inspect live store contents. To see current todos,
use the list endpoint:

```bash
curl http://localhost:3000/api/todos
```

This is a known maintenance gap (see `known-issues.md`). Adding a debug/admin endpoint
or switching to a persistent store would address it.

## rollback

See `docs/release/rollback-plan.md`.
