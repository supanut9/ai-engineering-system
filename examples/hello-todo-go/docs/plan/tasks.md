# tasks — hello-todo-go

Tasks are sequenced domain-outward. See `implementation-plan.md` for the dependency
graph and test strategy. Acceptance criteria are in
`../requirements/acceptance-criteria.md`.

---

## TODO-001: domain entity and id generation

**description:** Define the `Todo` struct in `internal/core/todo/todo.go`. Implement
the id generation helper using `crypto/rand`. Include field-level documentation
comments. No business logic in this task — entity only.

**depends on:** nothing

**acceptance criteria:**
- `Todo` struct has fields: `ID`, `Title`, `Completed`, `DueAt (*time.Time)`,
  `CreatedAt`, `UpdatedAt`
- id generation produces a non-empty string on every call
- package compiles with `go build ./...`

**test approach:** unit test asserting that two sequential ids are non-empty and unequal

**complexity:** small

---

## TODO-002: core service (business logic)

**description:** Implement `TodoService` in `internal/core/todo/service.go`. The
service implements the inbound port interface (`ports/inbound/todo.go`) and depends
on the outbound port interface (`ports/outbound/todo_repository.go`). Business logic
includes: title trim and validation, `created_at`/`updated_at` stamping, id generation
on create, `ErrNotFound` propagation on get/update/delete.

**depends on:** TODO-001

**acceptance criteria (links to user stories):**
- title trim and length validation (US-007)
- `completed` defaults to false on create (US-001)
- `updated_at` changes on PATCH (US-005)
- returns `ErrNotFound` when repository returns not found (US-008)

**test approach:** unit tests with a hand-rolled stub repository implementing the
outbound interface

**complexity:** medium

---

## TODO-003: in-memory repository adapter

**description:** Implement the in-memory adapter `Store` in
`internal/adapters/outbound/memory/todo_repository.go`. Uses `map[string]*Todo` and
`sync.RWMutex`. Implements the outbound `Repository` interface (defined in
`core/todo/repository.go`, re-exported via `ports/outbound/todo_repository.go`):
`Save`, `FindAll`, `FindByID`, `Delete`. `FindByID` returns a copy so callers cannot
mutate internal state.

**depends on:** TODO-001

**acceptance criteria:**
- `FindByID` returns `ErrNotFound` when key is absent
- `Delete` returns `ErrNotFound` when key is absent
- concurrent reads do not race with writes (verified by `go test -race`)

**test approach:** unit tests covering all five methods; run with `-race` flag

**complexity:** small

---

## TODO-004: HTTP handlers

**description:** Implement Gin handler functions in
`internal/adapters/inbound/http/handlers/todos.go` and `health.go`. Handlers decode
the request, call the inbound port, and encode the response. Map `ErrNotFound` to 404,
validation errors to 400, and unexpected errors to 500. Handlers must not import the
core service directly — only the port interface.

**depends on:** TODO-002

**acceptance criteria (links to user stories):**
- POST returns 201 with todo body (US-001, US-002)
- GET list returns 200 with `{"items":[...]}` (US-003)
- GET by id returns 200 or 404 (US-004, US-008)
- PATCH returns 200 or 400 or 404 (US-005, US-007, US-008)
- DELETE returns 204 or 404 (US-006, US-008)
- health returns 200 `{"status":"ok"}`
- error responses use the uniform envelope

**test approach:** handler tests using `httptest.NewRecorder`; inject a mock service

**complexity:** medium

---

## TODO-005: route wiring

**description:** Wire all handlers to the Gin engine in
`internal/adapters/inbound/http/routes/routes.go`. Mount todos under `/v1/todos` and
health at `/healthz`. Accept a `TodoService` inbound port interface as a parameter.

**depends on:** TODO-004

**acceptance criteria:**
- all six URL patterns are registered on the engine
- handler functions are connected to the correct HTTP methods and paths

**test approach:** a single integration-level test that starts a `httptest.Server` and
hits all six routes to confirm routing is correct (status code only)

**complexity:** small

---

## TODO-006: composition root (main.go)

**description:** Write `cmd/api/main.go`. Reads `PORT` env var (defaults to 8080).
Creates the memory `Store`, creates the core service, creates Gin engine, calls
`routes.Register`, runs an `http.Server` with graceful shutdown on `SIGINT`/`SIGTERM`.
Sets up `log/slog` with the JSON handler writing to stdout.

**depends on:** TODO-003, TODO-005

**acceptance criteria:**
- `go run ./cmd/api` starts successfully
- `GET /healthz` returns `{"status":"ok"}`
- default port is 8080; `PORT=9090` changes the bind port

**test approach:** manual smoke test with curl; automated in TODO-008 via `make run`

**complexity:** small

---

## TODO-007: unit and integration tests

**description:** Write comprehensive tests covering all acceptance criteria in
`../requirements/acceptance-criteria.md`. Include: service unit tests (TODO-002
extended), repository unit tests with `-race` (TODO-003 extended), handler tests with
httptest, and at least one end-to-end test that starts the full server and exercises
all six endpoints.

**depends on:** TODO-006

**acceptance criteria:**
- `go test ./...` passes with zero failures
- `go test -race ./...` passes (no data races)
- each user story (US-001 through US-008) has at least one corresponding test case

**test approach:** `testing` + `httptest` throughout; no third-party test libraries

**complexity:** medium

---

## TODO-008: Makefile and CI

**description:** Write the `Makefile` with targets: `setup` (download deps), `run`
(start server), `test` (`go test ./...`), `test-race` (`go test -race ./...`),
`test-integration` (start server, run curl smoke assertions, stop server), `lint`
(`go vet ./...` + `gofmt -l`), `build` (compile binary to `./bin/api`). Write
`.github/workflows/ci.yml` that runs `make test` and `make lint` on push and PR.

**depends on:** TODO-007

**acceptance criteria:**
- `make setup && make test` passes from a clean clone
- `make lint` exits zero on correctly formatted code
- CI workflow runs green on the main branch

**test approach:** run all make targets locally before committing; CI is self-verifying

**complexity:** small

---

## TODO-009: runbook and docs polish

**description:** Write `docs/maintenance/runbook.md` (start/stop, log inspection, known
issues) and `docs/maintenance/known-issues.md` (in-memory storage limitation). Write
`CHANGELOG.md` with a `0.1.0` entry. Review all phase docs for consistency. Update
`workflow-state.md` and `active-task.md` to reflect milestone complete.

**depends on:** TODO-008

**acceptance criteria:**
- runbook covers: how to start, stop, change port, read logs, and restart the service
- known-issues documents the in-memory storage limitation and links to the v0.2.0
  parking-lot item in `milestones.md`
- `CHANGELOG.md` has a `## [0.1.0] — 2026-05-15` entry listing all six endpoints
- `workflow-state.md` current phase = Phase 8: Maintenance, milestone = v0.1.0 shipped

**test approach:** doc review; verify all cross-links resolve

**complexity:** small
