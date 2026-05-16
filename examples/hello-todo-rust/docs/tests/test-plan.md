# Test Plan — hello-todo-rust v0.1.0

## Scope

All six HTTP endpoints and the in-memory storage adapter for the `hello-todo-rust` service.

Out of scope: load testing, security scanning, external integrations (none exist in v0.1.0).

## Test layers

### Unit — core service (`src/core/todo/service.rs` `#[cfg(test)]`)

Tests the service in isolation using a local stub repository (defined in the same test module). No Axum, no Tokio runtime beyond `#[tokio::test]`.

| Test | Covered behaviour |
|------|-------------------|
| `test_create_happy_path` | Valid title produces a todo with id, correct title, completed=false |
| `test_create_empty_title` | Empty title returns validation error |
| `test_create_whitespace_only_title` | Whitespace-only title returns validation error |
| `test_create_title_too_long` | 201-char title returns validation error |
| `test_get_unknown_id` | Unknown id returns not-found error |
| `test_update_unknown_id` | Update on unknown id returns not-found error |
| `test_delete_unknown_id` | Delete on unknown id returns not-found error |
| `test_update_sets_completed_and_advances_updated_at` | Patch sets completed and bumps updated_at |
| `test_list_insertion_order` | List returns todos in insertion order |
| `test_update_title_validation` | Whitespace and over-length title rejected on patch |

### Unit — memory adapter (`src/adapters/outbound/memory/store.rs` `#[cfg(test)]`)

Tests the in-memory `MemoryStore` directly.

| Test | Covered behaviour |
|------|-------------------|
| `test_save_and_find_by_id` | Save then find_by_id returns the saved todo |
| `test_find_by_id_not_found` | find_by_id on missing id returns RepositoryError::NotFound |
| `test_find_all_insertion_order` | find_all preserves insertion order |
| `test_delete_happy_path` | delete removes item; find_by_id returns NotFound |
| `test_delete_not_found` | delete on missing id returns RepositoryError::NotFound |
| `test_save_returns_isolated_clone` | Mutating the original after save does not affect stored state |
| `test_save_update_existing` | Saving again with same id updates in place, does not duplicate |

### Integration — HTTP handlers (`src/adapters/inbound/http/handlers.rs` `#[cfg(test)]`)

Uses `tower::ServiceExt::oneshot`. Each test builds the full Axum router wired to a real `MemoryStore`, sends an HTTP request, and asserts response codes and JSON bodies.

| Test | Covered behaviour |
|------|-------------------|
| `test_healthz` | GET /healthz → 200 `{"status":"ok"}` |
| `test_create_todo_happy_path` | POST /v1/todos → 201, correct body shape |
| `test_create_todo_empty_title` | POST /v1/todos empty title → 400 validation_error |
| `test_create_todo_invalid_json` | POST /v1/todos malformed body → 400 |
| `test_list_todos_empty` | GET /v1/todos with no items → 200 `{"items":[]}` |
| `test_list_todos_with_items` | GET /v1/todos after two creates → 200 with two items |
| `test_get_todo_happy_path` | GET /v1/todos/:id → 200 with matching id |
| `test_get_todo_not_found` | GET /v1/todos/nonexistent → 404 not_found |
| `test_update_todo_happy_path` | PATCH /v1/todos/:id updates title and completed |
| `test_update_todo_not_found` | PATCH /v1/todos/ghost → 404 |
| `test_update_todo_clear_due_at` | PATCH with `"due_at":null` clears the field |
| `test_delete_todo_happy_path` | DELETE /v1/todos/:id → 204; subsequent GET → 404 |
| `test_delete_todo_not_found` | DELETE /v1/todos/ghost → 404 |

### Manual / exploratory

See `manual-test-checklist.md`. Run by a human before any release.

## Coverage targets

| Layer | Target |
|-------|--------|
| core/todo | ≥ 90% statement coverage |
| memory adapter | ≥ 90% statement coverage |
| HTTP handlers | every handler has at least one happy-path and one error-path test |

Run `cargo llvm-cov --html` (requires `cargo install cargo-llvm-cov`) to measure.

## CI gate

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs `cargo test` on every
push and pull request. The build must be green before merging. `cargo clippy -- -D warnings`
and `cargo fmt --all -- --check` are also required to pass.

## Regression

See `regression-checklist.md` for the pre-release checklist.
