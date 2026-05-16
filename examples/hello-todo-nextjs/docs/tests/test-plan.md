# test plan — hello-todo-nextjs v0.1.0

## scope

All six HTTP API endpoints, the server-rendered home page, and the in-memory storage
layer for the `hello-todo-nextjs` application.

Out of scope: load testing, security scanning, external integrations (none exist in
v0.1.0).

## test layers

### unit — repo (`src/lib/repo.test.ts`)

Tests `src/lib/repo.ts` directly. Plain function calls; the in-memory Map is reset in
`beforeEach` by calling a `resetStore()` helper exported from the module for test use.

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

### unit — service (`src/services/todos.test.ts`)

Tests `src/services/todos.ts` with real repo functions. Exercises validation and error
propagation logic. Resets the repo Map in `beforeEach`.

| test | covered behaviour |
|---|---|
| `creates a todo with trimmed title and completed=false` | trim + defaults |
| `throws validation_error for empty title` | US-007 |
| `throws validation_error for whitespace-only title` | US-007 |
| `throws validation_error for title over 200 chars` | US-007 |
| `accepts title of exactly 200 chars` | boundary |
| `stores due_at when provided` | US-002 |
| `returns empty array when no todos exist` | US-003 |
| `returns todos in insertion order` | US-003 |
| `findOne returns the todo when found` | US-004 |
| `findOne throws not_found for unknown id` | US-008 |
| `update updates title and completed, bumps updated_at` | US-005 |
| `update clears due_at when dto.due_at is explicitly null` | US-005 |
| `update does not change due_at when omitted from dto` | US-005 |
| `update throws not_found for unknown id` | US-008 |
| `update throws validation_error for empty title on update` | US-007 |
| `update throws validation_error for whitespace-only title on update` | US-007 |
| `remove removes the todo successfully` | US-006 |
| `remove throws not_found for unknown id` | US-008 |

### integration — route handlers (`src/app/api/todos/route.test.ts`)

Invokes route handler functions directly with constructed `Request` objects. Asserts on
the returned `NextResponse` status and JSON body. Resets the repo Map in `beforeEach`.

| test | covered behaviour |
|---|---|
| `GET /healthz returns 200 with status ok` | FR-06 |
| `POST /api/todos creates a todo and returns 201` | US-001 |
| `POST /api/todos creates a todo with due_at` | US-002 |
| `POST /api/todos returns 400 for empty title` | US-007 |
| `POST /api/todos returns 400 for missing title` | US-007 |
| `POST /api/todos returns 400 for title over 200 chars` | US-007 |
| `GET /api/todos returns 200 with empty items` | US-003 |
| `GET /api/todos returns all created todos` | US-003 |
| `GET /api/todos/[id] returns 200 with the todo` | US-004 |
| `GET /api/todos/[id] returns 404 for unknown id` | US-008 |
| `PATCH /api/todos/[id] updates title and completed` | US-005 |
| `PATCH /api/todos/[id] clears due_at when sent as null` | US-005 |
| `PATCH /api/todos/[id] returns 404 for unknown id` | US-008 |
| `PATCH /api/todos/[id] returns 400 for empty title` | US-007 |
| `DELETE /api/todos/[id] returns 204 and removes the todo` | US-006 |
| `DELETE /api/todos/[id] returns 404 for unknown id` | US-008 |

### unit — home page component (`src/app/page.test.tsx`)

Renders `app/page.tsx` with `@testing-library/react`. Seeds the repo before rendering.

| test | covered behaviour |
|---|---|
| `renders todo titles when todos exist` | US-009 |
| `renders empty state when no todos exist` | US-009 |

### manual / exploratory

See `manual-test-checklist.md`. Run by a human before any release.

## coverage targets

| layer | target |
|---|---|
| repo | ≥ 90% statement coverage |
| service | ≥ 90% statement coverage |
| route handlers | every handler has at least one happy-path and one error-path test |
| server component | empty state and populated state both covered |

Run `npm run test:coverage` to measure.

## ci gate

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs `npm test` on every push
and pull request. The build must be green before merging.

## regression

See `regression-checklist.md` for the pre-release checklist.
