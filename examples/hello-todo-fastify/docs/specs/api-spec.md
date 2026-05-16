# api specification — hello-todo-fastify

REST contract. All endpoints are under the host/port configured via the `PORT` env var
(default `http://localhost:8080`).

Validation rules and edge cases are in `../specs/functional-spec.md`.
Acceptance criteria are in `../requirements/acceptance-criteria.md`.

---

## todo object schema

| field | type | notes |
|---|---|---|
| `id` | string | opaque UUID v4, server-assigned |
| `title` | string | non-empty, max 200 chars |
| `completed` | bool | defaults to `false` |
| `due_at` | string \| null | RFC3339, nullable |
| `created_at` | string | RFC3339, server-managed |
| `updated_at` | string | RFC3339, server-managed |

---

## endpoints

### POST /v1/todos

| | |
|---|---|
| method | POST |
| path | `/v1/todos` |
| content-type | `application/json` |
| request body | `{"title": string, "due_at"?: string}` |
| success response | 201 with Todo object |
| error responses | 400 `validation_error` |

**example:**
```bash
curl -X POST http://localhost:8080/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","due_at":"2026-06-01T09:00:00Z"}'
```

**response:**
```json
{
  "id": "a3f1c2d4-e5b6-7890-abcd-ef1234567890",
  "title": "Buy milk",
  "completed": false,
  "due_at": "2026-06-01T09:00:00Z",
  "created_at": "2026-05-16T10:00:00Z",
  "updated_at": "2026-05-16T10:00:00Z"
}
```

---

### GET /v1/todos

| | |
|---|---|
| method | GET |
| path | `/v1/todos` |
| request body | none |
| success response | 200 with `{"items": Todo[]}` |
| error responses | none (empty list when store is empty) |

**example:**
```bash
curl http://localhost:8080/v1/todos
```

**response:**
```json
{
  "items": [
    {
      "id": "a3f1c2d4-e5b6-7890-abcd-ef1234567890",
      "title": "Buy milk",
      "completed": false,
      "due_at": "2026-06-01T09:00:00Z",
      "created_at": "2026-05-16T10:00:00Z",
      "updated_at": "2026-05-16T10:00:00Z"
    }
  ]
}
```

---

### GET /v1/todos/{id}

| | |
|---|---|
| method | GET |
| path | `/v1/todos/{id}` |
| path param | `id` — opaque todo id |
| request body | none |
| success response | 200 with Todo object |
| error responses | 404 `not_found` |

**example:**
```bash
curl http://localhost:8080/v1/todos/a3f1c2d4-e5b6-7890-abcd-ef1234567890
```

---

### PATCH /v1/todos/{id}

| | |
|---|---|
| method | PATCH |
| path | `/v1/todos/{id}` |
| content-type | `application/json` |
| request body | `{"title"?: string, "due_at"?: string\|null, "completed"?: bool}` |
| success response | 200 with updated Todo object |
| error responses | 400 `validation_error`, 404 `not_found` |

**example:**
```bash
curl -X PATCH http://localhost:8080/v1/todos/a3f1c2d4-e5b6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

**response:**
```json
{
  "id": "a3f1c2d4-e5b6-7890-abcd-ef1234567890",
  "title": "Buy milk",
  "completed": true,
  "due_at": "2026-06-01T09:00:00Z",
  "created_at": "2026-05-16T10:00:00Z",
  "updated_at": "2026-05-16T10:05:30Z"
}
```

---

### DELETE /v1/todos/{id}

| | |
|---|---|
| method | DELETE |
| path | `/v1/todos/{id}` |
| request body | none |
| success response | 204 (no body) |
| error responses | 404 `not_found` |

**example:**
```bash
curl -X DELETE http://localhost:8080/v1/todos/a3f1c2d4-e5b6-7890-abcd-ef1234567890
```

---

### GET /healthz

| | |
|---|---|
| method | GET |
| path | `/healthz` |
| request body | none |
| success response | 200 with `{"status":"ok"}` |
| error responses | none |

**example:**
```bash
curl http://localhost:8080/healthz
```

**response:**
```json
{"status":"ok"}
```

---

## error response schema

All non-2xx responses use:
```json
{
  "error": {
    "code": "not_found | validation_error | internal",
    "message": "human-readable description"
  }
}
```
