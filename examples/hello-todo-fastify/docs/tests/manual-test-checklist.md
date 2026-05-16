# Manual Test Checklist — hello-todo-fastify v0.1.0

Run these steps against a locally running server before every release. Start the server
with `make run` (or `make build && node dist/index.js`). Default address:
`http://localhost:8080`.

---

## 0. Pre-flight

- [ ] `make setup` completes without error.
- [ ] `make test` passes (all Vitest tests green).
- [ ] `make lint` produces no output (no type errors).
- [ ] `make build` produces `dist/index.js`.
- [ ] Server starts: `node dist/index.js` prints a JSON log line with `"msg":"Server listening at http://0.0.0.0:8080"` (or equivalent pino startup log).

---

## 1. Health check

```bash
curl -s http://localhost:8080/healthz
```

Expected: HTTP 200, body `{"status":"ok"}`.

- [ ] Status 200.
- [ ] Body matches exactly.

---

## 2. Create todo (happy path)

```bash
curl -s -X POST http://localhost:8080/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"buy milk"}'
```

Expected: HTTP 201, body contains `id` (UUID v4), `title:"buy milk"`,
`completed:false`, `due_at:null`, `created_at` and `updated_at` as RFC3339.

- [ ] Status 201.
- [ ] `id` is a non-empty UUID v4 string.
- [ ] `title` equals `"buy milk"`.
- [ ] `completed` is `false`.
- [ ] `due_at` is `null`.
- [ ] `created_at` and `updated_at` are valid RFC3339 strings.

---

## 3. Create todo with due_at

```bash
curl -s -X POST http://localhost:8080/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"dentist appointment","due_at":"2026-12-31T09:00:00Z"}'
```

Expected: HTTP 201, `due_at` matches the provided value.

- [ ] Status 201.
- [ ] `due_at` is `"2026-12-31T09:00:00Z"`.

---

## 4. Create todo — validation errors

**4a. Empty title:**

```bash
curl -s -X POST http://localhost:8080/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":""}'
```

Expected: HTTP 400, `{"error":{"code":"validation_error","message":"..."}}`.

- [ ] Status 400.
- [ ] `error.code` is `"validation_error"`.

**4b. Whitespace-only title:**

```bash
curl -s -X POST http://localhost:8080/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"   "}'
```

Expected: HTTP 400, `error.code` is `"validation_error"`.

- [ ] Status 400.

**4c. Title over 200 chars:**

```bash
curl -s -X POST http://localhost:8080/v1/todos \
  -H 'Content-Type: application/json' \
  -d "{\"title\":\"$(python3 -c 'print("x"*201)')\"}"
```

Expected: HTTP 400.

- [ ] Status 400.

---

## 5. List todos

```bash
curl -s http://localhost:8080/v1/todos
```

Expected: HTTP 200, `{"items":[...]}` containing all previously created todos.

- [ ] Status 200.
- [ ] `items` is an array.
- [ ] Previously created todos are present.

---

## 6. Get todo by id

Use an `id` from step 2.

```bash
curl -s http://localhost:8080/v1/todos/<id>
```

Expected: HTTP 200, body matches the created todo.

- [ ] Status 200.
- [ ] `id` matches.

**Unknown id:**

```bash
curl -s http://localhost:8080/v1/todos/doesnotexist
```

Expected: HTTP 404, `error.code` is `"not_found"`.

- [ ] Status 404.
- [ ] `error.code` is `"not_found"`.

---

## 7. Update todo (PATCH)

**7a. Update title and completed:**

```bash
curl -s -X PATCH http://localhost:8080/v1/todos/<id> \
  -H 'Content-Type: application/json' \
  -d '{"title":"buy oat milk","completed":true}'
```

Expected: HTTP 200, `title` updated, `completed:true`, `updated_at` is later than or
equal to `created_at`.

- [ ] Status 200.
- [ ] `title` is `"buy oat milk"`.
- [ ] `completed` is `true`.
- [ ] `updated_at` is after or equal to `created_at`.

**7b. Clear due_at (null):**

```bash
curl -s -X PATCH http://localhost:8080/v1/todos/<id-with-due-at> \
  -H 'Content-Type: application/json' \
  -d '{"due_at":null}'
```

Expected: HTTP 200, `due_at` is `null`.

- [ ] Status 200.
- [ ] `due_at` is `null`.

**7c. Unknown id:**

```bash
curl -s -X PATCH http://localhost:8080/v1/todos/ghost \
  -H 'Content-Type: application/json' \
  -d '{"title":"x"}'
```

Expected: HTTP 404.

- [ ] Status 404.

---

## 8. Delete todo

```bash
curl -s -X DELETE http://localhost:8080/v1/todos/<id>
```

Expected: HTTP 204, empty body.

- [ ] Status 204.
- [ ] Body is empty.

**Confirm deletion:**

```bash
curl -s http://localhost:8080/v1/todos/<id>
```

Expected: HTTP 404.

- [ ] Status 404.

**Delete unknown id:**

```bash
curl -s -X DELETE http://localhost:8080/v1/todos/ghost
```

Expected: HTTP 404.

- [ ] Status 404.

---

## 9. Graceful shutdown

With the server running, send `SIGTERM`:

```bash
kill -TERM <server-pid>
```

Expected: server logs a shutdown message and exits 0.

- [ ] Server logs shutdown.
- [ ] Process exits cleanly (exit code 0).
