# system design — hello-todo-go

References: `../requirements/prd.md` (success criteria), `../specs/functional-spec.md`
(behavioral contract), `decisions/0001-go-gin-hexagonal.md` (architectural choice).

---

## context

`hello-todo-go` is a single-binary HTTP API that stores todo items in memory. Its
primary purpose is to be a readable, self-contained reference example; simplicity
is a first-class constraint alongside correctness. There are no external dependencies
at runtime (no database, no cache, no message queue).

---

## hexagonal architecture overview

```
                        ┌─────────────────────────────┐
                        │       HTTP (Gin router)      │
                        │   inbound/http/routes.go     │
                        └────────────┬────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │    Inbound Port Interface    │
                        │  ports/inbound/todo.go       │
                        └────────────┬────────────────┘
                                     │
         ┌───────────────────────────▼──────────────────────────┐
         │                    CORE DOMAIN                        │
         │           internal/core/todo/                         │
         │   entity: Todo    service: TodoService (business)     │
         └───────────────────────────┬──────────────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │   Outbound Port Interface    │
                        │  ports/outbound/             │
                        │  todo_repository.go          │
                        └────────────┬────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │   In-Memory Adapter          │
                        │  adapters/outbound/memory/   │
                        │  todo_repository.go          │
                        └─────────────────────────────┘
```

---

## components

### cmd/api/main.go — composition root

Wires all adapters, creates the repository, creates the service, creates the router,
and starts the HTTP server. The only file that imports all layers together.

### internal/core/todo/

- `entity.go` — `Todo` struct, id generation helper
- `service.go` — service struct implementing the inbound port interface; contains
  all business logic (validation, `updated_at` stamping, id generation)
- `repository.go` — canonical definition of the outbound `Repository` interface and the
  `ErrNotFound` sentinel. They live in `core/todo` so the package that owns the entity
  also owns the interface that returns it; this avoids an import cycle between
  `core/todo` and `ports/outbound`. The interface is re-exported as a type alias from
  `ports/outbound/todo_repository.go` so adapters can keep the conventional import path.

### internal/ports/inbound/todo.go

Interface `TodoService` that HTTP handlers depend on. Defines: `Create`, `List`,
`Get`, `Update`, `Delete`. Also defines the read-side DTO `TodoItem`, plus
`CreateInput` and `Patch` input shapes. The service returns `*TodoItem` rather than
`*core/todo.Todo` so this package never imports `core/todo` — same anti-cycle reason
as the outbound port. Handlers must only reference these types, never the concrete
service.

### internal/ports/outbound/todo_repository.go

Thin re-export shim: `type Repository = todo.Repository` and `var ErrNotFound =
todo.ErrNotFound`. Adapters import this path; the interface itself is defined in
`core/todo/repository.go` (see above). The service depends on the alias only via the
core package.

### internal/adapters/inbound/http/handlers/

- `todos.go` — Gin handler functions for all five todo endpoints; decodes request,
  calls inbound port, encodes response
- `health.go` — `GET /healthz` handler

### internal/adapters/inbound/http/routes/routes.go

Mounts handlers on the Gin engine. Called by `main.go`.

### internal/adapters/outbound/memory/todo_repository.go

`Store` struct with `map[string]*Todo` and `sync.RWMutex`, implementing the outbound
`Repository` interface (defined in `core/todo`, re-exported via `ports/outbound`).
All mutations hold a write lock; reads hold a read lock. `FindByID` returns a copy
so callers cannot mutate internal state.

---

## data flow

```
Request → Gin router → handler (inbound adapter)
       → TodoService (inbound port → core)
       → memory.Store (outbound port → outbound adapter)
       → return value → handler → JSON response
```

Error flow: repository returns a typed error (e.g., `ErrNotFound`); service propagates
it; handler maps it to the correct HTTP status and error JSON envelope.

---

## key tradeoffs

| tradeoff | choice | rationale |
|---|---|---|
| simplicity vs persistence | in-memory only | keeps the example readable; persistence is out of scope for v0.1.0 |
| hexagonal vs layered | hexagonal | demonstrates adapter swappability; teaches more about architecture boundaries |
| Gin vs net/http stdlib | Gin | less boilerplate for routing and JSON binding; widely recognized in Go ecosystem |
| external id library vs crypto/rand | crypto/rand | no extra dependency; sufficient entropy for an in-memory example |
| structured logging library | `log/slog` (stdlib, Go 1.21+) | zero extra dependency; sufficient for stdout logging |

---

## deployment shape

Single Go binary. Start with:
```
PORT=8080 ./bin/api
```

No containerization required for local development. The binary is self-contained; there
is no database to migrate, no secret manager to connect to, no sidecar required.

---

## observability

- **logging:** `log/slog` to stdout in text format (development) or JSON format
  (production-like). Log level controlled by `LOG_LEVEL` env var.
- **health check:** `GET /healthz` returns `{"status":"ok"}` while the process is alive.
- **metrics:** out of scope for v0.1.0.
- **tracing:** out of scope for v0.1.0.
