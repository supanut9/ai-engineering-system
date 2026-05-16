# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-17

### Added

- Initial release of hello-todo-rust.
- Six HTTP endpoints: `POST /v1/todos`, `GET /v1/todos`, `GET /v1/todos/:id`, `PATCH /v1/todos/:id`, `DELETE /v1/todos/:id`, `GET /healthz`.
- Hexagonal architecture: domain entity and service in `src/core/todo`, inbound/outbound ports, Axum HTTP adapter, in-memory storage adapter.
- In-memory storage backed by `tokio::sync::RwLock`; insertion order preserved via an auxiliary `Vec` of ids.
- Input validation: title required and trimmed, max 200 chars; `due_at` parsed as RFC3339.
- Uniform JSON error envelope: `{"error":{"code":"...","message":"..."}}`.
- Graceful shutdown on `SIGTERM`/`SIGINT` with 5-second drain window via `tokio::signal`.
- Structured logging to stdout via `tracing` + `tracing-subscriber` (JSON format).
- `Makefile` with `setup`, `run`, `test`, `lint`, `fmt`, `build`, `smoke` targets.
- GitHub Actions CI pipeline: `cargo fmt --check`, `cargo clippy -D warnings`, `cargo test`, `cargo build`.
- Phase 0–8 documentation artifacts under `docs/`.

[Unreleased]: https://github.com/example/hello-todo-rust/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/example/hello-todo-rust/releases/tag/v0.1.0
