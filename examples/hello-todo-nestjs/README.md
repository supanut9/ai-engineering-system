# hello-todo-nestjs

A minimal, single-user todo-list HTTP API built with NestJS using a layered architecture. It serves as the NestJS reference project for the ai-engineering-system workflow: every phase from project intake (Phase 0) through maintenance documentation (Phase 8) is represented here.

## Quickstart

```bash
make setup   # npm install
make test    # npm test
make run     # starts the server on :3000

# In a second terminal:
curl -s localhost:3000/healthz
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"buy milk"}' localhost:3000/v1/todos
curl -s localhost:3000/v1/todos
```

Environment variable `PORT` overrides the default port `3000`.

## Endpoints

| Method | Path            | Description          |
|--------|-----------------|----------------------|
| GET    | /healthz        | Health check         |
| POST   | /v1/todos       | Create a todo        |
| GET    | /v1/todos       | List all todos       |
| GET    | /v1/todos/:id   | Get a single todo    |
| PATCH  | /v1/todos/:id   | Partial update       |
| DELETE | /v1/todos/:id   | Delete a todo        |

## Curl examples

```bash
# Create a todo
curl -sX POST -H 'Content-Type: application/json' \
  -d '{"title":"Buy milk","due_at":"2026-06-01T09:00:00Z"}' \
  localhost:3000/v1/todos

# List all todos
curl -s localhost:3000/v1/todos

# Get a single todo
curl -s localhost:3000/v1/todos/<id>

# Partial update — mark complete and clear due date
curl -sX PATCH -H 'Content-Type: application/json' \
  -d '{"completed":true,"due_at":null}' \
  localhost:3000/v1/todos/<id>

# Delete
curl -sX DELETE localhost:3000/v1/todos/<id>
```

## Project layout

```
src/
  main.ts                             — bootstrap and global filter wiring
  app.module.ts                       — root module; imports feature modules
  config/configuration.ts             — env-var configuration helper
  common/
    errors/
      not-found.error.ts              — typed 404 exception
      validation.error.ts             — typed 400 exception
    filters/
      api-error.filter.ts             — global exception → error envelope filter
  modules/
    health/
      health.controller.ts            — GET /healthz
      health.service.ts               — liveness check
      health.module.ts
      health.service.spec.ts
    todos/
      todos.controller.ts             — HTTP handlers for all five todo routes
      todos.service.ts                — business logic (validation, PATCH semantics)
      todos.module.ts
      todos.controller.spec.ts        — controller integration tests (supertest)
      todos.service.spec.ts           — service unit tests
      entities/todo.entity.ts         — Todo type
      dto/create-todo.dto.ts          — POST body shape + class-validator rules
      dto/update-todo.dto.ts          — PATCH body shape + class-validator rules
      repositories/todos.repository.ts        — in-memory Map store
      repositories/todos.repository.spec.ts   — repository unit tests
test/
  jest-e2e.json                       — Jest config for future e2e tests
docs/
  requirements/                       — Phase 0–1: project brief, PRD, user stories
  specs/                              — Phase 2: functional spec, API spec, data model
  architecture/                       — Phase 3: system design, tech stack, ADRs
  plan/                               — Phase 4: implementation plan, milestones
  tests/                              — Phase 6: test plan, checklists
  release/                            — Phase 7: go-live checklist, deployment, rollback
  maintenance/                        — Phase 8: runbook, known issues
```

## Makefile targets

| Target    | Description                                         |
|-----------|-----------------------------------------------------|
| setup     | `npm install`                                       |
| run       | `npm run start:dev` (watch mode)                    |
| test      | `npm test`                                          |
| test-e2e  | `npm run test:e2e`                                  |
| lint      | `npx tsc --noEmit`                                  |
| build     | `npm run build` (produces `dist/`)                  |

## Full workflow docs

See `docs/` for the complete Phase 0–8 artifacts. Start with `docs/requirements/project-brief.md` to understand the product context, then follow the phases in order.

This example was bootstrapped from ai-engineering-system v0.0.1 and serves as the NestJS reference.
