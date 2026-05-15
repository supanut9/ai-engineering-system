# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-15

### Added

- Initial release of hello-todo-go.
- Six HTTP endpoints: `POST /v1/todos`, `GET /v1/todos`, `GET /v1/todos/:id`, `PATCH /v1/todos/:id`, `DELETE /v1/todos/:id`, `GET /healthz`.
- Hexagonal architecture: domain entity and service in `internal/core/todo`, inbound/outbound ports, Gin HTTP adapter, in-memory storage adapter.
- In-memory storage backed by `sync.RWMutex`; insertion order preserved for list operations.
- Input validation: title required and trimmed, max 200 chars; `due_at` parsed as RFC3339.
- Uniform JSON error envelope: `{"error":{"code":"...","message":"..."}}`.
- Graceful shutdown on `SIGTERM`/`SIGINT` with 5-second drain window.
- Structured logging to stdout via `log/slog` (JSON handler).
- `Makefile` with `setup`, `run`, `test`, `lint`, `fmt`, `build`, `smoke` targets.
- GitHub Actions CI pipeline: `go vet`, `gofmt` check, `go test -race`, `go build`.
- Phase 0–8 documentation artifacts under `docs/`.

[Unreleased]: https://github.com/example/hello-todo-go/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/example/hello-todo-go/releases/tag/v0.1.0
