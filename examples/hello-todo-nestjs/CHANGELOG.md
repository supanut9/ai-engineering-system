# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-16

### Added

- Initial release of hello-todo-nestjs.
- Six HTTP endpoints: `POST /v1/todos`, `GET /v1/todos`, `GET /v1/todos/:id`, `PATCH /v1/todos/:id`, `DELETE /v1/todos/:id`, `GET /healthz`.
- Layered NestJS architecture: controller → service → repository, each in its own module under `src/modules/`.
- In-memory storage backed by `Map<string, Todo>`; insertion order preserved for list operations.
- Input validation via `class-validator` on `CreateTodoDto` and `UpdateTodoDto`.
- Service-level title trim and whitespace validation for both create and update.
- PATCH partial-update semantics: `due_at: null` clears the field; absent field means no change.
- Uniform JSON error envelope: `{"error":{"code":"...","message":"..."}}` via `ApiErrorFilter`.
- `NotFoundError` (404) and `ValidationError` (400) typed exceptions.
- `Makefile` with `setup`, `run`, `test`, `test-e2e`, `lint`, `build` targets.
- GitHub Actions CI pipeline: `npm ci`, `npm test`, `npm run build`.
- Phase 0–8 documentation artifacts under `docs/`.

[Unreleased]: https://github.com/example/hello-todo-nestjs/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/example/hello-todo-nestjs/releases/tag/v0.1.0
