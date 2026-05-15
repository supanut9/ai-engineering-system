# Python

## When to Use

Use Python when:

- you are building HTTP services, background workers, or data pipelines
- the team is most productive in Python for the problem at hand
- fast iteration on business logic matters more than minimal runtime overhead
- the domain involves data processing, ML integration, or scripting

Within Python services, use FastAPI for all HTTP APIs. Use Pydantic for all
data validation, including config. Use uv as the fast dependency resolver and
virtual-environment manager. Use hatch as the build backend.

Avoid Python as the primary stack for:

- latency-critical hot paths where Go or Rust would be more appropriate
- heavy concurrency workloads without careful async design

## Default Toolchain

| Tool | Version | Role |
|---|---|---|
| Python | 3.12 minimum, 3.13 supported | language runtime |
| FastAPI | 0.136.1 | HTTP framework |
| Pydantic | 2.13.4 | data validation and settings |
| pydantic-settings | 2.14.1 | config from environment |
| uvicorn[standard] | 0.47.0 | ASGI server |
| uv | 0.11.14 | dependency resolver and venv manager |
| hatch | 1.16.5 | build backend |
| ruff | 0.15.13 | linter and formatter |
| mypy | 2.1.0 | static type checker |
| pytest | 9.0.3 | test runner |
| pytest-asyncio | 1.3.0 | async test support |
| httpx | 0.28.1 | HTTP client and FastAPI test transport |

## Project Layout

Use src-layout for all Python services. This prevents accidental imports from
the source tree and ensures the installed package is what tests exercise.

```text
pyproject.toml
ruff.toml
src/
  my_service/
    __init__.py
    main.py
    api/
    services/
    repositories/
    models/
    config/
    deps/
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

The package name is the snake_case identifier used in `src/<pkg>/` and
referenced in `pyproject.toml` under `[tool.hatch.build.targets.wheel]
packages`.

## Configuration

Load all configuration through Pydantic Settings. Define a single `Settings`
class in `src/<pkg>/config/settings.py` that reads from environment variables.
Instantiate it once at startup and pass it through dependency injection.

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    port: int = 8000
    env: str = "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}
```

Never read `os.environ` directly outside the settings module.

## Logging

Prefer `structlog` for structured, JSON-capable logging in production services.
The stdlib `logging` module is acceptable for simpler services or scripts.

Key rules:

- configure the root logger at startup once
- never use `print()` in service code
- include a `request_id` or correlation key in all log records for HTTP services
- emit JSON in production, human-readable in development

## Testing

Use pytest as the test runner. Use pytest-asyncio for async route tests.
Use FastAPI's `TestClient` (backed by httpx) for HTTP integration tests.

Test layout: `tests/` at the project root, mirroring the `src/<pkg>/` structure
loosely.

```bash
pytest                          # run all tests
pytest -x                       # stop on first failure
pytest -k test_health           # filter by name
```

Mark async tests with `@pytest.mark.asyncio` when not using `asyncio_mode =
"auto"` in config.

## Linting and Formatting

Use ruff for both linting and formatting. It replaces flake8, isort, and black.

```bash
ruff check src tests            # lint
ruff format src tests           # format
ruff check --fix src tests      # auto-fix safe issues
```

Configuration lives in `ruff.toml` at the project root and matches the shared
config in `tooling/python/ruff.toml`.

## Type Checking

Use mypy in strict mode. Enable `disallow_untyped_defs`, `warn_return_any`, and
`disallow_any_generics` at minimum.

```bash
mypy src tests
```

All public functions and methods must have type annotations. Pydantic models
satisfy most data-shape requirements without extra annotations.

Common mypy issues to address early:

- annotate `Optional[X]` as `X | None` (Python 3.10+ union syntax)
- use `from __future__ import annotations` in files with forward references
- add `py.typed` marker file if publishing the package

## Build and Packaging

Use hatch as the build backend with the `hatchling` build system.

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

Declare runtime dependencies under `[project] dependencies`. Group dev tools
under `[project.optional-dependencies] dev`.

Install for development:

```bash
uv venv
uv pip install -e .[dev]
# or without uv:
python -m venv .venv
.venv/bin/pip install -e .[dev]
```

## Common Pitfalls

- importing from `src/my_service` without an editable install causes
  `ModuleNotFoundError`; always install with `-e .` first
- circular imports between `api/`, `services/`, and `deps/` — inject
  dependencies downward only, never upward
- sharing a mutable `Settings` instance across tests without resetting it —
  use `pytest` fixtures that construct fresh instances
- mixing sync and async functions in route handlers — choose one model per
  endpoint; avoid `asyncio.run()` inside sync handlers
- annotating Pydantic models with `dict` instead of `dict[str, Any]` causes
  mypy strict failures

## See Also

- `stacks/fastapi.md` — FastAPI-specific guidance, app shape, and testing
- `project-templates/python/fastapi-layered.md` — blueprint for a FastAPI
  layered-architecture project
- `tooling/python/ruff.toml` — shared ruff config
- `tooling/python/pyproject.toml.template` — shared pyproject template
