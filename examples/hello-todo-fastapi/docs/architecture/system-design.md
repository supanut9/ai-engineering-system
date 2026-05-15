# system design — hello-todo-fastapi

References: `../requirements/prd.md` (success criteria), `../specs/functional-spec.md`
(behavioral contract), `decisions/0001-python-fastapi-layered.md` (architectural choice).

---

## context

`hello-todo-fastapi` is a single-process HTTP API that stores todo items in memory. Its
primary purpose is to be a readable, self-contained reference example; simplicity
is a first-class constraint alongside correctness. There are no external dependencies
at runtime (no database, no cache, no message queue).

---

## layered architecture overview

```
                        ┌─────────────────────────────┐
                        │       HTTP (FastAPI router)  │
                        │   api/todos.py               │
                        │   api/health.py              │
                        └────────────┬────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │       Service Layer          │
                        │   services/todo.py           │
                        └────────────┬────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │     Repository Layer         │
                        │   repositories/memory.py     │
                        │   (implements Protocol)      │
                        └────────────┬────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │        Models Layer          │
                        │   models/todo.py             │
                        └─────────────────────────────┘
```

---

## components

### src/hello_todo_fastapi/main.py — application factory

Creates the FastAPI app, registers routers, wires the repository and service as
application-level state (via `app.state`), and installs the global exception handler
that maps `RequestValidationError` and `TodoNotFoundError` to the uniform error envelope.

### src/hello_todo_fastapi/api/

- `health.py` — `GET /healthz` router
- `todos.py` — APIRouter for all five todo endpoints; each handler calls the service,
  then returns the appropriate HTTP response

Handlers are thin: no business logic lives here. Each handler calls one service method,
maps the result to a Pydantic response model, and returns it with the correct status code.

### src/hello_todo_fastapi/services/todo.py

`TodoService` class containing all business logic:
- title trim and validation
- id generation via `secrets.token_hex(16)`
- `created_at` / `updated_at` stamping
- partial-update semantics for PATCH
- `TodoNotFoundError` propagation from the repository

The service depends on the `TodoRepository` Protocol (defined in `repositories/memory.py`),
not on the concrete `MemoryTodoRepository`. This preserves the ability to swap adapters
without changing the service.

### src/hello_todo_fastapi/repositories/memory.py

`TodoRepository` Protocol and `MemoryTodoRepository` class. The repository holds
a `dict[str, Todo]` guarded by `asyncio.Lock`. All methods are `async` so they compose
correctly with FastAPI's async request handlers.

Methods: `save`, `find_all`, `find_by_id`, `delete`. `find_by_id` and `delete` raise
`TodoNotFoundError` when the id is absent.

### src/hello_todo_fastapi/models/todo.py

Pydantic v2 `BaseModel` definitions:
- `Todo` — entity stored in the repository
- `CreateTodoRequest` — POST body
- `PatchTodoRequest` — PATCH body (all fields optional; sentinel for `due_at`)
- `TodoResponse` — serialised shape in responses
- `TodoListResponse` — `{"items": [TodoResponse]}`

### src/hello_todo_fastapi/config/settings.py

`Settings` class (pydantic-settings `BaseSettings`). Reads `PORT` and `LOG_LEVEL`
from environment variables or `.env` file.

### src/hello_todo_fastapi/errors/api_error.py

`TodoNotFoundError` exception and the `ErrorEnvelope` Pydantic model used in error
responses. The global exception handler registered in `main.py` catches
`RequestValidationError` (Pydantic) and `TodoNotFoundError` and rewrites them as
`{"error": {"code": "...", "message": "..."}}` JSON responses.

---

## data flow

```
Request → FastAPI router → handler (api/)
       → TodoService (services/)
       → MemoryTodoRepository (repositories/)
       → return value → handler → Pydantic response model → JSON response
```

Error flow: repository raises `TodoNotFoundError`; service propagates it; global handler
maps it to 404 + error JSON envelope. `RequestValidationError` from Pydantic is mapped
to 422 + error envelope before reaching any handler.

---

## key tradeoffs

| tradeoff | choice | rationale |
|---|---|---|
| simplicity vs persistence | in-memory only | keeps the example readable; persistence is out of scope for v0.1.0 |
| layered vs hexagonal | layered | fewer files; sufficient for teaching dependency direction; hexagonal is demonstrated in `hello-todo-go` |
| FastAPI vs Flask/Django | FastAPI | native async; Pydantic integration; automatic OpenAPI docs; modern and widely adopted |
| asyncio.Lock vs threading.Lock | asyncio.Lock | FastAPI is async; asyncio.Lock is the correct primitive for an async context |
| secrets.token_hex vs uuid4 | secrets.token_hex(16) | 32-char hex matching the Go example; no extra library |
| logging vs structlog | logging stdlib | zero extra dependency; sufficient for an example |

---

## deployment shape

Single Python process. Start with:
```bash
uvicorn hello_todo_fastapi.main:app --host 0.0.0.0 --port 8000
```

No containerization required for local development. The process is self-contained; there
is no database to migrate, no secret manager to connect to, no sidecar required.

---

## observability

- **logging:** `logging` stdlib to stdout with a simple JSON formatter. Log level
  controlled by `LOG_LEVEL` env var (default: `INFO`).
- **health check:** `GET /healthz` returns `{"status":"ok"}` while the process is alive.
- **automatic OpenAPI docs:** FastAPI generates Swagger UI at `/docs` and ReDoc at
  `/redoc` by default (useful during development; can be disabled in production).
- **metrics:** out of scope for v0.1.0.
- **tracing:** out of scope for v0.1.0.
