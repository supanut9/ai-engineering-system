# product requirements document — hello-todo-nextjs

## overview

`hello-todo-nextjs` is a single-user, in-memory todo-list application built with Next.js
(App Router) and TypeScript using a layered architecture. It serves as the Next.js
canonical filled-in example for the ai-engineering-system, demonstrating what every
workflow phase looks like for a real — if intentionally tiny — project. The app exposes
a JSON API via App Router route handlers and a server-rendered home page that lists
todos.

## goals

- provide a fully functional REST API for creating, reading, updating, and deleting todo
  items
- render the current todo list server-side on the home page (`/`)
- demonstrate the ai-engineering-system workflow artifacts filled in end-to-end
- keep the implementation simple enough that a developer can read the entire codebase in
  under one hour
- serve as a stable reference for the nextjs-app-router-layered architecture pattern

## non-goals

- persistent storage: data is in-memory only; loss on restart is acceptable for v0.1.0
- authentication or authorization: the API is intentionally open
- multi-tenancy or user accounts
- a dedicated mobile or SPA client; the home page is the only UI
- production observability (metrics, distributed tracing, alerting)
- rate limiting or request throttling
- sub-tasks, labels, or priorities on todos

## target users

Developers learning the ai-engineering-system who need a concrete reference showing
what a complete set of phase artifacts looks like for a small Next.js full-stack
application.

## functional requirements

### FR-01: create todo

`POST /api/todos` accepts a JSON body with a required `title` (non-empty string, max 200
characters) and an optional `due_at` (ISO8601 timestamp). On success, returns 201 with
the created todo object. See `docs/specs/api-spec.md` for the full schema.

### FR-02: list todos

`GET /api/todos` returns 200 with a JSON envelope `{"items": Todo[]}` containing all
stored todos. Returns an empty list when no todos exist.

### FR-03: get todo

`GET /api/todos/:id` returns 200 with the matching todo object. Returns 404 with a
uniform error body when the id is not found.

### FR-04: update todo

`PATCH /api/todos/:id` accepts a partial JSON body with any combination of `title`,
`due_at`, and `completed`. Only supplied fields are updated. Returns 200 with the updated
todo. Returns 404 for unknown id. Returns 400 for validation failures.

### FR-05: delete todo

`DELETE /api/todos/:id` removes the todo and returns 204 (no body). Returns 404 for
unknown id.

### FR-06: health check

`GET /healthz` returns 200 with `{"status":"ok"}`. Used for liveness probing and
smoke testing.

### FR-07: server-rendered home page

`GET /` renders a server component that calls the todos service directly (not via HTTP)
and returns an HTML page listing all current todos. No client-side fetch is required.

## non-functional requirements

### NFR-01: response time

p99 response time under 50 ms for all API endpoints when the in-memory store is in use.
No external load-testing required for v0.1.0.

### NFR-02: error format

All API error responses use the uniform JSON envelope:
```
{"error":{"code":"<code>","message":"<human-readable>"}}
```
Valid codes: `not_found`, `validation_error`, `internal`. Error messages are in English
only for v0.1.0.

### NFR-03: authentication

No authentication in v0.1.0. This is a documented non-goal, not an oversight.

### NFR-04: port configuration

The server binds to `:3000` by default. The bind port is overridable via the `PORT`
environment variable.

### NFR-05: logging

`console.error` / `console.log` to stdout. Next.js internal request logging to stdout.
No third-party logging library for v0.1.0.

## success criteria

- `npm test` passes with no failures from a clean checkout
- all six API endpoints return the correct status codes and response shapes for the
  scenarios defined in `docs/requirements/acceptance-criteria.md`
- `GET /` returns an HTML page with the word "Todos" in the title and renders the list
  of todos without a JavaScript console error
- a developer unfamiliar with the project can start the service with `make dev` and
  exercise every API endpoint in under five minutes using the curl examples in
  `docs/specs/api-spec.md`

## scope

### in scope for v0.1.0

- six HTTP API endpoints listed in FR-01 through FR-06
- server-rendered home page (FR-07)
- in-memory storage with no persistence
- uniform JSON error responses via a shared `errorResponse` helper in route handlers
- console logging to stdout
- `make setup`, `make dev`, `make build`, `make start`, `make test`, `make lint`
  Makefile targets
- GitHub Actions CI running `npm ci`, `npm test`, `next build`

### out of scope for v0.1.0

- persistent storage (SQLite, Postgres, Redis, or otherwise)
- authentication, API keys, JWT
- pagination or filtering on list endpoint
- sub-tasks, tags, or priorities
- OpenAPI / Swagger spec generation
- Docker image or container deployment
- metrics endpoint (`/metrics`)
- client-side interactivity (React state, mutations from the browser)

## open questions

1. Should a later version support sub-tasks (nesting a todo under another todo)? The
   current data model does not include a `parent_id` field. If added, the service
   interface and repository contract would need to change. Deferred to v0.2.0 discussion.

2. Should `GET /api/todos` support `?completed=true/false` filtering in a follow-up
   release, or is a separate query endpoint preferable? No decision needed for v0.1.0.
