# Runbook — hello-todo-rust

## System overview

`hello-todo-rust` is a single-process, single-binary HTTP API. It stores todos in memory;
data is lost when the process restarts. There are no external dependencies (no database,
no cache, no queue).

- Binary: `target/release/my-service` (built from `src/main.rs`)
- Default port: `8080` (override with `PORT` env var)
- Log level: `info` (override with `RUST_LOG` env var)
- Logs: JSON to stdout only

## Starting the service

```bash
# From source
make run

# Or from a compiled binary
PORT=8080 RUST_LOG=info ./target/release/my-service

# With Docker
docker run -e PORT=8080 -e RUST_LOG=info -p 8080:8080 hello-todo-rust:0.1.0
```

The first log line confirms startup:

```json
{"timestamp":"...","level":"INFO","fields":{"message":"server starting","port":"8080"}}
```

## Stopping the service

Send `SIGTERM` for a graceful shutdown (5-second drain):

```bash
kill -TERM <pid>
```

Or `SIGINT` (Ctrl-C in the terminal). The process logs `"message":"shutting down"` then
`"message":"server stopped"` and exits 0.

Do not use `SIGKILL` unless the process is unresponsive; it bypasses the drain.

## Checking service health

```bash
curl http://localhost:8080/healthz
# Expected: {"status":"ok"}
```

A non-200 response or connection refused means the service is down or not listening on
the expected port.

## Where logs go

All logs are written to **stdout** as JSON. Pipe or redirect as needed:

```bash
./target/release/my-service 2>&1 | tee app.log
```

There is no log file rotation built in; delegate rotation to the process supervisor
(systemd journal, Docker log driver, etc.).

Log level is controlled by `RUST_LOG` (e.g., `RUST_LOG=debug` for verbose output).
Typical fields: `timestamp`, `level`, `fields.message`, plus optional span fields
injected by `TraceLayer`.

## Redeploying

1. Build the new binary: `make build`.
2. Stop the running process: `kill -TERM <pid>`.
3. Replace the binary: `cp target/release/my-service /opt/hello-todo-rust/my-service`.
4. Start the new process.
5. Verify: `curl /healthz`.

See `docs/release/deployment-plan.md` for the full deployment checklist.

## Common failures

### Port already in use

Symptom: `"message":"server error"` with `"error":"Address already in use (os error 98)"`,
process exits immediately.

Fix:

```bash
lsof -i :8080         # find the process holding the port
kill <pid>            # stop it, then restart the service
```

Or set a different port: `PORT=9090 ./target/release/my-service`.

### Panic on startup

Symptom: `thread 'main' panicked at` in stdout, process exits non-zero.

Fix: read the panic message and backtrace (`RUST_BACKTRACE=1` for full trace). Common
causes:

- Invalid `PORT` value (e.g. `PORT=abc`). Set a valid numeric port.
- Listener bind failure — check port conflicts or permission issues.

Capture output for investigation:

```bash
RUST_BACKTRACE=1 ./target/release/my-service 2>&1 | tee crash.log
```

### High memory growth

Symptom: RSS growing indefinitely.

Cause: in-memory store grows unbounded as todos accumulate; there is no eviction or
pagination cap in v0.1.0.

Mitigation: restart the service periodically (data will be lost). For production use,
switch to a persistent adapter — see `known-issues.md`.

### Service responds slowly

Symptom: `curl /healthz` takes more than 1 second.

Possible cause: the OS has run out of file descriptors or the process is under heavy load.

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
