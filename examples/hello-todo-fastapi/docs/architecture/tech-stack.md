# tech stack — hello-todo-fastapi

| layer | choice | version | notes |
|---|---|---|---|
| language | Python | 3.12 | latest stable LTS; full typing support including PEP 695 generics |
| http framework | FastAPI | 0.136.1 | async-native; Pydantic v2 integration; automatic OpenAPI docs |
| asgi server | uvicorn[standard] | 0.47.0 | production-ready ASGI server; `[standard]` includes uvloop and httptools |
| validation | Pydantic | 2.13.4 | data validation and serialisation; v2 is significantly faster than v1 |
| settings | pydantic-settings | 2.14.1 | environment variable loading on top of Pydantic v2 |
| storage | in-memory dict | — | `dict[str, Todo]` guarded by `asyncio.Lock`; no external storage dependency |
| logging | `logging` stdlib | stdlib | structured-like JSON logging to stdout; no third-party logging library needed for this example |
| id generation | `secrets` stdlib | stdlib | `secrets.token_hex(16)` produces a 32-char hex string; no external library |
| http testing | `httpx` | 0.28.1 | used via FastAPI `TestClient`; HTTPX is the recommended async-aware test client for FastAPI |
| unit testing | `pytest` | 9.0.3 | standard Python test runner |
| async test mode | `pytest-asyncio` | 1.3.0 | enables `async def` test functions; configured with `asyncio_mode = "auto"` |
| linting / formatting | `ruff` | 0.15.13 | fast Python linter and formatter; replaces flake8 + isort + black |
| type checking | `mypy` | 2.1.0 | strict mode; enforced in CI |
| build backend | hatchling | — | used by `pyproject.toml`; no separate `setup.py` required |
| ci | GitHub Actions | — | see `.github/workflows/ci.yml`; runs ruff, mypy, pytest on every push and PR |

---

## notes

### pydantic v2 strict mode

`mypy` is run with `strict = true`. All function signatures and model fields must be
explicitly typed. The `mypy_path = "src"` setting tells mypy where to find the package.

### no external dependencies at runtime

All imports are from the Python standard library plus FastAPI, Pydantic, and uvicorn.
This keeps the dependency surface minimal and the example focused on architecture rather
than library choices.

### asyncio concurrency model

FastAPI is async by default. The in-memory repository uses `asyncio.Lock` rather than
`threading.Lock` because the event loop — not OS threads — is the concurrency primitive.
This is correct for `async def` route handlers running in the same event loop.

### future additions (out of scope for v0.1.0)

| capability | candidate | when |
|---|---|---|
| persistent storage | SQLAlchemy 2 async + asyncpg (Postgres) or aiosqlite (SQLite) | v0.2.0 |
| metrics | `prometheus_client` | when observability is required |
| distributed tracing | `opentelemetry-sdk` + `opentelemetry-instrumentation-fastapi` | when tracing is required |
| containerization | `Dockerfile` multi-stage build (Python base image) | when CI deploy is added |
| migrations | Alembic | when a persistent database is added |
