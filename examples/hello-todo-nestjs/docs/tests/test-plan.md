# test plan — hello-todo-nestjs v0.1.0

## scope

All six HTTP endpoints and the in-memory storage layer for the `hello-todo-nestjs`
service.

Out of scope: load testing, security scanning, external integrations (none exist in
v0.1.0).

## test layers

### unit — repository (`src/modules/todos/repositories/todos.repository.spec.ts`)

Tests `TodosRepository` directly. No NestJS DI overhead; plain class instantiation.

| test | covered behaviour |
|---|---|
| `create returns a todo with a non-empty id` | id generation, 32-char hex |
| `create sets completed to false` | default value |
| `create stores due_at when provided` | optional field |
| `create stores null due_at when omitted` | null default |
| `create assigns different ids to two sequential creates` | id uniqueness |
| `findAll returns empty array when store is empty` | empty state |
| `findAll preserves insertion order` | order guarantee |
| `findById returns the todo when found` | happy path |
| `findById returns undefined for unknown id` | not-found |
| `findById returns a copy — mutating result does not affect stored state` | copy isolation |
| `update updates the specified fields and bumps updated_at` | mutation + timestamp |
| `update returns undefined for unknown id` | not-found |
| `remove removes the todo and returns true` | happy path |
| `remove returns false for unknown id` | not-found |
| `remove removes item from findAll results` | order cleanup |

### unit — service (`src/modules/todos/todos.service.spec.ts`)

Tests `TodosService` with a real `TodosRepository` via `Test.createTestingModule`.
Exercises validation and error propagation logic.

| test | covered behaviour |
|---|---|
| `creates a todo with trimmed title and completed=false` | trim + defaults |
| `throws ValidationError for empty title` | US-007 |
| `throws ValidationError for whitespace-only title` | US-007 |
| `throws ValidationError for title over 200 chars` | US-007 |
| `accepts title of exactly 200 chars` | boundary |
| `stores due_at when provided` | US-002 |
| `returns empty array when no todos exist` | US-003 |
| `returns todos in insertion order` | US-003 |
| `findOne returns the todo when found` | US-004 |
| `findOne throws NotFoundError for unknown id` | US-008 |
| `update updates title and completed, bumps updated_at` | US-005 |
| `update clears due_at when dto.due_at is explicitly null` | US-005 |
| `update does not change due_at when omitted from dto` | US-005 |
| `update throws NotFoundError for unknown id` | US-008 |
| `update throws ValidationError for empty title on update` | US-007 |
| `update throws ValidationError for whitespace-only title on update` | US-007 |
| `remove removes the todo successfully` | US-006 |
| `remove throws NotFoundError for unknown id` | US-008 |

### integration — controller (`src/modules/todos/todos.controller.spec.ts`)

Boots the full NestJS application via `Test.createTestingModule`. Sends HTTP requests
via supertest. Asserts status codes and JSON bodies.

| test | covered behaviour |
|---|---|
| `GET /healthz returns 200 with status ok` | FR-06 |
| `POST /v1/todos creates a todo and returns 201` | US-001 |
| `POST /v1/todos creates a todo with due_at` | US-002 |
| `POST /v1/todos returns 400 for empty title` | US-007 |
| `POST /v1/todos returns 400 for missing title` | US-007 |
| `POST /v1/todos returns 400 for title over 200 chars` | US-007 |
| `GET /v1/todos returns 200 with empty items` | US-003 |
| `GET /v1/todos returns all created todos` | US-003 |
| `GET /v1/todos/:id returns 200 with the todo` | US-004 |
| `GET /v1/todos/:id returns 404 for unknown id` | US-008 |
| `PATCH /v1/todos/:id updates title and completed` | US-005 |
| `PATCH /v1/todos/:id clears due_at when sent as null` | US-005 |
| `PATCH /v1/todos/:id returns 404 for unknown id` | US-008 |
| `PATCH /v1/todos/:id returns 400 for empty title` | US-007 |
| `DELETE /v1/todos/:id returns 204 and removes the todo` | US-006 |
| `DELETE /v1/todos/:id returns 404 for unknown id` | US-008 |

### manual / exploratory

See `manual-test-checklist.md`. Run by a human before any release.

## coverage targets

| layer | target |
|---|---|
| repository | ≥ 90% statement coverage |
| service | ≥ 90% statement coverage |
| controller | every handler has at least one happy-path and one error-path test |

Run `npm run test:cov` to measure.

## ci gate

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs `npm test` on every push
and pull request. The build must be green before merging.

## regression

See `regression-checklist.md` for the pre-release checklist.
