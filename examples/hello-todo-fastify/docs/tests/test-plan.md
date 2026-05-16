# Test Plan — hello-todo-fastify v0.1.0

## Scope

All six HTTP endpoints and the in-memory storage adapter for the `hello-todo-fastify`
service.

Out of scope: load testing, security scanning, external integrations (none exist in
v0.1.0).

## Test layers

### Unit — core service (`src/core/todo/todo-service.test.ts`)

Tests the service in isolation using a local stub implementing `TodoRepository` (defined
in the same test file). No Fastify, no HTTP, no Zod.

| Test | Covered behaviour |
|------|-------------------|
| `create_happyPath` | Valid title produces a todo with id, correct title, completed=false |
| `create_emptyTitle` | Empty title throws ValidationError |
| `create_whitespaceOnlyTitle` | Whitespace-only title throws ValidationError |
| `create_titleTooLong` | 201-char title throws ValidationError |
| `get_unknownId` | Unknown id throws NotFoundError |
| `update_unknownId` | Update on unknown id throws NotFoundError |
| `delete_unknownId` | Delete on unknown id throws NotFoundError |
| `update_setsCompletedAndAdvancesUpdatedAt` | Patch sets completed and advances updatedAt |
| `list_returnsAllItems` | List returns all inserted todos |
| `update_titleValidation` | Whitespace and over-length title rejected on patch |

### Unit — memory adapter (`src/adapters/outbound/memory/memory-todo-repository.test.ts`)

Tests `MemoryTodoRepository` directly.

| Test | Covered behaviour |
|------|-------------------|
| `save_thenFindById` | Save then findById returns the saved todo |
| `findById_notFound` | findById on missing id returns undefined |
| `findAll_insertionOrder` | findAll returns todos in insertion order |
| `delete_happyPath` | delete removes item; subsequent findById returns undefined |
| `delete_notFound` | delete on missing id returns false |
| `save_returnsCopy` | Mutating the returned value does not affect stored state |
| `save_updateExisting` | Saving with same id overwrites, does not duplicate |

### Integration — HTTP routes (`src/adapters/inbound/http/routes.test.ts`)

Uses `fastify.inject()`. Each test builds a full Fastify app wired to a real
`MemoryTodoRepository`, fires HTTP requests through the Fastify dispatch layer (no
real socket), and asserts response status and JSON body.

| Test | Covered behaviour |
|------|-------------------|
| `GET /healthz` | 200 `{"status":"ok"}` |
| `POST /v1/todos — happy path` | 201, correct body shape including all fields |
| `POST /v1/todos — empty title` | 400 validation_error |
| `POST /v1/todos — missing title` | 400 validation_error |
| `POST /v1/todos — malformed JSON` | 400 |
| `GET /v1/todos — empty` | 200 `{"items":[]}` |
| `GET /v1/todos — with items` | 200 with items array |
| `GET /v1/todos/:id — found` | 200 with matching todo |
| `GET /v1/todos/:id — not found` | 404 not_found |
| `PATCH /v1/todos/:id — update title and completed` | 200 with updated fields |
| `PATCH /v1/todos/:id — not found` | 404 |
| `PATCH /v1/todos/:id — clear due_at` | 200, `due_at` is null |
| `PATCH /v1/todos/:id — empty title` | 400 validation_error |
| `DELETE /v1/todos/:id — happy path` | 204, subsequent GET returns 404 |
| `DELETE /v1/todos/:id — not found` | 404 |

### Manual / exploratory

See `manual-test-checklist.md`. Run by a human before any release.

## Coverage targets

| Layer | Target |
|-------|--------|
| core/todo | ≥ 90% statement coverage |
| memory adapter | ≥ 90% statement coverage |
| HTTP routes | every route handler has at least one happy-path and one error-path test |

Run `npm test -- --coverage` to measure with Vitest's built-in V8 coverage provider.

## CI gate

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs `npm test` on every push
and pull request. The build must be green before merging. TypeScript type-checking
(`tsc --noEmit`) runs as a separate CI step.

## Regression

See `regression-checklist.md` for the pre-release checklist.
