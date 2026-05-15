# project context

> **About this example:** This file is the canonical filled-in project-context for the
> ai-engineering-system reference example (`hello-todo-fastapi`). Do not use this directory
> as a production starter; it exists to demonstrate what a complete project-context looks
> like after Phase 0 intake.

## project name

hello-todo-fastapi

## product type

HTTP API service — internal example / learning reference

## system version

v0.0.1

## date initialized

2026-05-16

## owner

Example Maintainer <maintainer@example.com>

## agent

claude

## current phase

Phase 8: Maintenance

## selected stack

- language: Python 3.12
- http framework: FastAPI 0.136.1
- asgi server: uvicorn[standard] 0.47.0
- validation: Pydantic 2.13.4 + pydantic-settings 2.14.1
- storage: in-memory (`dict[str, Todo]` guarded by `asyncio.Lock`)
- logging: `logging` stdlib with JSON formatter to stdout
- testing: `pytest` 9.0.3 + `httpx` 0.28.1 (via FastAPI TestClient)
- infra: single process, no containerization required for local dev

## architecture

layered (routes → services → repositories → models)

## relevant shared workflow files

- `workflow/ai-workflow.md`
- `workflow/agent-protocol.md`
- `workflow/phase-gates.md`
- `workflow/task-lifecycle.md`

## relevant stack profiles

- `stacks/fastapi.md`

## relevant architecture reference

- `code-architectures/layered.md`

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
