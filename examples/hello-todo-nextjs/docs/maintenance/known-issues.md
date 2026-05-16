# known issues — hello-todo-nextjs v0.1.0

## 1. data lost on restart

**severity:** info (by design in v0.1.0)

All todos are stored in process memory. Restarting the service clears all data.

**upgrade path:** Implement a `db.ts` module using Prisma (or a raw `better-sqlite3`
adapter) and update `src/lib/repo.ts` to delegate to it. The service layer
(`src/services/todos.ts`) and route handlers do not need to change because they import
the repo functions — swapping the backing store is local to `src/lib/repo.ts`. Target:
v0.2.0.

---

## 2. no authentication

**severity:** warning — do not expose to the internet

The API has no auth layer. Any client with network access can read, create, update, and
delete all todos.

**upgrade path:** Add a Next.js middleware (`src/middleware.ts`) that validates a bearer
token or session cookie before routing requests to `/api/todos`. No changes to route
handlers, services, or the repo are needed. Target: v0.2.0 or whenever the service is
exposed beyond localhost.

---

## 3. no persistent observability

**severity:** info

Logs are written to stdout only via `console.log` / `console.error`. There are no
metrics endpoints (Prometheus, etc.) and no distributed tracing.

**upgrade path:** Add a `/api/metrics` route handler using `prom-client`. Integrate with
the OpenTelemetry SDK for tracing via the `@opentelemetry/api` package. Target: v0.3.0.

---

## 4. id format is opaque hex; not sortable by creation time

**severity:** info

IDs are 32-char random hex strings (`crypto.randomBytes`). They are globally unique but
not time-ordered. Clients cannot infer creation order from the ID alone.

**upgrade path:** Switch the id generator in `repo.generateId()` to ULID or UUIDv7.
This is a non-breaking change for existing clients because the contract states IDs are
opaque strings. Target: v0.2.0.

---

## 5. due_at semantics are not enforced

**severity:** info

The service accepts and stores `due_at` but does not act on it. Overdue todos are not
flagged, sorted to the top, or marked automatically.

**upgrade path:** Add a `DueStatus` computed field (or a query parameter
`?filter=overdue`) in a future version. Requires no schema change — `due_at` is already
stored. Target: v0.2.0.

---

## 6. home page is read-only

**severity:** info (by design in v0.1.0)

The server-rendered home page displays todos but provides no create, update, or delete
controls. Mutations require direct API calls via curl or an HTTP client.

**upgrade path:** Add React Server Actions to handle form submissions for create and
delete, allowing in-page mutations without a separate client-side framework. Target:
v0.2.0.
