# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_Bootstrapped from the ai-engineering-system example scaffold on 2026-05-16._

## [0.1.0] - 2026-05-16

### Added

- Initial release of hello-todo-nextjs.
- Six HTTP endpoints: `POST /api/todos`, `GET /api/todos`, `GET /api/todos/[id]`, `PATCH /api/todos/[id]`, `DELETE /api/todos/[id]`, `GET /healthz`.
- Server-rendered home page (`GET /`) listing all current todos via a Next.js App Router server component.
- Layered Next.js App Router architecture: route handlers → service (pure functions) → in-memory repo module.
- In-memory storage backed by `Map<string, Todo>` in `src/lib/repo.ts`; insertion order preserved for list operations.
- Manual input validation in the service layer: non-empty title after trim, max 200 characters, ISO8601 `due_at`.
- PATCH partial-update semantics: `due_at: null` clears the field; absent field means no change.
- Uniform JSON error envelope: `{"error":{"code":"...","message":"..."}}` via a shared `errorResponse` helper.
- `Makefile` with `setup`, `dev`, `build`, `start`, `test`, `lint` targets.
- GitHub Actions CI pipeline: `npm ci`, `npm test`, `next build`.
- Phase 0–8 documentation artifacts under `docs/`.

[Unreleased]: https://github.com/example/hello-todo-nextjs/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/example/hello-todo-nextjs/releases/tag/v0.1.0
