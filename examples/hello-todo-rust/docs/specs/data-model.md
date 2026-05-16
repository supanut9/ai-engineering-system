# data model — hello-todo-rust

This document describes the logical data model for `hello-todo-rust`. The in-memory
store (`HashMap<String, Todo>` guarded by `tokio::sync::RwLock`) is an implementation
detail and is not part of the model.

---

## entity: Todo

| field | type | required | default | notes |
|---|---|---|---|---|
| `id` | string | yes (server-assigned) | — | opaque identifier; generated at creation time via `uuid::Uuid::new_v4().simple()`; callers must treat as opaque |
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
  serialized to JSON in API responses via `serde`
- the Rust struct lives at `src/core/todo/entity.rs`
- id generation uses `uuid::Uuid::new_v4().simple().to_string()` which produces a
  32-character lowercase hex string; this is globally unique but not time-ordered
  (see `docs/maintenance/known-issues.md` for upgrade path to UUIDv7 or ULID)
- `null` is the JSON representation of an absent `due_at`; the Rust struct uses
  `Option<DateTime<Utc>>` to distinguish "not set" from a zero timestamp
- `serde` field attributes use `#[serde(skip_serializing_if = "Option::is_none")]`
  is not used here — `due_at` is always serialized (as `null` when absent) to keep
  the response shape consistent for API consumers
