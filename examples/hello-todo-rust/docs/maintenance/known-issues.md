# Known Issues — hello-todo-rust v0.1.0

## 1. Data lost on restart

**Severity:** Info (by design in v0.1.0)

All todos are stored in process memory. Restarting the service clears all data.

**Upgrade path:** Implement a `PostgresStore` or `SqliteStore` adapter satisfying
`TodoRepository` and wire it in `src/main.rs`. No core or port changes are required —
the hexagonal structure was designed for this swap. Target: v0.2.0.

---

## 2. No authentication

**Severity:** Warning — do not expose to the internet

The API has no auth layer. Any client with network access can read, create, update, and
delete all todos.

**Upgrade path:** Add a `tower::Layer` middleware (e.g. Bearer token, API key header
check) in `routes::register` before the `/v1/todos` group. The service and core layers
do not need to change. Target: v0.2.0 or whenever the service is exposed beyond
localhost.

---

## 3. No persistent observability

**Severity:** Info

Logs are written to stdout only. There are no metrics endpoints (Prometheus, etc.) and
no distributed tracing exporter. A process crash loses all in-flight log context.

**Upgrade path:** Add a `/metrics` endpoint using the `metrics` + `metrics-exporter-prometheus`
crates. Integrate `tracing-opentelemetry` for span export. Target: v0.3.0.

---

## 4. ID format is not time-ordered

**Severity:** Info

IDs are 32-char lowercase hex strings from `uuid::Uuid::new_v4()`. They are globally
unique but not time-ordered. Clients cannot infer creation order from the ID alone.
The list endpoint preserves insertion order via an auxiliary `Vec<String>` in the store,
but this ordering does not survive a restart.

**Upgrade path:** Switch the ID generator to UUIDv7 (`uuid` crate with the `v7` feature)
or ULID (`ulid` crate) — both encode a millisecond timestamp prefix. This is a
non-breaking change for existing clients because the contract states IDs are opaque
strings. Target: v0.2.0.

---

## 5. `due_at` semantics are not enforced

**Severity:** Info

The service accepts and stores `due_at` but does not act on it. Overdue todos are not
flagged, sorted to the top, or marked automatically.

**Upgrade path:** Add a `DueStatus` computed field (or a query parameter `?filter=overdue`)
in a future version. Requires no schema change — `due_at` is already stored. Target:
v0.2.0.
