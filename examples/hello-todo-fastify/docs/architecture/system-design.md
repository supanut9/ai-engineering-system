# system design — hello-todo-fastify

References: `../requirements/prd.md` (success criteria), `../specs/functional-spec.md`
(behavioral contract), `decisions/0001-fastify-hexagonal.md` (architectural choice).

---

## context

`hello-todo-fastify` is a single-process Node.js HTTP API that stores todo items in
memory. Its primary purpose is to be a readable, self-contained reference example;
simplicity is a first-class constraint alongside correctness. There are no external
dependencies at runtime (no database, no cache, no message queue).

---

## hexagonal architecture overview

```
                        ┌─────────────────────────────┐
                        │    HTTP (Fastify router)      │
                        │  adapters/inbound/http/       │
                        │  routes.ts + schemas.ts       │
                        └────────────┬────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │    Inbound Port Interface    │
                        │  ports/inbound/              │
                        │  todo-service.port.ts        │
                        └────────────┬────────────────┘
                                     │
         ┌───────────────────────────▼──────────────────────────┐
         │                    CORE DOMAIN                        │
         │               src/core/todo/                          │
         │   entity: Todo    service: TodoService (business)     │
         └───────────────────────────┬──────────────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │   Outbound Port Interface    │
                        │  ports/outbound/             │
                        │  todo-repository.port.ts     │
                        └────────────┬────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │   In-Memory Adapter          │
                        │  adapters/outbound/memory/   │
                        │  memory-todo-repository.ts   │
                        └─────────────────────────────┘
```

---

## components

### src/index.ts — composition root

Reads `PORT` and `LOG_LEVEL` from the environment, creates the Fastify instance with
pino logging configured, wires all adapters, registers the error handler, registers
routes, and calls `fastify.listen`. The only file that imports all layers together.

### src/core/todo/

- `todo.ts` — `Todo` interface and `createTodo` factory (generates UUID v4, sets
  timestamps, enforces title rules)
- `todo-service.ts` — `TodoService` class implementing the inbound port interface;
  contains all business logic (title trim and validation, `updated_at` stamping,
  `NotFoundError` propagation)
- `errors.ts` — `NotFoundError` and `ValidationError` domain error classes

### src/ports/inbound/todo-service.port.ts

`TodoServicePort` interface that HTTP handlers depend on. Defines: `create`, `list`,
`get`, `update`, `delete`. Also defines the `CreateInput` and `PatchInput` shapes.
Handlers must only reference this interface, never the concrete service class.

### src/ports/outbound/todo-repository.port.ts

`TodoRepository` interface that the service depends on. Defines: `save`, `findAll`,
`findById`, `delete`. The in-memory adapter and any future persistent adapter must
implement this interface.

### src/adapters/inbound/http/

- `routes.ts` — registers all six routes on the Fastify instance using
  `fastify-type-provider-zod` for typed schemas. Receives a `TodoServicePort` and a
  health function as dependencies.
- `schemas.ts` — Zod schemas for request bodies and response shapes. These are the
  only place Zod is used; the core service does not import Zod.
- `error-handler.ts` — Fastify `setErrorHandler` hook. Maps `NotFoundError` to 404,
  `ValidationError` to 400, Zod parse errors to 400, and unexpected errors to 500.
  All responses use the uniform error envelope.

### src/adapters/outbound/memory/memory-todo-repository.ts

`MemoryTodoRepository` class implementing `TodoRepository`. Stores todos in a
`Map<string, Todo>`. Map iteration order is insertion order in V8; the contract does
not guarantee it. `findById` returns a shallow copy so callers cannot mutate internal
state directly.

---

## data flow

```
Request → Fastify router → route handler (inbound adapter, Zod validates body)
       → TodoService (inbound port → core, business validation)
       → MemoryTodoRepository (outbound port → outbound adapter)
       → return value → route handler → JSON response
```

Error flow: repository returns `undefined` for missing resources; service throws
`NotFoundError` or `ValidationError`; the Fastify error handler maps these to the
correct HTTP status and error JSON envelope. Zod schema failures are thrown by
`fastify-type-provider-zod` before the handler runs and are caught by the same
error handler.

---

## key tradeoffs

| tradeoff | choice | rationale |
|---|---|---|
| simplicity vs persistence | in-memory only | keeps the example readable; persistence is out of scope for v0.1.0 |
| hexagonal vs layered | hexagonal | parity with `hello-todo-go`; demonstrates adapter swappability in a TS context |
| Fastify vs Express/NestJS | Fastify | first-class TypeScript; schema validation via `fastify-type-provider-zod`; higher throughput than Express |
| Zod vs class-validator | Zod | functional shape; ESM-friendly; shares schema with `fastify-type-provider-zod` without decorators |
| external id library vs crypto | `uuid` package | widely understood format; no home-grown encoding; negligible dependency |
| string timestamps vs Date objects | ISO 8601 strings | explicit wire format; avoids JSON.stringify edge cases with Date |

---

## deployment shape

Single Node.js process. Start with:
```bash
PORT=8080 node dist/index.js
```

No containerization required for local development. The process is self-contained; there
is no database to migrate, no secret manager to connect to, no sidecar required.

---

## observability

- **logging:** pino to stdout in JSON format (default). `LOG_LEVEL` env var controls
  verbosity. Fastify automatically logs request/response details at the `info` level.
- **health check:** `GET /healthz` returns `{"status":"ok"}` while the process is alive.
- **metrics:** out of scope for v0.1.0.
- **tracing:** out of scope for v0.1.0.
