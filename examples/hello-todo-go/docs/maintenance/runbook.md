# Runbook — hello-todo-go

## System overview

`hello-todo-go` is a single-process, single-binary HTTP API. It stores todos in memory; data is lost when the process restarts. There are no external dependencies (no database, no cache, no queue).

- Binary: `bin/api` (built from `cmd/api/main.go`)
- Default port: `8080` (override with `PORT` env var)
- Logs: JSON to stdout only

## Starting the service

```bash
# From source
make run

# Or from a compiled binary
PORT=8080 ./bin/api

# With Docker
docker run -e PORT=8080 -p 8080:8080 hello-todo-go:0.1.0
```

The first log line confirms startup:

```json
{"time":"...","level":"INFO","msg":"server starting","port":"8080"}
```

## Stopping the service

Send `SIGTERM` for a graceful shutdown (5-second drain):

```bash
kill -TERM <pid>
```

Or `SIGINT` (Ctrl-C in the terminal). The process logs `"msg":"shutting down"` then `"msg":"server stopped"` and exits 0.

Do not use `SIGKILL` unless the process is unresponsive; it bypasses the drain.

## Checking service health

```bash
curl http://localhost:8080/healthz
# Expected: {"status":"ok"}
```

A non-200 response or connection refused means the service is down or not listening on the expected port.

## Where logs go

All logs are written to **stdout** as JSON. Pipe or redirect as needed:

```bash
./bin/api 2>&1 | tee app.log
```

There is no log file rotation built in; delegate rotation to the process supervisor (systemd journal, Docker log driver, etc.).

Log fields: `time` (RFC3339), `level` (INFO/ERROR), `msg`, plus optional structured fields.

## Redeploying

1. Build the new binary: `make build`.
2. Stop the running process: `kill -TERM <pid>`.
3. Replace the binary: `cp bin/api /opt/hello-todo-go/api`.
4. Start the new process.
5. Verify: `curl /healthz`.

See `docs/release/deployment-plan.md` for the full deployment checklist.

## Common failures

### Port already in use

Symptom: `"msg":"server error"` with `"error":"listen tcp :8080: bind: address already in use"`, process exits immediately.

Fix:
```bash
lsof -i :8080         # find the process holding the port
kill <pid>            # stop it, then restart the service
```
Or set a different port: `PORT=9090 ./bin/api`.

### Panic on startup

Symptom: `panic:` in stdout, process exits non-zero.

Fix: Read the stack trace. Common causes:
- Invalid `PORT` value (e.g. `PORT=abc`). Set a valid numeric port.
- `crypto/rand` failure — extremely rare; check OS entropy pool.

Capture the full stderr for investigation:
```bash
./bin/api 2>&1 | tee crash.log
```

### High memory growth

Symptom: RSS growing indefinitely.

Cause: in-memory store grows unbounded as todos accumulate; there is no eviction or pagination cap in v0.1.0.

Mitigation: restart the service periodically (data will be lost). For production use, switch to a persistent adapter — see `known-issues.md`.

### Service responds slowly

Symptom: `curl /healthz` takes more than 1 second.

Possible cause: the OS has run out of file descriptors or the process is under heavy load.

Check:
```bash
lsof -p <pid> | wc -l    # file descriptor count
top -p <pid>              # CPU and memory
```

## Inspecting the in-memory store

There is no admin endpoint or CLI to inspect live store contents. To see current todos, use the list endpoint:

```bash
curl http://localhost:8080/v1/todos
```

This is a known maintenance gap (see `known-issues.md`). Adding a debug/admin endpoint or switching to a persistent store would address it.

## Rollback

See `docs/release/rollback-plan.md`.
