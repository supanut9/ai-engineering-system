# acceptance criteria — hello-todo-rust

Criteria are keyed to user stories in `../requirements/user-stories.md`.

---

## US-001: create a todo with a title

**Given** a POST request to `/v1/todos` with body `{"title":"Buy milk"}`
**When** the request is processed
**Then**

- response status is 201
- response body contains a todo object with:
  - `id`: non-empty string
  - `title`: `"Buy milk"`
  - `completed`: `false`
  - `due_at`: `null`
  - `created_at`: valid RFC3339 timestamp
  - `updated_at`: valid RFC3339 timestamp equal to `created_at`
- a subsequent `GET /v1/todos/{id}` with the returned id returns the same object

---

## US-002: create a todo with an optional due date

**Given** a POST request to `/v1/todos` with body
`{"title":"Call dentist","due_at":"2026-06-01T09:00:00Z"}`
**When** the request is processed
**Then**

- response status is 201
- `due_at` in the response equals `"2026-06-01T09:00:00Z"`
- all other fields follow the same rules as US-001

---

## US-003: list all todos

**Given** zero todos exist
**When** `GET /v1/todos` is called
**Then**

- status is 200
- body is `{"items":[]}`

**Given** two todos exist with ids `A` and `B`
**When** `GET /v1/todos` is called
**Then**

- status is 200
- `items` array contains exactly two elements, one with id `A` and one with id `B`
- order is not guaranteed

---

## US-004: get a single todo by id

**Given** a todo with id `abc` exists
**When** `GET /v1/todos/abc` is called
**Then**

- status is 200
- body is the complete todo object including all fields

**Given** no todo with id `xyz` exists
**When** `GET /v1/todos/xyz` is called
**Then**

- status is 404
- body is `{"error":{"code":"not_found","message":"todo not found"}}`

---

## US-005: update a todo's fields

**Given** a todo with id `abc` and `completed: false` exists
**When** `PATCH /v1/todos/abc` is called with body `{"completed":true}`
**Then**

- status is 200
- `completed` in the response is `true`
- `title` and `due_at` are unchanged
- `updated_at` is greater than or equal to the original `created_at`

**Given** a PATCH request supplies both `title` and `completed`
**When** the request is processed
**Then** both fields are updated and all other fields are unchanged

---

## US-006: delete a todo

**Given** a todo with id `abc` exists
**When** `DELETE /v1/todos/abc` is called
**Then**

- status is 204
- response body is empty
- a subsequent `GET /v1/todos/abc` returns 404

**Given** no todo with id `xyz` exists
**When** `DELETE /v1/todos/xyz` is called
**Then**

- status is 404
- body is `{"error":{"code":"not_found","message":"todo not found"}}`

---

## US-007: reject a todo with an empty or missing title

**Given** a POST request with body `{"title":""}`
**When** the request is processed
**Then**

- status is 400
- body is `{"error":{"code":"validation_error","message":"title is required"}}`

**Given** a POST request with body `{}` (no title key)
**When** the request is processed
**Then**

- status is 400
- same error shape as above

**Given** a POST request where `title` exceeds 200 characters
**When** the request is processed
**Then**

- status is 400
- `code` is `validation_error`
- `message` mentions max length

**Given** a PATCH request with body `{"title":""}`
**When** the request is processed
**Then**

- status is 400
- body is `{"error":{"code":"validation_error","message":"title must not be empty"}}`

---

## US-008: receive a 404 for operations on an unknown id

- `GET /v1/todos/{unknown}` → 404 with `not_found` error body
- `PATCH /v1/todos/{unknown}` → 404 with `not_found` error body
- `DELETE /v1/todos/{unknown}` → 404 with `not_found` error body

In all three cases, the response body shape is:

```json
{"error":{"code":"not_found","message":"todo not found"}}
```
