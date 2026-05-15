# data model — hello-todo-go

This document describes the logical data model for `hello-todo-go`. The in-memory
store (`map[string]Todo` guarded by `sync.RWMutex`) is an implementation detail
and is not part of the model.

---

## entity: Todo

| field | type | required | default | notes |
|---|---|---|---|---|
| `id` | string | yes (server-assigned) | — | opaque identifier; generated at creation time using `crypto/rand`-based encoding; callers must treat as opaque |
| `title` | string | yes | — | non-empty after trim; max 200 characters; trimmed before storage |
| `completed` | bool | yes | `false` | indicates whether the todo is done |
| `due_at` | string \| null | no | `null` | RFC3339 UTC timestamp; null when no due date is set |
| `created_at` | string | yes (server-managed) | current UTC time at creation | RFC3339; immutable after creation |
| `updated_at` | string | yes (server-managed) | same as `created_at` at creation | RFC3339; updated on every successful PATCH |

---

## validation rules

| field | rule |
|---|---|
| `title` | must be present; must be non-empty after trimming leading/trailing whitespace; trimmed value must be ≤ 200 characters |
| `due_at` | if present and non-null, must be a valid RFC3339 timestamp; empty string is not valid |
| `id` | immutable; supplied by server only; client-supplied `id` on create is ignored |
| `created_at` | immutable; set by server at creation; client-supplied value is ignored |
| `updated_at` | set by server on creation and on every successful update; client-supplied value is ignored |

---

## notes

- there is no separate persistence schema; the same struct is used in-memory and
  serialized to JSON in API responses
- the Go struct lives at `internal/core/todo/todo.go`
- the id generation helper lives in the same package; it uses `crypto/rand` to produce
  an uppercase base-32 string that is lexicographically sortable in insertion order
  within the same millisecond (ULID-style, but a simplified implementation)
- `null` is the JSON representation of an absent `due_at`; the Go struct uses a pointer
  (`*time.Time`) to distinguish "not set" from zero time
