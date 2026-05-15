# Runbook — hello-todo-fastapi

## System overview

`hello-todo-fastapi` is a single-process HTTP API. It stores todos in memory; data is lost when the process restarts. There are no external dependencies (no database, no cache, no queue).

- Package: `hello_todo_fastapi`
- ASGI entry point: `hello_todo_fastapi.main:app`
- Default port: `8000` (override with `PORT` env var)
- Logs: JSON to stdout only

## Starting the service

```bash
# From source (development)
make run

# Or directly with uvicorn
PORT=8000 uvicorn hello_todo_fastapi.main:app --host 0.0.0.0 --port 8000

# With Docker
docker run -e PORT=8000 -p 8000:8000 hello-todo-fastapi:0.1.0
```

The first log line confirms startup:

```
{"level":"INFO","message":"server starting on port 8000","logger":"hello_todo_fastapi.main"}
```

## Stopping the service

Send `SIGTERM` for a graceful shutdown:

```bash
kill -TERM <pid>
```

Or `SIGINT` (Ctrl-C in the terminal). uvicorn handles SIGTERM/SIGINT and drains
in-flight requests before exiting.

Do not use `SIGKILL` unless the process is unresponsive; it bypasses the drain.

## Changing the port

Set the `PORT` environment variable before starting:

```bash
PORT=9090 uvicorn hello_todo_fastapi.main:app --host 0.0.0.0 --port 9090
```

Or use the Makefile:

```bash
PORT=9090 make run
```

## Checking service health

```bash
curl http://localhost:8000/healthz
# Expected: {"status":"ok"}
```

A non-200 response or connection refused means the service is down or not listening on
the expected port.

## Where logs go

All logs are written to **stdout** as JSON. Pipe or redirect as needed:

```bash
uvicorn hello_todo_fastapi.main:app 2>&1 | tee app.log
```

There is no log file rotation built in; delegate rotation to the process supervisor
(systemd journal, Docker log driver, etc.).

Log fields: `level`, `message`, `logger`, plus optional structured fields depending on
the log site.

## Changing log level

Set `LOG_LEVEL` to `DEBUG`, `INFO`, `WARNING`, or `ERROR`:

```bash
LOG_LEVEL=DEBUG uvicorn hello_todo_fastapi.main:app --host 0.0.0.0 --port 8000
```

## Redeploying

1. Install the new package version into the virtualenv.
2. Stop the running process: `kill -TERM <pid>`.
3. Start the new process.
4. Verify: `curl /healthz`.

See `docs/release/deployment-plan.md` for the full deployment checklist.

## Common failures

### Port already in use

Symptom: `[ERROR] ... Address already in use`, process exits immediately.

Fix:
```bash
lsof -i :8000        # find the process holding the port
kill <pid>           # stop it, then restart the service
```
Or set a different port: `PORT=9090 make run`.

### Import error on startup

Symptom: `ModuleNotFoundError` or `ImportError` in stdout, process exits non-zero.

Fix: verify the package is installed in the active virtualenv:
```bash
.venv/bin/pip show hello-todo-fastapi
```
If missing, re-run `make setup`.

### High memory growth

Symptom: RSS growing indefinitely.

Cause: in-memory store grows unbounded as todos accumulate; there is no eviction or
pagination cap in v0.1.0.

Mitigation: restart the service periodically (data will be lost). For production use,
switch to a persistent adapter — see `known-issues.md`.

### Service responds slowly

Symptom: `curl /healthz` takes more than 1 second.

Check:
```bash
ps aux | grep uvicorn    # confirm process is running
lsof -p <pid> | wc -l   # file descriptor count
```

## Inspecting the in-memory store

There is no admin endpoint to inspect live store contents. To see current todos, use
the list endpoint:

```bash
curl http://localhost:8000/v1/todos
```

This is a known maintenance gap (see `known-issues.md`). Adding a debug endpoint or
switching to a persistent store would address it.

## Rollback

See `docs/release/rollback-plan.md`.
