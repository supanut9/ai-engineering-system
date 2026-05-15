# tasks — hello-todo-fastapi

Tasks are sequenced domain-outward. See `implementation-plan.md` for the dependency
graph and test strategy. Acceptance criteria are in
`../requirements/acceptance-criteria.md`.

---

## TODO-001: Pydantic models and error types

**description:** Define all Pydantic v2 models in `src/hello_todo_fastapi/models/todo.py`
and the error types in `src/hello_todo_fastapi/errors/api_error.py`. Models include:
`Todo` (entity), `CreateTodoRequest`, `PatchTodoRequest`, `TodoResponse`,
`TodoListResponse`, and `ErrorEnvelope`. The `PatchTodoRequest` must use a sentinel
(`_UNSET`) for `due_at` to distinguish "omitted" from "explicitly null". `TodoNotFoundError`
lives in `errors/api_error.py`.

**depends on:** nothing

**acceptance criteria:**
- `Todo` has fields: `id`, `title`, `completed`, `due_at`, `created_at`, `updated_at`
- `CreateTodoRequest` validates `title` non-empty after strip; max 200 chars
- `PatchTodoRequest` allows all fields optional; `due_at` distinguishes null vs absent
- `TodoResponse` serialises `datetime` fields as RFC3339 strings
- package compiles with `python -c "from hello_todo_fastapi.models.todo import Todo"`

**test approach:** unit test validating that empty title raises `ValidationError`, that
a 200-char title is accepted, and that a 201-char title is rejected

**complexity:** small

---

## TODO-002: in-memory repository

**description:** Implement the `TodoRepository` Protocol and the `MemoryTodoRepository`
class in `src/hello_todo_fastapi/repositories/memory.py`. Storage is a
`dict[str, Todo]` plus an insertion-order list, both guarded by `asyncio.Lock`. All
methods are `async`. Methods: `save`, `find_all`, `find_by_id`, `delete`.
`find_by_id` returns a copy so callers cannot mutate internal state through the
reference.

**depends on:** TODO-001

**acceptance criteria:**
- `find_by_id` raises `TodoNotFoundError` when id is absent
- `delete` raises `TodoNotFoundError` when id is absent
- `find_all` preserves insertion order
- `save` on an existing id updates in place and does not create a duplicate entry

**test approach:** unit tests exercising all four methods with `pytest.mark.asyncio`;
verify `TodoNotFoundError` is raised on missing id

**complexity:** small

---

## TODO-003: todo service (business logic)

**description:** Implement `TodoService` in `src/hello_todo_fastapi/services/todo.py`.
The service depends on the `TodoRepository` Protocol (not the concrete class). Business
logic includes: title strip and validation, id generation via `secrets.token_hex(16)`,
`created_at`/`updated_at` stamping with `datetime.now(UTC)`, partial-update semantics
for PATCH (title, due_at, completed), `TodoNotFoundError` propagation on get/update/delete.

**depends on:** TODO-002

**acceptance criteria (links to user stories):**
- title strip and length validation (US-007)
- `completed` defaults to `false` on create (US-001)
- `updated_at` changes on PATCH (US-005)
- raises `TodoNotFoundError` when repository raises it (US-008)
- sending empty PATCH body `{}` leaves the todo unchanged (functional-spec edge case)

**test approach:** unit tests with a hand-rolled async stub implementing the
`TodoRepository` Protocol

**complexity:** medium

---

## TODO-004: HTTP handlers (api/todos.py and api/health.py)

**description:** Implement the FastAPI routers in `src/hello_todo_fastapi/api/todos.py`
and `src/hello_todo_fastapi/api/health.py`. Each route handler is a thin async
function that calls the service, then returns the appropriate Pydantic response model
with the correct status code. Handlers must not contain business logic; they only
decode the request, call the service, and encode the response. Service dependency is
injected via `request.app.state.service`.

**depends on:** TODO-003

**acceptance criteria (links to user stories):**
- POST returns 201 with todo body (US-001, US-002)
- GET list returns 200 with `{"items":[...]}` (US-003)
- GET by id returns 200 or 404 (US-004, US-008)
- PATCH returns 200 or 422 or 404 (US-005, US-007, US-008)
- DELETE returns 204 or 404 (US-006, US-008)
- health returns 200 `{"status":"ok"}`
- error responses use the uniform envelope

**test approach:** TestClient tests for each handler; one happy-path and at least one
error-path test per endpoint

**complexity:** medium

---

## TODO-005: app factory and exception handlers (main.py)

**description:** Write `src/hello_todo_fastapi/main.py`. Creates the `FastAPI` app,
instantiates `MemoryTodoRepository` and `TodoService`, stores them on `app.state`,
includes the health and todos routers, and registers global exception handlers for
`RequestValidationError` (→ 422 with the validation_error envelope) and `TodoNotFoundError`
(→ 404 with the not_found envelope). A catch-all handler for unhandled exceptions
returns 500 with the internal envelope.

**depends on:** TODO-004

**acceptance criteria:**
- `uvicorn hello_todo_fastapi.main:app` starts without errors
- `GET /healthz` returns `{"status":"ok"}`
- Pydantic validation errors are returned as `{"error":{"code":"validation_error",...}}`
  not FastAPI's default 422 shape

**test approach:** TestClient tests verifying that validation errors and not-found
errors are returned in the uniform envelope

**complexity:** small

---

## TODO-006: settings and logging

**description:** Write `src/hello_todo_fastapi/config/settings.py` (pydantic-settings
`BaseSettings` reading `PORT` and `LOG_LEVEL`) and add logging configuration in
`main.py`. The logging setup runs at import time: configure the root logger with a
`StreamHandler` to stdout, a simple JSON formatter, and the level from `settings.log_level`.

**depends on:** TODO-005

**acceptance criteria:**
- `PORT=9090 uvicorn hello_todo_fastapi.main:app` binds on port 9090
- startup emits a JSON log line `{"level":"INFO","message":"server starting","port":...}`
- `LOG_LEVEL=DEBUG` causes debug-level log lines to appear in stdout

**test approach:** unit test loading `Settings` with overridden env vars; verify the
`port` and `log_level` fields read correctly

**complexity:** small

---

## TODO-007: unit and integration tests

**description:** Write comprehensive tests in `tests/test_health.py` and
`tests/test_todos.py` covering all acceptance criteria in
`../requirements/acceptance-criteria.md`. Minimum 15 test cases. Use `TestClient`
(synchronous, no `pytest-asyncio` needed for HTTP-layer tests) plus async unit tests
for service and repository layers.

**depends on:** TODO-006

**acceptance criteria:**
- `pytest` passes with zero failures
- each user story (US-001 through US-008) has at least one corresponding test case
- validation error test confirms the uniform envelope shape (not FastAPI's default)
- PATCH `due_at: null` test confirms the field is cleared

**test approach:** `TestClient` for HTTP layer; `pytest.mark.asyncio` for repository
and service unit tests; stub repository for service tests

**complexity:** medium

---

## TODO-008: Makefile and CI

**description:** Write the `Makefile` with targets: `setup` (create venv and install
deps), `run` (start server), `test` (`pytest`), `lint` (`ruff check` + `ruff format
--check`), `fmt` (`ruff format`), `typecheck` (`mypy src tests`). Write
`.github/workflows/ci.yml` that runs `ruff check`, `ruff format --check`, `mypy`, and
`pytest` on push and PR.

**depends on:** TODO-007

**acceptance criteria:**
- `make setup && make test` passes from a clean clone
- `make lint` exits zero on correctly formatted code
- `make typecheck` exits zero
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
- `CHANGELOG.md` has a `## [0.1.0] — 2026-05-16` entry listing all six endpoints
- `workflow-state.md` current phase = Phase 8: Maintenance, milestone = v0.1.0 shipped

**test approach:** doc review; verify all cross-links resolve

**complexity:** small
