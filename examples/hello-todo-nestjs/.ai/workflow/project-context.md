# project context

> **About this example:** This file is the canonical filled-in project-context for the
> ai-engineering-system reference example (`hello-todo-nestjs`). Do not use this directory as
> a production starter; it exists to demonstrate what a complete project-context looks
> like after Phase 0 intake.

## project name

hello-todo-nestjs

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

- language: TypeScript ^5.8.3
- runtime: Node.js 22 LTS
- http framework: NestJS ^11.1.21 (platform-express)
- validation: class-validator ^0.15.1 + class-transformer ^0.5.1
- storage: in-memory (`Map<string, Todo>` in `TodosRepository`)
- logging: NestJS default Logger to stdout
- testing: Jest ^29.7.0 + ts-jest + @nestjs/testing + supertest
- infra: single Node.js process, no containerization required for local dev

## architecture

nestjs-layered (controller → service → repository per module)

## relevant shared workflow files

- `workflow/ai-workflow.md`
- `workflow/agent-protocol.md`
- `workflow/phase-gates.md`
- `workflow/task-lifecycle.md`

## relevant stack profiles

- `stacks/nestjs.md`

## relevant architecture reference

- `code-architectures/layered-architecture.md`

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
