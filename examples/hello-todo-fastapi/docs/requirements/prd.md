# product requirements document — hello-todo-fastapi

## overview

`hello-todo-fastapi` is a single-user, in-memory todo-list HTTP API built with Python and
the FastAPI web framework using a layered architecture. It serves as the FastAPI-stack
filled-in example for the ai-engineering-system, demonstrating what every workflow phase
looks like for a real — if intentionally tiny — project. It is a direct counterpart to
`hello-todo-go`, differing only in language, framework, and architectural style.

## goals

- provide a fully functional REST API for creating, reading, updating, and deleting todo
  items
- demonstrate the ai-engineering-system workflow artifacts filled in end-to-end for a
  Python FastAPI service
- keep the implementation simple enough that a developer can read the entire codebase in
  under one hour
- serve as a stable reference for the layered architecture pattern in Python

## non-goals

- persistent storage: data is in-memory only; loss on restart is acceptable for v0.1.0
- authentication or authorization: the API is intentionally open
- multi-tenancy or user accounts
- frontend, CLI client, or SDK
- production observability (metrics, distributed tracing, alerting)
- rate limiting or request throttling
- sub-tasks, labels, or priorities on todos

## target users

Developers learning the ai-engineering-system who need a concrete reference showing
what a complete set of phase artifacts looks like for a small Python FastAPI service.

## functional requirements

### FR-01: create todo

`POST /v1/todos` accepts a JSON body with a required `title` (non-empty string, max 200
characters) and an optional `due_at` (RFC3339 timestamp). On success, returns 201 with
the created todo object. See `docs/specs/api-spec.md` for the full schema.

### FR-02: list todos

`GET /v1/todos` returns 200 with a JSON envelope `{"items": Todo[]}` containing all
stored todos. Returns an empty list when no todos exist.

### FR-03: get todo

`GET /v1/todos/{id}` returns 200 with the matching todo object. Returns 404 with a
uniform error body when the id is not found.

### FR-04: update todo

`PATCH /v1/todos/{id}` accepts a partial JSON body with any combination of `title`,
`due_at`, and `completed`. Only supplied fields are updated. Returns 200 with the updated
todo. Returns 404 for unknown id. Returns 422 for validation failures (mapped to a uniform
error envelope).

### FR-05: delete todo

`DELETE /v1/todos/{id}` removes the todo and returns 204 (no body). Returns 404 for
unknown id.

### FR-06: health check

`GET /healthz` returns 200 with `{"status":"ok"}`. Used for liveness probing and
smoke testing.

## non-functional requirements

### NFR-01: response time

p99 response time under 50 ms for all endpoints when the in-memory store is in use.
Measured with pytest-based benchmarks; no external load-testing required for v0.1.0.

### NFR-02: error format

All error responses use the uniform JSON envelope:
```
{"error":{"code":"<code>","message":"<human-readable>"}}
```
Valid codes: `not_found`, `validation_error`, `internal`. FastAPI's built-in 422 Unprocessable
Entity responses are intercepted by a global exception handler and rewritten to this shape.
Error messages are in English only for v0.1.0.

### NFR-03: authentication

No authentication in v0.1.0. This is a documented non-goal, not an oversight.

### NFR-04: port configuration

The server binds to `0.0.0.0:8000` by default. The bind port is overridable via the `PORT`
environment variable.

### NFR-05: logging

Structured logs via the `logging` stdlib to stdout. Log level configurable via
`LOG_LEVEL` env var (default: `INFO`). A simple JSON formatter is used so log lines
parse cleanly in log aggregators.

## success criteria

- `pytest` passes with no failures from a clean checkout
- all six endpoints return the correct status codes and response shapes for the scenarios
  defined in `docs/requirements/acceptance-criteria.md`
- a developer unfamiliar with the project can start the service with `make run` and
  exercise every endpoint in under five minutes using the curl examples in
  `docs/specs/api-spec.md`

## scope

### in scope for v0.1.0

- six HTTP endpoints listed in FR-01 through FR-06
- in-memory storage with no persistence
- uniform JSON error responses (including mapped Pydantic validation errors)
- structured logging to stdout
- `make run`, `make test`, `make lint`, `make typecheck` Makefile targets
- GitHub Actions CI running ruff, mypy, and pytest

### out of scope for v0.1.0

- persistent storage (SQLite, Postgres, Redis, or otherwise)
- authentication, API keys, JWT
- pagination or filtering on list endpoint
- sub-tasks, tags, or priorities
- OpenAPI customisation beyond FastAPI defaults
- Docker image or container deployment
- metrics endpoint (`/metrics`)

## open questions

1. Should a later version support sub-tasks (nesting a todo under another todo)? The
   current data model does not include a `parent_id` field. If added, the service
   interface and repository contract would need to change. Deferred to v0.2.0 discussion.

2. Should `GET /v1/todos` support `?completed=true/false` filtering in a follow-up
   release, or is a separate query endpoint preferable? No decision needed for v0.1.0.
