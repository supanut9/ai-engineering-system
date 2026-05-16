# Manual Test Checklist — hello-todo-rust v0.1.0

Run these steps against a locally running server before every release. Start the server with `make run` (or `make build && ./target/release/my-service`). Default address: `http://localhost:8080`.

---

## 0. Pre-flight

- [ ] `make setup` completes without error.
- [ ] `make test` passes (`test result: ok` for all packages).
- [ ] `make clippy` produces no output (no warnings treated as errors).
- [ ] `make fmt` produces no diff output.
- [ ] `make build` produces `target/release/my-service`.
- [ ] Server starts: `./target/release/my-service` prints a JSON log line with `"msg":"server starting"`.

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

Expected: HTTP 201, body contains `id` (32-char lowercase hex), `title:"buy milk"`, `completed:false`, `due_at:null`, `created_at` and `updated_at` as RFC3339.

- [ ] Status 201.
- [ ] `id` is a 32-char lowercase hex string.
- [ ] `title` equals `"buy milk"`.
- [ ] `completed` is `false`.
- [ ] `due_at` is `null`.
- [ ] `created_at` and `updated_at` are valid RFC3339 strings.

---

## 3. Create todo with due\_at

```bash
curl -s -X POST http://localhost:8080/v1/todos \
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

Expected: HTTP 200, `{"items":[...]}` containing all previously created todos in insertion order.

- [ ] Status 200.
- [ ] `items` is an array.
- [ ] Items appear in the order they were created.

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

Expected: HTTP 200, `title` updated, `completed:true`, `updated_at` is later than or equal to `created_at`.

- [ ] Status 200.
- [ ] `title` is `"buy oat milk"`.
- [ ] `completed` is `true`.
- [ ] `updated_at` is after or equal to `created_at`.

**7b. Clear due\_at (null):**

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

Expected: server logs `"msg":"shutting down"` then `"msg":"server stopped"`, exits 0.

- [ ] Server logs shutdown messages.
- [ ] Process exits cleanly.
