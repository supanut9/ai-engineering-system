# functional specification — hello-todo-fastapi

Behavioral contract for each endpoint. Supplements the acceptance criteria in
`../requirements/acceptance-criteria.md`. L5 (implementation) must match this
exactly.

---

## common behavior

### content-type

All write requests (`POST`, `PATCH`) must include `Content-Type: application/json`.
Requests without this header, or with a body that is not valid JSON, return:
- status 422
- body `{"error":{"code":"validation_error","message":"request body must be valid JSON"}}`

### error envelope

Every non-2xx response body is:
```json
{"error":{"code":"<code>","message":"<human readable>"}}
```
Valid `code` values: `not_found`, `validation_error`, `internal`.

FastAPI raises `RequestValidationError` for Pydantic validation failures. A global
exception handler intercepts these and rewrites them to the uniform envelope above with
status 422.

### id format

Ids are 32-character hex strings generated server-side using `secrets.token_hex(16)`.
Callers must not infer ordering or structure from the id value.

---

## POST /v1/todos

### input

```json
{
  "title": "string, required, non-empty after trim, max 200 chars",
  "due_at": "string, optional, RFC3339 format"
}
```

### validation rules

- `title` must be present and non-empty after leading/trailing whitespace is trimmed.
  Whitespace-only strings (e.g., `"   "`) are rejected.
- `title` trimmed length must be ≤ 200 characters.
- `due_at`, if provided, must parse as a valid RFC3339 timestamp. An invalid format
  returns 422 with `validation_error`.
- Extra JSON fields not listed above are silently ignored (Pydantic `model_config`
  with `extra="ignore"`).

### success behavior

- server generates a unique opaque id via `secrets.token_hex(16)`
- `created_at` and `updated_at` are set to the current server UTC time
- `completed` defaults to `false`
- `due_at` is stored if valid, or `None` if omitted
- returns 201 with the full todo object

### error behavior

| condition | status | code |
|---|---|---|
| missing or empty title | 422 | `validation_error` |
| title exceeds 200 chars | 422 | `validation_error` |
| malformed JSON body | 422 | `validation_error` |
| invalid `due_at` format | 422 | `validation_error` |

---

## GET /v1/todos

### behavior

- returns all todos in the in-memory store
- returns empty `{"items":[]}` when no todos exist
- order of items is not guaranteed (dict iteration order, which is insertion order in
  Python 3.7+; this is an implementation detail, not a guarantee of the API contract)
- no pagination, filtering, or sorting in v0.1.0

### success behavior

- status 200
- body `{"items": [<Todo>, ...]}`

---

## GET /v1/todos/{id}

### behavior

- looks up the todo by exact id match
- id is taken from the URL path segment

### success behavior

- status 200, full todo object

### error behavior

| condition | status | code |
|---|---|---|
| id not found in store | 404 | `not_found` |

---

## PATCH /v1/todos/{id}

### input

```json
{
  "title":     "string, optional",
  "due_at":    "string (RFC3339) or null, optional",
  "completed": "bool, optional"
}
```

### behavior

- only fields present in the request body are updated (partial update semantics)
- fields absent from the body are left unchanged
- `id`, `created_at` are immutable and ignored if supplied
- `updated_at` is set to the current server UTC time on any successful update
- sending `due_at: null` explicitly clears the due date

The PATCH body uses a Pydantic model where all fields are `Optional` with a default
of `None`. A sentinel pattern distinguishes "field omitted" from "field sent as null"
for `due_at`.

### validation rules

- if `title` is supplied, same rules apply as POST: non-empty after trim, ≤ 200 chars
- if `due_at` is supplied as a string, it must be a valid RFC3339 datetime
- sending an empty body `{}` is accepted and returns the todo unchanged (idempotent)

### success behavior

- status 200, full updated todo object

### error behavior

| condition | status | code |
|---|---|---|
| id not found | 404 | `not_found` |
| empty title supplied | 422 | `validation_error` |
| title exceeds 200 chars | 422 | `validation_error` |
| malformed JSON | 422 | `validation_error` |
| invalid `due_at` format | 422 | `validation_error` |

---

## DELETE /v1/todos/{id}

### behavior

- removes the todo with the given id from the store
- operation is idempotent from the caller's perspective only when the id exists; a
  second DELETE on the same id returns 404

### success behavior

- status 204, empty body

### error behavior

| condition | status | code |
|---|---|---|
| id not found | 404 | `not_found` |

---

## GET /healthz

### behavior

- does not check storage health (in-memory; always available while process is running)
- returns immediately; no dependencies to probe

### success behavior

- status 200
- body `{"status":"ok"}`

---

## edge cases summary

| scenario | expected behavior |
|---|---|
| whitespace-only title on create | 422 validation_error |
| title of exactly 200 chars | 201 accepted |
| title of 201 chars | 422 validation_error |
| `due_at` as empty string | 422 validation_error |
| PATCH with `{}` empty body | 200, todo unchanged |
| PATCH `due_at: null` | 200, `due_at` cleared to null |
| unknown id in any mutating endpoint | 404 not_found |
| completely unknown route | 404 (FastAPI default) |
