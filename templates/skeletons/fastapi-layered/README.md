# My Service

A FastAPI service using layered architecture.

## Quickstart

```bash
# 1. Rename the package
#    Replace every occurrence of "my_service" / "my-service" with your package name.

# 2. Install dependencies (uv preferred)
make setup

# 3. Run the server (defaults to port 8000, override with PORT env var)
make run

# 4. Run tests
make test

# 5. Lint
make lint

# 6. Format
make fmt

# 7. Type-check
make typecheck
```

## Endpoints

| Method | Path      | Description  |
|--------|-----------|--------------|
| GET    | /healthz  | Health check |

## Architecture

This skeleton uses **layered architecture**:

- `src/my_service/main.py` — FastAPI app construction and router registration
- `src/my_service/api/` — APIRouter modules; one file per resource or domain area
- `src/my_service/services/` — application and business logic; no HTTP types here
- `src/my_service/repositories/` — persistence access; add when a database is introduced
- `src/my_service/models/` — Pydantic BaseModel definitions
- `src/my_service/config/settings.py` — pydantic-settings BaseSettings
- `src/my_service/deps/` — FastAPI Depends factories

## Development

Keep FastAPI at the HTTP edge only. Keep route handlers thin. Place business
logic in `services/`. Inject dependencies downward only; no layer imports from
a layer above it.
