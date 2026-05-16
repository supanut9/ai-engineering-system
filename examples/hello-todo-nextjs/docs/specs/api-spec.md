# api specification — hello-todo-nextjs

REST contract. All endpoints are under the host/port configured via the `PORT` env var
(default `http://localhost:3000`).

Validation rules and edge cases are in `../specs/functional-spec.md`.
Acceptance criteria are in `../requirements/acceptance-criteria.md`.

---

## todo object schema

| field | type | notes |
|---|---|---|
| `id` | string | 32-char hex, server-assigned |
| `title` | string | non-empty, max 200 chars |
| `completed` | bool | defaults to `false` |
| `due_at` | string \| null | ISO8601, nullable |
| `created_at` | string | ISO8601, server-managed |
| `updated_at` | string | ISO8601, server-managed |

---

## endpoints

### POST /api/todos

| | |
|---|---|
| method | POST |
| path | `/api/todos` |
| content-type | `application/json` |
| request body | `{"title": string, "due_at"?: string}` |
| success response | 201 with Todo object |
| error responses | 400 `validation_error` |

**example:**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","due_at":"2026-06-01T09:00:00Z"}'
```

**response:**
```json
{
  "id": "a3f8e2d1c4b90712345678901234abcd",
  "title": "Buy milk",
  "completed": false,
  "due_at": "2026-06-01T09:00:00Z",
  "created_at": "2026-05-16T10:00:00.000Z",
  "updated_at": "2026-05-16T10:00:00.000Z"
}
```

---

### GET /api/todos

| | |
|---|---|
| method | GET |
| path | `/api/todos` |
| request body | none |
| success response | 200 with `{"items": Todo[]}` |
| error responses | none (empty list when store is empty) |

**example:**
```bash
curl http://localhost:3000/api/todos
```

**response:**
```json
{
  "items": [
    {
      "id": "a3f8e2d1c4b90712345678901234abcd",
      "title": "Buy milk",
      "completed": false,
      "due_at": "2026-06-01T09:00:00Z",
      "created_at": "2026-05-16T10:00:00.000Z",
      "updated_at": "2026-05-16T10:00:00.000Z"
    }
  ]
}
```

---

### GET /api/todos/:id

| | |
|---|---|
| method | GET |
| path | `/api/todos/[id]` |
| path param | `id` — opaque todo id |
| request body | none |
| success response | 200 with Todo object |
| error responses | 404 `not_found` |

**example:**
```bash
curl http://localhost:3000/api/todos/a3f8e2d1c4b90712345678901234abcd
```

---

### PATCH /api/todos/:id

| | |
|---|---|
| method | PATCH |
| path | `/api/todos/[id]` |
| content-type | `application/json` |
| request body | `{"title"?: string, "due_at"?: string\|null, "completed"?: bool}` |
| success response | 200 with updated Todo object |
| error responses | 400 `validation_error`, 404 `not_found` |

**example:**
```bash
curl -X PATCH http://localhost:3000/api/todos/a3f8e2d1c4b90712345678901234abcd \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

**response:**
```json
{
  "id": "a3f8e2d1c4b90712345678901234abcd",
  "title": "Buy milk",
  "completed": true,
  "due_at": "2026-06-01T09:00:00Z",
  "created_at": "2026-05-16T10:00:00.000Z",
  "updated_at": "2026-05-16T10:05:30.000Z"
}
```

---

### DELETE /api/todos/:id

| | |
|---|---|
| method | DELETE |
| path | `/api/todos/[id]` |
| request body | none |
| success response | 204 (no body) |
| error responses | 404 `not_found` |

**example:**
```bash
curl -X DELETE http://localhost:3000/api/todos/a3f8e2d1c4b90712345678901234abcd
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
curl http://localhost:3000/healthz
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
