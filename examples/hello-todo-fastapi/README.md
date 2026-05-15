# hello-todo-fastapi

A minimal, single-user todo-list HTTP API built with Python and FastAPI, structured with layered architecture. It serves as the FastAPI-stack filled-in reference project for the ai-engineering-system workflow: every phase from project intake (Phase 0) through maintenance documentation (Phase 8) is represented here. It is a direct counterpart to `hello-todo-go`, differing in language, framework, and architectural style.

## Quickstart

```bash
make setup   # create .venv and install dependencies
make test    # run pytest
make run     # start the server on :8000

# In a second terminal:
curl -s localhost:8000/healthz
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"buy milk"}' localhost:8000/v1/todos
curl -s localhost:8000/v1/todos
```

Environment variable `PORT` overrides the default port `8000`.

## Endpoints

| Method | Path              | Description          |
|--------|-------------------|----------------------|
| GET    | /healthz          | Health check         |
| POST   | /v1/todos         | Create a todo        |
| GET    | /v1/todos         | List all todos       |
| GET    | /v1/todos/{id}    | Get a single todo    |
| PATCH  | /v1/todos/{id}    | Partial update       |
| DELETE | /v1/todos/{id}    | Delete a todo        |

## Project layout

```
src/hello_todo_fastapi/
  main.py                            — app factory, exception handlers, wiring
  api/
    health.py                        — GET /healthz router
    todos.py                         — /v1/todos resource router
  services/
    todo.py                          — business logic (TodoService)
  repositories/
    memory.py                        — TodoRepository Protocol + MemoryTodoRepository
  models/
    todo.py                          — Pydantic entity and DTO models
  config/
    settings.py                      — pydantic-settings (PORT, LOG_LEVEL)
  errors/
    api_error.py                     — TodoNotFoundError + ErrorEnvelope
tests/
  conftest.py                        — shared fixtures
  test_health.py                     — health endpoint tests
  test_todos.py                      — todo CRUD tests (US-001 through US-008)
docs/
  requirements/                      — Phase 0–1: project brief, PRD, user stories
  specs/                             — Phase 2: functional spec, API spec, data model
  architecture/                      — Phase 3: system design, tech stack, ADRs
  plan/                              — Phase 4: implementation plan, milestones, tasks
  tests/                             — Phase 6: test plan, checklists
  release/                           — Phase 7: go-live checklist, deployment, rollback
  maintenance/                       — Phase 8: runbook, known issues
```

## Makefile targets

| Target     | Description                                          |
|------------|------------------------------------------------------|
| setup      | Create `.venv` and install runtime + dev deps        |
| run        | Start the server with uvicorn (hot-reload enabled)   |
| test       | `pytest`                                             |
| lint       | `ruff check` + `ruff format --check`                 |
| fmt        | `ruff format` (auto-format)                          |
| typecheck  | `mypy src tests`                                     |

## Full workflow docs

See `docs/` for the complete Phase 0–8 artifacts. Start with `docs/requirements/project-brief.md` to understand the product context, then follow the phases in order.

This example was bootstrapped from ai-engineering-system v0.0.1 and serves as the FastAPI reference.
