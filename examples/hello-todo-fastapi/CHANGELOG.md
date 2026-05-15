# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-16

### Added

- Initial release of hello-todo-fastapi.
- Six HTTP endpoints: `POST /v1/todos`, `GET /v1/todos`, `GET /v1/todos/{id}`, `PATCH /v1/todos/{id}`, `DELETE /v1/todos/{id}`, `GET /healthz`.
- Layered architecture: Pydantic models in `models/`, `TodoRepository` Protocol and `MemoryTodoRepository` in `repositories/`, `TodoService` business logic in `services/`, FastAPI routers in `api/`.
- In-memory storage backed by `asyncio.Lock`; insertion order preserved for list operations.
- Input validation: title required and stripped, max 200 chars; `due_at` parsed as RFC3339 datetime.
- Uniform JSON error envelope: `{"error":{"code":"...","message":"..."}}` for all non-2xx responses.
- Global exception handlers mapping `RequestValidationError` (→ 422) and `TodoNotFoundError` (→ 404) to the uniform envelope.
- `secrets.token_hex(16)` for 32-char hex id generation.
- Structured logging to stdout via `logging` stdlib with a JSON formatter.
- pydantic-settings for `PORT` and `LOG_LEVEL` configuration.
- `Makefile` with `setup`, `run`, `test`, `lint`, `fmt`, `typecheck` targets.
- GitHub Actions CI pipeline: `ruff check`, `ruff format --check`, `mypy`, `pytest`.
- Phase 0–8 documentation artifacts under `docs/`.

[Unreleased]: https://github.com/example/hello-todo-fastapi/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/example/hello-todo-fastapi/releases/tag/v0.1.0
