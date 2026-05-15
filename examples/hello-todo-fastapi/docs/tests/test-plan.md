# Test Plan — hello-todo-fastapi v0.1.0

## Scope

All six HTTP endpoints and the in-memory storage adapter for the `hello-todo-fastapi` service.

Out of scope: load testing, security scanning, external integrations (none exist in v0.1.0).

## Test layers

### Unit — Pydantic model validation (`tests/test_todos.py` — model-level cases)

Tests that Pydantic's validation rules in `CreateTodoRequest` and `PatchTodoRequest`
behave as specified. Run via the TestClient so no model-only unit test file is needed.

### Integration — HTTP endpoints (`tests/test_health.py`, `tests/test_todos.py`)

Uses FastAPI's `TestClient` (backed by HTTPX). Each test creates a fresh app instance
(via the `client` fixture in `conftest.py`) so tests are fully isolated.

| Test | Covered behaviour |
|------|-------------------|
| `test_health_returns_200` | GET /healthz → 200 |
| `test_health_returns_ok_body` | GET /healthz → `{"status":"ok"}` |
| `test_create_todo_happy_path` | POST /v1/todos → 201, correct body shape (US-001) |
| `test_create_todo_with_due_at` | POST with due_at → 201, due_at returned (US-002) |
| `test_create_todo_empty_title_returns_422` | POST empty title → 422 validation_error (US-007) |
| `test_create_todo_whitespace_title_returns_422` | POST whitespace title → 422 (US-007) |
| `test_create_todo_missing_title_returns_422` | POST no title key → 422 (US-007) |
| `test_create_todo_title_too_long_returns_422` | POST 201-char title → 422 (US-007) |
| `test_create_todo_title_exactly_200_chars_accepted` | POST 200-char title → 201 |
| `test_list_todos_empty` | GET /v1/todos empty store → 200 `{"items":[]}` (US-003) |
| `test_list_todos_with_items` | GET after two creates → 200, two items (US-003) |
| `test_get_todo_happy_path` | GET /v1/todos/:id → 200 (US-004) |
| `test_get_todo_not_found` | GET /v1/todos/unknown → 404 not_found (US-008) |
| `test_update_todo_happy_path` | PATCH title and completed → 200 (US-005) |
| `test_update_todo_partial_fields_unchanged` | PATCH completed only; title unchanged (US-005) |
| `test_update_todo_clear_due_at` | PATCH due_at:null clears field (US-005) |
| `test_update_todo_empty_body_is_idempotent` | PATCH {} → 200, todo unchanged |
| `test_update_todo_empty_title_returns_422` | PATCH empty title → 422 (US-007) |
| `test_update_todo_not_found` | PATCH unknown id → 404 not_found (US-008) |
| `test_delete_todo_happy_path` | DELETE → 204; subsequent GET → 404 (US-006) |
| `test_delete_todo_not_found` | DELETE unknown id → 404 not_found (US-008) |
| `test_error_envelope_shape` | validation error uses uniform envelope, not FastAPI default |
| `test_not_found_envelope` | GET/PATCH/DELETE unknown id — identical envelope (US-008) |

### Manual / exploratory

See `manual-test-checklist.md`. Run by a human before any release.

## Coverage targets

| Layer | Target |
|-------|--------|
| API handlers | every handler has at least one happy-path and one error-path test |
| Services | every business rule (title validation, timestamps, partial update) covered via HTTP tests |
| Repositories | CRUD operations covered indirectly via HTTP tests |

Run `pytest --cov=hello_todo_fastapi --cov-report=term-missing` for a coverage report.
(Requires `pytest-cov`; add to dev deps if needed.)

## CI gate

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs `ruff check`, `ruff format --check`,
`mypy`, and `pytest -q` on every push and pull request.  All checks must be green before merging.

## Regression

See `regression-checklist.md` for the pre-release checklist.
