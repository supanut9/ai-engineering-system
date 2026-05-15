# known issues — hello-todo-nestjs v0.1.0

## 1. data lost on restart

**severity:** info (by design in v0.1.0)

All todos are stored in process memory. Restarting the service clears all data.

**upgrade path:** Implement a `PostgresTodosRepository` or `SQLiteTodosRepository`
class decorated with `@Injectable()` and registered in `TodosModule` as a provider for
the `TodosRepository` token. `TodosService` does not need to change because it depends
on the class via NestJS DI — the swap is made at the module level. Target: v0.2.0.

---

## 2. no authentication

**severity:** warning — do not expose to the internet

The API has no auth layer. Any client with network access can read, create, update, and
delete all todos.

**upgrade path:** Add a NestJS `Guard` (e.g. `BearerTokenGuard`) and apply it to the
`TodosController` or the `/v1` route group. No changes to the service or repository
layers are needed. Target: v0.2.0 or whenever the service is exposed beyond localhost.

---

## 3. no persistent observability

**severity:** info

Logs are written to stdout only via the NestJS Logger. There are no metrics endpoints
(Prometheus, etc.) and no distributed tracing.

**upgrade path:** Add a `/metrics` endpoint using `prom-client` and a custom
interceptor. Integrate with the OpenTelemetry SDK for tracing. Target: v0.3.0.

---

## 4. id format is opaque hex; not sortable by creation time

**severity:** info

IDs are 32-char random hex strings (`crypto.randomBytes`). They are globally unique but
not time-ordered. Clients cannot infer creation order from the ID alone.

**upgrade path:** Switch the id generator in `TodosRepository.generateId()` to ULID or
UUIDv7. This is a non-breaking change for existing clients because the contract states
IDs are opaque strings. Target: v0.2.0.

---

## 5. due_at semantics are not enforced

**severity:** info

The service accepts and stores `due_at` but does not act on it. Overdue todos are not
flagged, sorted to the top, or marked automatically.

**upgrade path:** Add a `DueStatus` computed field (or a query parameter
`?filter=overdue`) in a future version. Requires no schema change — `due_at` is already
stored. Target: v0.2.0.
