# system design — hello-todo-nestjs

References: `../requirements/prd.md` (success criteria), `../specs/functional-spec.md`
(behavioral contract), `decisions/0001-nestjs-layered.md` (architectural choice).

---

## context

`hello-todo-nestjs` is a single-process Node.js HTTP API that stores todo items in
memory. Its primary purpose is to be a readable, self-contained reference example;
simplicity is a first-class constraint alongside correctness. There are no external
dependencies at runtime (no database, no cache, no message queue).

---

## layered architecture overview

```
                     ┌──────────────────────────────────┐
                     │           HTTP (Express)          │
                     │      NestJS platform-express      │
                     └─────────────┬────────────────────┘
                                   │
                     ┌─────────────▼────────────────────┐
                     │          Controllers              │
                     │   todos.controller.ts             │
                     │   health.controller.ts            │
                     └─────────────┬────────────────────┘
                                   │
                     ┌─────────────▼────────────────────┐
                     │            Services               │
                     │   todos.service.ts                │
                     │   health.service.ts               │
                     └─────────────┬────────────────────┘
                                   │
                     ┌─────────────▼────────────────────┐
                     │          Repositories             │
                     │   todos.repository.ts             │
                     │   (in-memory Map<string, Todo>)   │
                     └──────────────────────────────────┘
```

---

## components

### src/main.ts — bootstrap

Reads `PORT` from the environment, creates the NestJS application, wires the global
`ApiErrorFilter`, and calls `app.listen`. The only file that bootstraps the framework.

### src/app.module.ts — root module

Imports `HealthModule` and `TodosModule`. No providers of its own.

### src/common/filters/api-error.filter.ts — exception filter

Catches every exception in the request pipeline. Maps `BadRequestException` (from
`ValidationPipe`), `NotFoundError`, `ValidationError`, and unexpected errors to the
uniform error envelope. Wired globally in `main.ts`.

### src/common/errors/

- `not-found.error.ts` — `NotFoundError extends HttpException`; carries a pre-shaped
  404 body so the filter can pass it through unchanged.
- `validation.error.ts` — `ValidationError extends HttpException`; carries a pre-shaped
  400 body.

### src/modules/health/

- `health.controller.ts` — handles `GET /healthz`, returns `{"status":"ok"}`.
- `health.service.ts` — `check()` method (noop for v0.1.0 in-memory store).
- `health.module.ts` — wires controller and service.

### src/modules/todos/

- `todos.controller.ts` — handles all five todo HTTP routes. Thin: decodes, delegates,
  encodes. No business logic.
- `todos.service.ts` — business logic: title trim and whitespace validation, PATCH
  null-vs-absent semantics, `NotFoundError` propagation.
- `todos.module.ts` — wires controller, service, and repository.
- `entities/todo.entity.ts` — `Todo` class; plain TypeScript (no ORM decorators).
- `dto/create-todo.dto.ts` — `CreateTodoDto` with `class-validator` rules for POST.
- `dto/update-todo.dto.ts` — `UpdateTodoDto` with `class-validator` rules for PATCH.
- `repositories/todos.repository.ts` — `@Injectable()` class; `Map<string, Todo>` +
  insertion-order array; id generation via `crypto.randomBytes`.

### src/config/configuration.ts

Helper that reads `PORT` from the environment with a safe default.

---

## data flow

```
Request → Express → NestJS router → Controller (ValidationPipe validates DTO)
       → Service (business logic, validation)
       → Repository (Map read/write)
       → return value → Controller → JSON response
```

Error flow: repository returns `undefined` for missing resources; service throws
`NotFoundError` or `ValidationError`; `ApiErrorFilter` converts to the envelope.
`ValidationPipe` failures produce `BadRequestException`, also caught by the filter.

---

## key tradeoffs

| tradeoff | choice | rationale |
|---|---|---|
| simplicity vs persistence | in-memory only | keeps the example readable; persistence is out of scope for v0.1.0 |
| NestJS layered vs hexagonal | layered | Nest's own DI + module conventions already encode adapter/domain separation; hexagonal interfaces would add files without proportional teaching value for this size |
| class-validator vs manual validation | class-validator | idiomatic in the NestJS ecosystem; integrates with `ValidationPipe`; reduces boilerplate |
| string timestamps vs Date objects | ISO8601 strings | avoids serialization inconsistency; JSON.stringify renders Date correctly but edge cases exist; strings are explicit |
| external id library vs crypto | crypto (stdlib) | no extra dependency; 32-char hex is sufficient for an in-memory example |

---

## deployment shape

Single Node.js process. Start with:
```bash
PORT=3000 node dist/main.js
```

No containerization required for local development. The process is self-contained; there
is no database to migrate, no secret manager to connect to, no sidecar required.

---

## observability

- **logging:** NestJS default Logger to stdout.
- **health check:** `GET /healthz` returns `{"status":"ok"}` while the process is alive.
- **metrics:** out of scope for v0.1.0.
- **tracing:** out of scope for v0.1.0.
