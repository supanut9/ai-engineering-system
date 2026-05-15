# Manual Test Checklist — hello-todo-fastapi v0.1.0

Run these steps against a locally running server before every release. Start the server with `make run`. Default address: `http://localhost:8000`.

---

## 0. Pre-flight

- [ ] `make setup` completes without error.
- [ ] `make test` passes (`pytest` reports all passed).
- [ ] `make lint` exits zero (no ruff findings, no format issues).
- [ ] `make typecheck` exits zero (mypy strict, no errors).
- [ ] Server starts: `make run` prints a log line with `"message":"server starting"`.

---

## 1. Health check

```bash
curl -s http://localhost:8000/healthz
```

Expected: HTTP 200, body `{"status":"ok"}`.

- [ ] Status 200.
- [ ] Body matches exactly.

---

## 2. Create todo (happy path)

```bash
curl -s -X POST http://localhost:8000/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"buy milk"}'
```

Expected: HTTP 201, body contains `id` (32-char hex), `title:"buy milk"`, `completed:false`, `due_at:null`, `created_at` and `updated_at` as RFC3339.

- [ ] Status 201.
- [ ] `id` is a 32-char hex string.
- [ ] `title` equals `"buy milk"`.
- [ ] `completed` is `false`.
- [ ] `due_at` is `null`.
- [ ] `created_at` and `updated_at` are valid RFC3339 strings.

---

## 3. Create todo with due_at

```bash
curl -s -X POST http://localhost:8000/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"dentist appointment","due_at":"2026-12-31T09:00:00Z"}'
```

Expected: HTTP 201, `due_at` matches the provided value.

- [ ] Status 201.
- [ ] `due_at` is `"2026-12-31T09:00:00Z"` (or UTC equivalent).

---

## 4. Create todo — validation errors

**4a. Empty title:**

```bash
curl -s -X POST http://localhost:8000/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":""}'
```

Expected: HTTP 422, `{"error":{"code":"validation_error","message":"..."}}`.

- [ ] Status 422.
- [ ] `error.code` is `"validation_error"`.
- [ ] Body has top-level `"error"` key, not `"detail"`.

**4b. Whitespace-only title:**

```bash
curl -s -X POST http://localhost:8000/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"   "}'
```

Expected: HTTP 422, `error.code` is `"validation_error"`.

- [ ] Status 422.

**4c. Title over 200 chars:**

```bash
curl -s -X POST http://localhost:8000/v1/todos \
  -H 'Content-Type: application/json' \
  -d "{\"title\":\"$(python3 -c 'print("x"*201)')\"}"
```

Expected: HTTP 422.

- [ ] Status 422.

---

## 5. List todos

```bash
curl -s http://localhost:8000/v1/todos
```

Expected: HTTP 200, `{"items":[...]}` containing all previously created todos.

- [ ] Status 200.
- [ ] `items` is an array.

---

## 6. Get todo by id

Use an `id` from step 2.

```bash
curl -s http://localhost:8000/v1/todos/<id>
```

Expected: HTTP 200, body matches the created todo.

- [ ] Status 200.
- [ ] `id` matches.

**Unknown id:**

```bash
curl -s http://localhost:8000/v1/todos/doesnotexist
```

Expected: HTTP 404, `error.code` is `"not_found"`.

- [ ] Status 404.
- [ ] `error.code` is `"not_found"`.

---

## 7. Update todo (PATCH)

**7a. Update title and completed:**

```bash
curl -s -X PATCH http://localhost:8000/v1/todos/<id> \
  -H 'Content-Type: application/json' \
  -d '{"title":"buy oat milk","completed":true}'
```

Expected: HTTP 200, `title` updated, `completed:true`, `updated_at` is later than or equal to `created_at`.

- [ ] Status 200.
- [ ] `title` is `"buy oat milk"`.
- [ ] `completed` is `true`.

**7b. Clear due_at (null):**

```bash
curl -s -X PATCH http://localhost:8000/v1/todos/<id-with-due-at> \
  -H 'Content-Type: application/json' \
  -d '{"due_at":null}'
```

Expected: HTTP 200, `due_at` is `null`.

- [ ] Status 200.
- [ ] `due_at` is `null`.

**7c. Unknown id:**

```bash
curl -s -X PATCH http://localhost:8000/v1/todos/ghost \
  -H 'Content-Type: application/json' \
  -d '{"title":"x"}'
```

Expected: HTTP 404.

- [ ] Status 404.

---

## 8. Delete todo

```bash
curl -s -X DELETE http://localhost:8000/v1/todos/<id>
```

Expected: HTTP 204, empty body.

- [ ] Status 204.
- [ ] Body is empty.

**Confirm deletion:**

```bash
curl -s http://localhost:8000/v1/todos/<id>
```

Expected: HTTP 404.

- [ ] Status 404.

**Delete unknown id:**

```bash
curl -s -X DELETE http://localhost:8000/v1/todos/ghost
```

Expected: HTTP 404.

- [ ] Status 404.

---

## 9. OpenAPI docs (bonus)

```bash
curl -s http://localhost:8000/docs
```

Expected: HTML page with Swagger UI (FastAPI default).

- [ ] Page loads without error (status 200).
