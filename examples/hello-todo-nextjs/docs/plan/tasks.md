# tasks — hello-todo-nextjs

Tasks are sequenced inside-out. See `implementation-plan.md` for the dependency
graph and test strategy. Acceptance criteria are in
`../requirements/acceptance-criteria.md`.

---

## TODO-001: project scaffolding

**description:** Create the Next.js application skeleton using `create-next-app` or by
hand. Set up `src/` directory layout: `app/`, `components/`, `services/`, `lib/`,
`types/`. Add `vitest.config.mts`, `tsconfig.json`, `next.config.mjs`, `.env.example`,
and `.gitignore`. Ensure `next build` compiles without errors.

**depends on:** nothing

**acceptance criteria:**
- `src/app/layout.tsx` and `src/app/page.tsx` exist
- `src/services/`, `src/lib/`, `src/types/` directories exist
- `npx tsc --noEmit` passes on the empty skeleton
- `next build` succeeds

**test approach:** compile check only at this stage

**complexity:** small

---

## TODO-002: types and in-memory repo

**description:** Define the `Todo` TypeScript interface in `src/types/todo.ts`. Implement
`src/lib/repo.ts` as a module-level singleton: `Map<string, Todo>` for storage and a
separate `string[]` for insertion order. Implement exported pure functions: `create`,
`findAll`, `findById`, `update`, `remove`, `generateId`. All read functions must return
copies (spread) to prevent callers from mutating internal state.

**depends on:** TODO-001

**acceptance criteria:**
- `Todo` interface has fields: `id`, `title`, `completed`, `due_at`, `created_at`,
  `updated_at`
- `create` returns a todo with a 32-char hex id, `completed: false`, correct timestamps
- `findAll` returns todos in insertion order
- `findById` returns a copy; returns `undefined` for unknown id
- `update` bumps `updated_at`; returns `undefined` for unknown id
- `remove` returns `true` on success, `false` for unknown id; removes from order array
- package compiles with `npx tsc --noEmit`

**test approach:** unit tests in `src/lib/repo.test.ts` covering all five functions and
edge cases

**complexity:** small

---

## TODO-003: service (business logic)

**description:** Implement `src/services/todos.ts` as a module of pure exported functions.
Business logic: trim and re-validate title on create and update, handle `due_at`
null-vs-absent semantics on update, throw `Error` objects with a `code` property
(`'not_found'`, `'validation_error'`, `'internal'`) when repository returns `undefined`
or validation fails.

**depends on:** TODO-002

**acceptance criteria (links to user stories):**
- title trimming and re-validation on create and update (US-007)
- `completed` defaults to false (US-001)
- `updated_at` changes on PATCH (US-005)
- `due_at: null` clears the field; absent field means no change (US-005)
- coded errors thrown for unknown ids (US-008) and invalid input (US-007)

**test approach:** unit tests in `src/services/todos.test.ts` using real repo functions;
reset the repo Map in `beforeEach`

**complexity:** medium

---

## TODO-004: route handlers (HTTP layer)

**description:** Implement the six route handlers:
- `app/healthz/route.ts` — GET /healthz → `{"status":"ok"}`
- `app/api/todos/route.ts` — GET /api/todos, POST /api/todos
- `app/api/todos/[id]/route.ts` — GET, PATCH, DELETE /api/todos/[id]

Handlers are thin: parse request body via `request.json()`, delegate to service, return
`NextResponse.json(...)` with correct status. A shared `errorResponse` helper in
`src/lib/errors.ts` formats the uniform error envelope. Catch body parse errors and
service errors by `code` property to map to status codes.

**depends on:** TODO-003

**acceptance criteria (links to user stories):**
- POST returns 201 with todo body (US-001, US-002)
- GET list returns 200 with `{"items":[...]}` (US-003)
- GET by id returns 200 or 404 (US-004, US-008)
- PATCH returns 200 or 400 or 404 (US-005, US-007, US-008)
- DELETE returns 204 or 404 (US-006, US-008)
- GET /healthz returns 200 `{"status":"ok"}`

**test approach:** integration tests in `src/app/api/todos/route.test.ts` invoking
handlers directly with mock `Request` objects; assert `NextResponse` status and body

**complexity:** medium

---

## TODO-005: home page (server component)

**description:** Implement `app/page.tsx` as an async server component. Call
`todosService.findAll()` directly (no HTTP fetch). Render each todo title in a list.
Display "No todos yet" when the store is empty. Use minimal, readable JSX — no CSS
framework required for v0.1.0.

**depends on:** TODO-003

**acceptance criteria (links to user stories):**
- `GET /` returns HTML containing each todo's title (US-009)
- Empty state renders "No todos yet" (US-009)
- No JavaScript errors on render

**test approach:** Vitest + @testing-library/react; seed the repo with two todos in
`beforeEach`, render `<Page />`, assert titles appear in the output

**complexity:** small

---

## TODO-006: error handling

**description:** Implement `src/lib/errors.ts` with a `createServiceError` factory that
produces `Error` objects carrying a `code` string, and an `errorResponse` helper that
takes a `code` + `message` and returns a `NextResponse` with the correct status and
the uniform JSON error envelope. Document the three valid codes: `not_found` (404),
`validation_error` (400), `internal` (500).

**depends on:** TODO-002

**acceptance criteria:**
- every non-2xx API response uses `{"error":{"code":"...","message":"..."}}` envelope
- `not_found`, `validation_error`, `internal` are the only valid codes emitted
- route handlers call `errorResponse` consistently in their catch blocks

**test approach:** error behavior exercised by route handler integration tests (TODO-004)

**complexity:** small

---

## TODO-007: unit and integration tests

**description:** Write comprehensive tests covering all acceptance criteria. Include:
repo unit tests (TODO-002 extended), service unit tests (TODO-003 extended),
route handler integration tests (TODO-004 extended), and a server component render test
(TODO-005 extended). Total: 20+ tests covering every user story from US-001 through
US-009.

**depends on:** TODO-006

**acceptance criteria:**
- `npm test` passes with zero failures
- each user story (US-001 through US-009) has at least one corresponding test case
- repo tests cover: create, findAll order, findById copy isolation, update, remove
- service tests cover: validation, not-found, due_at null-vs-absent
- route handler tests cover: all six endpoints, happy-path + error-path
- server component test covers: todos rendered, empty state

**test approach:** Vitest + @testing-library/react

**complexity:** medium

---

## TODO-008: Makefile, CI, and runbook

**description:** Write the `Makefile` with targets: `setup` (`npm install`), `dev`
(`next dev`), `build` (`next build`), `start` (`next start`), `test` (`npm test`),
`lint` (`next lint && npx tsc --noEmit`), `fmt` (noop with comment). Write
`.github/workflows/ci.yml` that runs `npm ci`, `npm test`, and `next build` on push
and PR. Write `docs/maintenance/runbook.md` and `docs/maintenance/known-issues.md`.
Write `CHANGELOG.md` with `0.1.0` entry. Update workflow state to Phase 8: Maintenance.

**depends on:** TODO-007

**acceptance criteria:**
- `make setup && make test` passes from a clean clone
- `make lint` exits zero on valid TypeScript
- CI workflow runs green on the main branch
- runbook covers: start (dev + production), stop, change port, read logs, restart
- known-issues documents in-memory limitation and no-auth warning
- `CHANGELOG.md` has `## [0.1.0] - 2026-05-16` entry listing all six endpoints and the
  home page

**test approach:** run all make targets locally before committing; CI is self-verifying

**complexity:** small
