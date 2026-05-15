# FastAPI Layered

## Use When

Use this blueprint when:

- the stack is Python
- the HTTP framework is FastAPI
- the code architecture is layered
- the service is a single self-contained service

## Stack

- language: Python 3.12+
- HTTP framework: FastAPI 0.136.1
- ASGI server: uvicorn[standard] 0.47.0
- validation: Pydantic 2.13.4 + pydantic-settings 2.14.1
- default database: none in skeleton; add SQLAlchemy 2 + asyncpg when needed
- default queue/cache: none in skeleton; add when needed

## Code Architecture

Layered architecture with four layers:

1. **routes** (`api/`) — FastAPI routers; thin handlers that call into services
2. **services** (`services/`) — application and business logic
3. **repositories** (`repositories/`) — persistence access; none in skeleton
4. **data** (`models/`) — Pydantic models and domain types

Dependencies flow strictly downward: routes call services, services call
repositories. No layer imports from a layer above it.

## Bootstrap

```bash
# preferred — fast resolver
uv venv
uv pip install -e .[dev]

# fallback — stdlib venv
python -m venv .venv
.venv/bin/pip install -e .[dev]
```

Run the server:

```bash
uvicorn my_service.main:app --reload
```

Run tests:

```bash
pytest
```

## Folder Structure

```text
pyproject.toml
ruff.toml
Makefile
README.md
src/
  my_service/
    __init__.py
    main.py
    api/
      __init__.py
      health.py
    services/
      __init__.py
      health.py
    repositories/
      __init__.py
    models/
      __init__.py
    config/
      __init__.py
      settings.py
    deps/
      __init__.py
tests/
  __init__.py
  test_health.py
docs/
  requirements/
  specs/
  architecture/
  plan/
  tests/
  release/
  maintenance/
.ai/
  workflow/
```

## Folder Responsibilities

- `src/my_service/main.py` — FastAPI app construction and router registration
- `src/my_service/api/` — APIRouter modules; one file per resource or domain area
- `src/my_service/services/` — application and business logic; no HTTP types here
- `src/my_service/repositories/` — persistence access; add when a database is introduced
- `src/my_service/models/` — Pydantic BaseModel definitions for requests and responses
- `src/my_service/config/settings.py` — pydantic-settings BaseSettings class
- `src/my_service/deps/` — FastAPI Depends factories (auth, DB session, settings)
- `tests/` — pytest tests; uses TestClient for HTTP routes

## Required Workflow Files

- `AGENTS.md` or `CLAUDE.md` depending on tool
- `.ai/workflow/project-context.md`
- `.ai/workflow/workflow-state.md`
- `.ai/workflow/active-task.md`

## Notes and Constraints

- no authentication in the skeleton — add via `deps/auth.py` and `authlib`
- no database in the skeleton — add SQLAlchemy 2 async + asyncpg + alembic when needed
- single service only — this template does not handle multi-service setups
- rename `my_service` to your actual package name in `pyproject.toml` and
  throughout `src/`
- the `init-project.sh` script handles `.gitignore`, `.env.example`, `LICENSE`,
  and adapter files such as `CLAUDE.md` — do not add them manually to the skeleton
