# Test Plan — hello-todo-go v0.1.0

## Scope

All six HTTP endpoints and the in-memory storage adapter for the `hello-todo-go` service.

Out of scope: load testing, security scanning, external integrations (none exist in v0.1.0).

## Test layers

### Unit — core service (`internal/core/todo/service_test.go`)

Tests the service in isolation using a local stub repository (defined in the same test file). No Gin, no HTTP.

| Test | Covered behaviour |
|------|-------------------|
| `TestCreate_HappyPath` | Valid title produces a todo with id, correct title, completed=false |
| `TestCreate_EmptyTitle` | Empty title returns error |
| `TestCreate_WhitespaceOnlyTitle` | Whitespace-only title returns error |
| `TestCreate_TitleTooLong` | 201-char title returns error |
| `TestGet_UnknownID` | Unknown id returns not-found error |
| `TestUpdate_UnknownID` | Update on unknown id returns not-found error |
| `TestDelete_UnknownID` | Delete on unknown id returns not-found error |
| `TestUpdate_SetsCompletedAndAdvancesUpdatedAt` | Patch sets completed and bumps updated_at |
| `TestList_InsertionOrder` | List returns todos in insertion order |
| `TestUpdate_TitleValidation` | Whitespace and over-length title rejected on patch |

### Unit — memory adapter (`internal/adapters/outbound/memory/todo_repository_test.go`)

Tests the in-memory `Store` directly.

| Test | Covered behaviour |
|------|-------------------|
| `TestStore_SaveAndFindByID` | Save then FindByID returns the saved todo |
| `TestStore_FindByID_NotFound` | FindByID on missing id returns ErrNotFound |
| `TestStore_FindAll_InsertionOrder` | FindAll preserves insertion order |
| `TestStore_Delete_HappyPath` | Delete removes item; FindByID returns ErrNotFound |
| `TestStore_Delete_NotFound` | Delete on missing id returns ErrNotFound |
| `TestStore_Save_ReturnsIsolatedCopy` | Mutating the original after Save does not affect stored state |
| `TestStore_Save_UpdateExisting` | Saving again with same id updates in place, does not duplicate |

### Integration — HTTP handlers (`internal/adapters/inbound/http/handlers/todos_test.go`, `health_test.go`)

Uses `net/http/httptest`. Each test spins up a full Gin engine wired to a real memory store, sends HTTP requests, and asserts response codes and JSON bodies.

| Test | Covered behaviour |
|------|-------------------|
| `TestHealthz` | GET /healthz → 200 `{"status":"ok"}` |
| `TestCreateTodo_HappyPath` | POST /v1/todos → 201, correct body shape |
| `TestCreateTodo_EmptyTitle` | POST /v1/todos empty title → 400 validation_error |
| `TestCreateTodo_InvalidJSON` | POST /v1/todos malformed body → 400 |
| `TestListTodos_Empty` | GET /v1/todos with no items → 200 `{"items":[]}` |
| `TestListTodos_WithItems` | GET /v1/todos after two creates → 200 with two items |
| `TestGetTodo_HappyPath` | GET /v1/todos/:id → 200 with matching id |
| `TestGetTodo_NotFound` | GET /v1/todos/nonexistent → 404 not_found |
| `TestUpdateTodo_HappyPath` | PATCH /v1/todos/:id updates title and completed |
| `TestUpdateTodo_NotFound` | PATCH /v1/todos/ghost → 404 |
| `TestUpdateTodo_ClearDueAt` | PATCH with `"due_at":null` clears the field |
| `TestDeleteTodo_HappyPath` | DELETE /v1/todos/:id → 204; subsequent GET → 404 |
| `TestDeleteTodo_NotFound` | DELETE /v1/todos/ghost → 404 |

### Manual / exploratory

See `manual-test-checklist.md`. Run by a human before any release.

## Coverage targets

| Layer | Target |
|-------|--------|
| core/todo | ≥ 90% statement coverage |
| memory adapter | ≥ 90% statement coverage |
| HTTP handlers | every handler has at least one happy-path and one error-path test |

Run `go test -coverprofile=coverage.out ./... && go tool cover -func=coverage.out` to measure.

## CI gate

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs `go test -race ./...` on every push and pull request. The build must be green before merging.

## Regression

See `regression-checklist.md` for the pre-release checklist.
