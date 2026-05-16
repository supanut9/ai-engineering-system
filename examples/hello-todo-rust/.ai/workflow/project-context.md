# project context

> **About this example:** This file is the canonical filled-in project-context for the
> ai-engineering-system reference example (`hello-todo-rust`). Do not use this directory as
> a production starter; it exists to demonstrate what a complete project-context looks
> like after Phase 0 intake.

## project name

hello-todo-rust

## product type

HTTP API service — internal example / learning reference

## system version

v0.1.0

## date initialized

2026-05-17

## owner

Example Maintainer <maintainer@example.com>

## agent

claude

## current phase

Phase 8: Maintenance

## selected stack

- language: Rust (edition 2024, MSRV 1.85)
- http framework: Axum 0.8
- async runtime: Tokio 1.45 (multi-threaded)
- storage: in-memory (`tokio::sync::RwLock`-guarded map)
- logging: `tracing` + `tracing-subscriber` (JSON handler)
- testing: `tokio::test` + `axum::serve` against `TcpListener::bind("127.0.0.1:0")`
- infra: single binary, no containerization required for local dev

## architecture

hexagonal (ports-and-adapters)

## relevant shared workflow files

- `workflow/ai-workflow.md`
- `workflow/agent-protocol.md`
- `workflow/phase-gates.md`
- `workflow/task-lifecycle.md`

## relevant stack profiles

- `stacks/rust.md`
- `stacks/axum.md`

## relevant architecture reference

- `code-architectures/hexagonal-architecture.md`
- `project-templates/rust/axum-hexagonal.md`

## relevant standards

- `standards/api-standards.md`
- `standards/coding-standards.md`
- `standards/testing-standards.md`
- `standards/logging-observability.md`
- `standards/git-workflow.md`

## current goal

Maintenance of v0.1.0. Monitor for dependency updates and address known limitations
documented in `docs/maintenance/known-issues.md`.

## current constraints

- in-memory storage only; data does not survive process restart
- no authentication; API is open to any caller
- single-tenant; no user model

## agent instructions

- follow the shared workflow in order
- do not skip phase gates
- do not implement before required planning artifacts exist
- when adding features, start a new Phase 0 intake for the change
- this example must stay generic; do not introduce monorepo-specific patterns
