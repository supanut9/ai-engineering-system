# tasks — hello-todo-fastify

Tasks are sequenced domain-outward. See `implementation-plan.md` for the dependency
graph and test strategy. Acceptance criteria are in
`../requirements/acceptance-criteria.md`.

---

## TODO-001: domain entity and factory

**description:** Define the `Todo` interface in `src/core/todo/todo.ts`. Implement the
`createTodo(title, dueAt?)` factory function using the `uuid` package for id generation
and `new Date().toISOString()` for timestamps. Define `NotFoundError` and
`ValidationError` domain error classes in `src/core/todo/errors.ts`. No service logic
in this task — entity and errors only.

**depends on:** nothing

**acceptance criteria:**
- `Todo` interface has fields: `id`, `title`, `completed`, `dueAt`, `createdAt`,
  `updatedAt`
- `createTodo` produces a todo with a non-empty UUID id and correct defaults
- package compiles with `tsc --noEmit`

**test approach:** unit test asserting that two sequential ids are non-empty and unequal;
factory rejects empty and whitespace-only titles

**complexity:** small

---

## TODO-002: core service and port interfaces

**description:** Define the `TodoServicePort` inbound interface in
`src/ports/inbound/todo-service.port.ts` with methods: `create`, `list`, `get`,
`update`, `delete`. Define `CreateInput` and `PatchInput` types. Define the
`TodoRepository` outbound interface in `src/ports/outbound/todo-repository.port.ts`
with methods: `save`, `findAll`, `findById`, `delete`. Implement `TodoService` in
`src/core/todo/todo-service.ts` satisfying `TodoServicePort` and depending on
`TodoRepository`. Business logic: title trim and validation, `updatedAt` stamping,
`NotFoundError` propagation, partial-update semantics for PATCH.

**depends on:** TODO-001

**acceptance criteria (links to user stories):**
- title trim and length validation (US-007)
- `completed` defaults to false on create (US-001)
- `updatedAt` advances on PATCH (US-005)
- returns `NotFoundError` when repository returns `undefined` (US-008)
- PATCH with `{}` leaves the todo unchanged (US-005)

**test approach:** unit tests with a hand-rolled stub implementing `TodoRepository`

**complexity:** medium

---

## TODO-003: in-memory repository adapter

**description:** Implement `MemoryTodoRepository` in
`src/adapters/outbound/memory/memory-todo-repository.ts`. Uses `Map<string, Todo>`.
Implements `TodoRepository`: `save`, `findAll`, `findById`, `delete`. `findById`
returns a shallow copy of the stored object so callers cannot mutate internal state.
`delete` returns `true` on success, `false` when id is absent.

**depends on:** TODO-001

**acceptance criteria:**
- `findById` returns `undefined` when key is absent
- `delete` returns `false` when key is absent
- `findAll` returns todos in insertion order (Map iteration order)
- all methods are async (`Promise`-returning) to match the port interface

**test approach:** unit tests covering all four methods

**complexity:** small

---

## TODO-004: Zod schemas and Fastify routes

**description:** Write Zod schemas in `src/adapters/inbound/http/schemas.ts` for the
POST and PATCH request bodies and the Todo response shape. Register all six routes in
`src/adapters/inbound/http/routes.ts` using `fastify-type-provider-zod`. Route
handlers call `TodoServicePort` methods, map results to HTTP responses (201, 200, 204),
and do not import the concrete service class.

**depends on:** TODO-002

**acceptance criteria (links to user stories):**
- POST returns 201 with todo body (US-001, US-002)
- GET list returns 200 with `{"items":[...]}` (US-003)
- GET by id returns 200 or 404 (US-004, US-008)
- PATCH returns 200 or 400 or 404 (US-005, US-007, US-008)
- DELETE returns 204 or 404 (US-006, US-008)
- health returns 200 `{"status":"ok"}`
- Zod schema failures from `fastify-type-provider-zod` produce 400 before the handler
  runs

**test approach:** route integration tests using `fastify.inject()` with a stub service
(optional at this stage; confirmed in TODO-007)

**complexity:** medium

---

## TODO-005: error handler

**description:** Write a Fastify `setErrorHandler` in
`src/adapters/inbound/http/error-handler.ts`. Map `NotFoundError` → 404,
`ValidationError` → 400, Zod `ZodError` → 400, and all other errors → 500. All
responses use the uniform error envelope `{"error":{"code":"...","message":"..."}}`.

**depends on:** TODO-004

**acceptance criteria:**
- `NotFoundError` produces `{"error":{"code":"not_found","message":"todo not found"}}`
- `ValidationError` produces `{"error":{"code":"validation_error","message":"..."}}`
- unhandled errors produce `{"error":{"code":"internal","message":"internal server error"}}`

**test approach:** tested implicitly via route integration tests in TODO-007

**complexity:** small

---

## TODO-006: composition root (index.ts)

**description:** Write `src/index.ts`. Reads `PORT` (default `8080`) and `LOG_LEVEL`
(default `info`) from the environment. Creates the Fastify instance with pino logging.
Instantiates `MemoryTodoRepository`, instantiates `TodoService`, registers the error
handler, calls `routes.register(fastify, service)`, and calls `fastify.listen`.
Handles `SIGTERM` / `SIGINT` with `fastify.close()` for graceful shutdown.

**depends on:** TODO-003, TODO-005

**acceptance criteria:**
- `npm run dev` starts successfully (tsx watch)
- `GET /healthz` returns `{"status":"ok"}`
- default port is 8080; `PORT=9090` changes the bind port
- `SIGTERM` triggers graceful shutdown; process exits 0

**test approach:** manual smoke test with curl; automated in TODO-007

**complexity:** small

---

## TODO-007: unit and integration tests

**description:** Write comprehensive tests covering all acceptance criteria in
`../requirements/acceptance-criteria.md`. Service unit tests with a stub repository;
repository unit tests; route integration tests using `fastify.inject()` for all six
endpoints (happy path and error paths). Each user story (US-001 through US-008) must
have at least one test case.

**depends on:** TODO-006

**acceptance criteria:**
- `npm test` (Vitest) passes with zero failures
- each user story (US-001 through US-008) has at least one corresponding test
- route tests use `fastify.inject()` — no real socket, no port conflicts

**test approach:** Vitest throughout; `fastify.inject()` for route-level tests

**complexity:** medium

---

## TODO-008: Makefile and CI

**description:** Write the `Makefile` with targets: `setup` (npm install), `run`
(npm run dev), `test` (npm test), `lint` (tsc --noEmit), `fmt` (placeholder for
prettier), `build` (npm run build). Write `.github/workflows/ci.yml` that runs
`npm ci`, `npm test`, and `npm run build` on push and PR with Node 22.

**depends on:** TODO-007

**acceptance criteria:**
- `make setup && make test` passes from a clean clone
- `make lint` exits zero on a correctly typed codebase
- CI workflow runs green on the main branch

**test approach:** run all make targets locally before committing; CI is self-verifying

**complexity:** small

---

## TODO-009: runbook and docs polish

**description:** Write `docs/maintenance/runbook.md` (start/stop, log inspection,
known issues) and `docs/maintenance/known-issues.md` (in-memory storage limitation).
Write `CHANGELOG.md` with a `0.1.0` entry. Review all phase docs for consistency.
Update `workflow-state.md` and `active-task.md` to reflect milestone complete.

**depends on:** TODO-008

**acceptance criteria:**
- runbook covers: how to start, stop, change port, read logs, and restart the service
- known-issues documents the in-memory storage limitation and links to the v0.2.0
  parking-lot item in `milestones.md`
- `CHANGELOG.md` has a `## [0.1.0] — 2026-05-16` entry listing all six endpoints
- `workflow-state.md` current phase = Phase 8: Maintenance, milestone = v0.1.0 shipped

**test approach:** doc review; verify all cross-links resolve

**complexity:** small
