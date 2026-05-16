# milestones — hello-todo-fastify

## v0.1.0 — first runnable todo API

| field | value |
|---|---|
| milestone | v0.1.0 |
| description | first runnable todo API with all six endpoints, in-memory storage, and passing tests |
| planned start | 2026-05-16 |
| planned end | 2026-05-16 |
| owner | Example Maintainer <maintainer@example.com> |
| status | shipped |

### acceptance criteria for this milestone

All criteria defined in `../requirements/acceptance-criteria.md` must be satisfied:

- US-001: create a todo with a title → POST /v1/todos returns 201 with correct body
- US-002: create a todo with an optional due date → `due_at` is persisted and returned
- US-003: list all todos → GET /v1/todos returns 200 with `{"items":[...]}`
- US-004: get a single todo by id → 200 on hit, 404 on miss
- US-005: update a todo's fields → PATCH returns 200 with updated fields only
- US-006: delete a todo → DELETE returns 204; subsequent GET returns 404
- US-007: reject empty or missing title → 400 validation_error
- US-008: 404 for unknown id on GET, PATCH, DELETE

### exit criteria

- `npm test` passes with no failures
- `make run` starts the server and `GET /healthz` returns `{"status":"ok"}`
- all nine tasks (TODO-001 through TODO-009) have status `completed`
- `workflow-state.md` reflects Phase 8: Maintenance

### parking-lot items (v0.2.0+)

- persistent storage backend (SQLite or Postgres adapter satisfying `TodoRepository`)
- `GET /v1/todos?completed=true` filtering
- pagination on list endpoint
- Docker image and container deployment
- OpenAPI spec via `@fastify/swagger`
