# Known Issues — hello-todo-fastapi v0.1.0

## 1. Data lost on restart

**Severity:** Info (by design in v0.1.0)

All todos are stored in process memory. Restarting the service clears all data.

**Upgrade path:** Implement a `PostgresTodoRepository` or `SQLiteTodoRepository` class
satisfying the `TodoRepository` Protocol and wire it in `main.py` (`create_app`).
No service or model changes are required — the layered structure was designed for this
swap. Target: v0.2.0. See the parking-lot item in `docs/plan/milestones.md`.

---

## 2. No authentication

**Severity:** Warning — do not expose to the internet

The API has no auth layer. Any client with network access can read, create, update, and
delete all todos.

**Upgrade path:** Add a FastAPI dependency (in `deps/auth.py`) that validates a Bearer
token or API key header and inject it into the todos router. The service and repository
layers do not need to change. Target: v0.2.0 or whenever the service is exposed beyond
localhost.

---

## 3. No persistent observability

**Severity:** Info

Logs are written to stdout only. There are no metrics endpoints (Prometheus, etc.) and
no distributed tracing. A process crash loses all in-flight log context.

**Upgrade path:** Add a `/metrics` endpoint using `prometheus_client` and integrate
with `opentelemetry-instrumentation-fastapi` for tracing. Target: v0.3.0.

---

## 4. ID format is opaque hex; not sortable by creation time

**Severity:** Info

IDs are 32-char random hex strings (`secrets.token_hex(16)`). They are globally unique
but not time-ordered. Clients cannot infer creation order from the ID alone.

**Upgrade path:** Switch the ID generator in `services/todo.py` to `python-ulid` or a
UUIDv7 library. This is a non-breaking change for existing clients because the contract
states IDs are opaque strings. Target: v0.2.0.

---

## 5. `due_at` semantics are not enforced

**Severity:** Info

The service accepts and stores `due_at` but does not act on it. Overdue todos are not
flagged, sorted to the top, or marked automatically.

**Upgrade path:** Add a `DueStatus` computed field (or a query parameter
`?filter=overdue`) in a future version. Requires no schema change — `due_at` is
already stored. Target: v0.2.0.
