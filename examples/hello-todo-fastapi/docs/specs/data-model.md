# data model — hello-todo-fastapi

This document describes the logical data model for `hello-todo-fastapi`. The in-memory
store (`dict[str, Todo]` guarded by `asyncio.Lock`) is an implementation detail
and is not part of the model.

---

## entity: Todo

| field | type | required | default | notes |
|---|---|---|---|---|
| `id` | string | yes (server-assigned) | — | opaque identifier; generated at creation time using `secrets.token_hex(16)`; callers must treat as opaque |
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
| `due_at` | if present and non-null, must be a valid RFC3339 datetime; empty string is not valid |
| `id` | immutable; supplied by server only; client-supplied `id` on create is ignored |
| `created_at` | immutable; set by server at creation; client-supplied value is ignored |
| `updated_at` | set by server on creation and on every successful update; client-supplied value is ignored |

---

## Pydantic models

The data layer uses Pydantic v2 `BaseModel` classes. The entity model lives at
`src/hello_todo_fastapi/models/todo.py`. Request and response DTOs are separate models
defined in the same file to keep the API contract explicit.

```
Todo              — core entity stored in the repository
CreateTodoRequest — body for POST /v1/todos (title required, due_at optional)
PatchTodoRequest  — body for PATCH /v1/todos/{id} (all fields optional)
TodoResponse      — serialised shape returned in API responses
TodoListResponse  — wrapper {"items": [TodoResponse]}
```

---

## notes

- there is no separate persistence schema; the same `Todo` model is used in-memory and
  serialised to JSON in API responses
- the `id` is a 32-character lowercase hex string (16 bytes from `secrets.token_hex(16)`)
- `null` is the JSON representation of an absent `due_at`; the Python model uses
  `Optional[datetime]` to distinguish "not set" from any datetime value
- Pydantic serialises `datetime` objects to RFC3339 strings automatically
- the `PatchTodoRequest` model uses a sentinel pattern: a field absent from the JSON
  body remains at its Python default of `None`; `due_at` is modelled as
  `Optional[Optional[datetime]]` (i.e. `datetime | None | _UNSET`) to distinguish
  "omitted" from "explicitly set to null"
