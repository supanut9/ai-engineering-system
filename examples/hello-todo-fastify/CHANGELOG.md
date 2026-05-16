# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-16

### Added

- Initial release of hello-todo-fastify.
- Six HTTP endpoints: `POST /v1/todos`, `GET /v1/todos`, `GET /v1/todos/:id`,
  `PATCH /v1/todos/:id`, `DELETE /v1/todos/:id`, `GET /healthz`.
- Hexagonal architecture: domain entity and service in `src/core/todo`, inbound port
  interface, outbound repository port, Fastify HTTP adapter, in-memory storage adapter.
- In-memory storage backed by `Map<string, Todo>`; insertion order preserved for list
  operations.
- Zod 4.x schemas at the HTTP boundary via `fastify-type-provider-zod`; core domain
  has no Zod dependency.
- Input validation: title required and trimmed, max 200 chars; `due_at` validated as
  RFC3339 string.
- Uniform JSON error envelope: `{"error":{"code":"...","message":"..."}}`.
- Graceful shutdown on `SIGTERM`/`SIGINT` via `fastify.close()`.
- Structured logging to stdout via pino (JSON format); `LOG_LEVEL` env var.
- `Makefile` with `setup`, `run`, `test`, `lint`, `fmt`, `build` targets.
- GitHub Actions CI pipeline: `npm ci`, `tsc --noEmit`, `npm test`, `npm run build`.
- Phase 0–8 documentation artifacts under `docs/`.

[Unreleased]: https://github.com/example/hello-todo-fastify/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/example/hello-todo-fastify/releases/tag/v0.1.0
