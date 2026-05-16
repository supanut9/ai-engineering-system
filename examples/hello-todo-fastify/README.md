# hello-todo-fastify

A minimal, single-user todo-list HTTP API built with Fastify and TypeScript, structured with hexagonal architecture. It serves as the canonical filled-in Fastify reference project for the ai-engineering-system workflow: every phase from project intake (Phase 0) through maintenance documentation (Phase 8) is represented here.

## Quickstart

```bash
make setup   # npm install
make test    # vitest run
make run     # starts the server on :8080

# In a second terminal:
curl -s localhost:8080/healthz
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"buy milk"}' localhost:8080/v1/todos
curl -s localhost:8080/v1/todos
```

Environment variable `PORT` overrides the default port `8080`.
Set `LOG_LEVEL` to `debug`, `info`, `warn`, or `error` (default: `info`).

## Endpoints

| Method | Path          | Description       | Success |
|--------|---------------|-------------------|---------|
| GET    | /healthz      | Health check      | 200     |
| POST   | /v1/todos     | Create a todo     | 201     |
| GET    | /v1/todos     | List all todos    | 200     |
| GET    | /v1/todos/:id | Get a single todo | 200     |
| PATCH  | /v1/todos/:id | Partial update    | 200     |
| DELETE | /v1/todos/:id | Delete a todo     | 204     |

### Error envelope

All errors follow the same shape:

```json
{ "error": { "code": "not_found", "message": "todo not found" } }
```

Codes: `validation` (400), `not_found` (404), `internal` (500).

## Project layout

```
src/
  core/
    todo/
      todo.ts                    — domain entity (type + factory)
      todo.service.ts            — pure business logic, depends only on the outbound port
      todo.service.test.ts       — service unit tests
      errors.ts                  — domain error types (ValidationError, NotFoundError)
  ports/
    inbound/
      todo-service.port.ts       — interface the HTTP routes call
    outbound/
      todo-repository.port.ts    — interface the service depends on
  adapters/
    inbound/
      http/
        server.ts                — Fastify factory: register plugins, wire routes
        routes/
          health.routes.ts
          todos.routes.ts
          todos.routes.test.ts   — integration tests via fastify.inject()
        schemas/
          todo.schemas.ts        — Zod schemas for request/response
        error-handler.ts         — setErrorHandler wired to the envelope
    outbound/
      memory/
        todo.memory-repo.ts      — in-memory repo implementing the outbound port
        todo.memory-repo.test.ts
  index.ts                       — composition root: repo → service → server → listen
docs/
  requirements/                  — Phase 0–1: project brief, PRD, user stories
  specs/                         — Phase 2: functional spec, API spec, data model
  architecture/                  — Phase 3: system design, tech stack, ADRs
  plan/                          — Phase 4: implementation plan, milestones
  tests/                         — Phase 6: test plan, checklists
  release/                       — Phase 7: go-live checklist, deployment, rollback
  maintenance/                   — Phase 8: runbook, known issues
```

## Makefile targets

| Target | Description                              |
|--------|------------------------------------------|
| setup  | `npm install --no-audit --no-fund`       |
| run    | `npm run dev` (tsx watch)                |
| test   | `vitest run`                             |
| lint   | `tsc --noEmit` (type-check)             |
| fmt    | configure prettier in Phase 3            |
| build  | `tsc` → `dist/`                          |

## Full workflow docs

See `docs/` for the complete Phase 0–8 artifacts. Start with `docs/requirements/project-brief.md` to understand the product context, then follow the phases in order.

This example was bootstrapped from ai-engineering-system v0.3.0.
