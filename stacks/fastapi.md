# FastAPI

## When to Use

Use FastAPI when:

- you are building a Python HTTP service and want OpenAPI documentation
  generated automatically from type annotations
- the team values fast iteration with strong runtime validation via Pydantic
- the service has async workloads such as database queries, HTTP fan-out, or
  event handling
- you need a modern, well-documented framework with a growing ecosystem

FastAPI is the default Python HTTP framework in this system. See `stacks/python.md`
for the full toolchain.

Prefer NestJS or Go-Gin for teams that operate primarily in TypeScript or Go.

## Default Dependencies

| Package | Version | Role |
|---|---|---|
| fastapi | 0.136.1 | HTTP framework, routing, OpenAPI |
| uvicorn[standard] | 0.47.0 | ASGI server (includes uvloop, httptools) |
| pydantic | 2.13.4 | request/response validation |
| pydantic-settings | 2.14.1 | settings from environment |
| httpx | 0.28.1 | HTTP client; also powers TestClient |

## App Shape

Compose the FastAPI application in `main.py`. Register routers from `api/`
as isolated `APIRouter` instances, then include them in the app with a prefix.

```python
# src/my_service/main.py
from fastapi import FastAPI
from my_service.api.health import router as health_router

app = FastAPI(title="my-service")
app.include_router(health_router)
```

```python
# src/my_service/api/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/healthz")
async def health() -> dict[str, str]:
    return {"status": "ok"}
```

Router grouping rules:

- one file per resource or domain area under `api/`
- register a `prefix` and `tags` when including non-trivial routers
- keep route functions thin — delegate all logic to `services/`

Exception handlers belong in `main.py` or a dedicated `api/errors.py`. Use
`@app.exception_handler(ExceptionType)` to map domain exceptions to HTTP
responses.

## Validation

Use Pydantic v2 `BaseModel` for all request bodies and response schemas.

```python
from pydantic import BaseModel, field_validator

class CreateItemRequest(BaseModel):
    name: str
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("quantity must be positive")
        return v

class ItemResponse(BaseModel):
    id: str
    name: str
    quantity: int
```

Declare the response model in the route decorator (`response_model=ItemResponse`)
so FastAPI validates and serializes output automatically.

Never use `dict` as a response type in production routes — always use a typed
`BaseModel`.

## Async vs Sync

Use `async def` for route handlers that perform I/O: database queries, outbound
HTTP calls, file reads, cache lookups.

Use plain `def` for CPU-bound or purely in-memory handlers. FastAPI runs `def`
handlers in a thread pool automatically, so they do not block the event loop.

Do not mix `async` and sync blocking calls:

- never call `time.sleep()` or blocking DB drivers inside `async def`
- use `asyncio.to_thread()` for blocking third-party libraries if necessary
- use async-native drivers: `asyncpg`, `motor`, `aioredis`

## Database

For PostgreSQL, use SQLAlchemy 2 async mode with `asyncpg` as the driver.

```toml
# runtime deps to add
sqlalchemy[asyncio]>=2.0
asyncpg>=0.30
alembic>=1.15
```

Key patterns:

- create the engine once at startup via `AsyncEngine`
- manage sessions through a `get_session` dependency in `deps/`
- keep SQL in the repository layer only; services receive domain objects
- run migrations with Alembic: `alembic upgrade head`

The skeleton does not include database wiring. Add it when the service has a
real persistence requirement.

## Authentication

The skeleton has no auth. For OIDC-based authentication, use `authlib` with
FastAPI's `Depends` for token introspection or JWT validation.

```toml
authlib>=1.5
```

General pattern:

- define a `get_current_user` dependency in `deps/auth.py`
- inject it with `Depends(get_current_user)` on protected routes
- keep auth logic in `deps/`; never scatter it across route handlers

For session-based auth, `itsdangerous` or a dedicated session middleware works
well with FastAPI.

Refer to `authlib` documentation for OIDC discovery, token verification, and
PKCE flows.

## Testing

Use FastAPI's `TestClient` for synchronous integration tests. It wraps httpx
and exercises the full middleware and routing stack.

```python
from fastapi.testclient import TestClient
from my_service.main import app

client = TestClient(app)

def test_health() -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

For async tests that need the real event loop (e.g., testing async database
calls), use `httpx.AsyncClient` with `pytest-asyncio`.

Test rules:

- one test file per router or service module
- test success paths and error paths for every route
- mock external services at the dependency layer using `app.dependency_overrides`
- keep test fixtures in `conftest.py`

## Deployment

Development:

```bash
uvicorn my_service.main:app --reload --port 8000
```

Production (single process):

```bash
uvicorn my_service.main:app --host 0.0.0.0 --port 8000
```

Production (multi-worker via Gunicorn):

```bash
gunicorn my_service.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

Use Gunicorn as the process manager for multi-core production deployments.
Set worker count to `(2 * CPU_cores) + 1` as a starting point, then tune.

Container: expose port 8000, run as a non-root user, copy only `src/` and
`pyproject.toml` into the image, install without dev extras.

## Common Pitfalls

- importing `app` at module level in multiple places causes duplicate
  startup/shutdown event handlers — create the app once in `main.py`
- using mutable default arguments in Pydantic models — always use `default_factory`
- forgetting `asyncio_mode = "auto"` in `pytest.ini_options` when using async tests,
  leading to coroutine objects being returned rather than awaited
- returning raw `dict` from routes bypasses `response_model` validation and
  breaks clients that depend on the schema
- global dependency state (e.g., a DB engine as a module-level variable)
  makes testing hard — use FastAPI's `app.state` or lifespan context

## See Also

- `stacks/python.md` — Python toolchain, layout conventions, and mypy setup
- `project-templates/python/fastapi-layered.md` — layered project blueprint
- `templates/skeletons/fastapi-layered/` — runnable starter skeleton
- FastAPI docs: https://fastapi.tiangolo.com
- Pydantic v2 docs: https://docs.pydantic.dev/latest
