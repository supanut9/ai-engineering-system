# manual test checklist — hello-todo-nextjs v0.1.0

Run these steps against a locally running server before every release. Start the server
with `make dev` (development) or `make build && make start` (production build). Default
address: `http://localhost:3000`.

---

## 0. pre-flight

- [ ] `make setup` completes without error.
- [ ] `make test` passes (`PASS` for all test suites).
- [ ] `make lint` exits zero.
- [ ] `make build` succeeds (`.next/` directory produced).
- [ ] Server starts: `make start` (or `make dev`) prints a log line mentioning port 3000.

---

## 1. health check

```bash
curl -s http://localhost:3000/healthz
```

Expected: HTTP 200, body `{"status":"ok"}`.

- [ ] Status 200.
- [ ] Body matches exactly.

---

## 2. home page

```bash
curl -s http://localhost:3000/
```

Expected: HTTP 200, Content-Type includes `text/html`.

- [ ] Status 200.
- [ ] Response is HTML (contains `<html`).
- [ ] Page title or heading contains "Todos" (or equivalent).

---

## 3. create todo (happy path)

```bash
curl -s -X POST http://localhost:3000/api/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"buy milk"}'
```

Expected: HTTP 201, body contains `id` (32-char hex), `title:"buy milk"`,
`completed:false`, `due_at:null`, `created_at` and `updated_at` as ISO8601.

- [ ] Status 201.
- [ ] `id` is a 32-char hex string.
- [ ] `title` equals `"buy milk"`.
- [ ] `completed` is `false`.
- [ ] `due_at` is `null`.
- [ ] `created_at` and `updated_at` are valid ISO8601 strings.

---

## 4. create todo with due_at

```bash
curl -s -X POST http://localhost:3000/api/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"dentist appointment","due_at":"2026-12-31T09:00:00Z"}'
```

Expected: HTTP 201, `due_at` matches the provided value.

- [ ] Status 201.
- [ ] `due_at` is `"2026-12-31T09:00:00Z"` (or UTC equivalent).

---

## 5. create todo — validation errors

**5a. empty title:**

```bash
curl -s -X POST http://localhost:3000/api/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":""}'
```

Expected: HTTP 400, `{"error":{"code":"validation_error","message":"..."}}`.

- [ ] Status 400.
- [ ] `error.code` is `"validation_error"`.

**5b. whitespace-only title:**

```bash
curl -s -X POST http://localhost:3000/api/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"   "}'
```

Expected: HTTP 400, `error.code` is `"validation_error"`.

- [ ] Status 400.

**5c. title over 200 chars:**

```bash
curl -s -X POST http://localhost:3000/api/todos \
  -H 'Content-Type: application/json' \
  -d "{\"title\":\"$(python3 -c 'print("x"*201)')\"}"
```

Expected: HTTP 400.

- [ ] Status 400.

---

## 6. list todos

```bash
curl -s http://localhost:3000/api/todos
```

Expected: HTTP 200, `{"items":[...]}` containing all previously created todos.

- [ ] Status 200.
- [ ] `items` is an array.

---

## 7. get todo by id

Use an `id` from step 3.

```bash
curl -s http://localhost:3000/api/todos/<id>
```

Expected: HTTP 200, body matches the created todo.

- [ ] Status 200.
- [ ] `id` matches.

**unknown id:**

```bash
curl -s http://localhost:3000/api/todos/doesnotexist
```

Expected: HTTP 404, `error.code` is `"not_found"`.

- [ ] Status 404.
- [ ] `error.code` is `"not_found"`.

---

## 8. update todo (PATCH)

**8a. update title and completed:**

```bash
curl -s -X PATCH http://localhost:3000/api/todos/<id> \
  -H 'Content-Type: application/json' \
  -d '{"title":"buy oat milk","completed":true}'
```

Expected: HTTP 200, `title` updated, `completed:true`, `updated_at` is later than
`created_at`.

- [ ] Status 200.
- [ ] `title` is `"buy oat milk"`.
- [ ] `completed` is `true`.
- [ ] `updated_at` is after `created_at`.

**8b. clear due_at (null):**

```bash
curl -s -X PATCH http://localhost:3000/api/todos/<id-with-due-at> \
  -H 'Content-Type: application/json' \
  -d '{"due_at":null}'
```

Expected: HTTP 200, `due_at` is `null`.

- [ ] Status 200.
- [ ] `due_at` is `null`.

**8c. unknown id:**

```bash
curl -s -X PATCH http://localhost:3000/api/todos/ghost \
  -H 'Content-Type: application/json' \
  -d '{"title":"x"}'
```

Expected: HTTP 404.

- [ ] Status 404.

---

## 9. delete todo

```bash
curl -s -X DELETE http://localhost:3000/api/todos/<id>
```

Expected: HTTP 204, empty body.

- [ ] Status 204.
- [ ] Body is empty.

**confirm deletion:**

```bash
curl -s http://localhost:3000/api/todos/<id>
```

Expected: HTTP 404.

- [ ] Status 404.

**delete unknown id:**

```bash
curl -s -X DELETE http://localhost:3000/api/todos/ghost
```

Expected: HTTP 404.

- [ ] Status 404.

---

## 10. home page reflects todos

After creating at least one todo, visit `http://localhost:3000/` in a browser or with
curl.

```bash
curl -s http://localhost:3000/ | grep "buy oat milk"
```

Expected: the todo title appears in the HTML.

- [ ] Todo title is visible in the page HTML.

---

## 11. graceful shutdown

With the server running in production mode (`make start`), send `SIGTERM`:

```bash
kill -TERM <server-pid>
```

Expected: server logs a shutdown message and exits 0.

- [ ] Process exits cleanly.
