# tasks — hello-todo-nestjs

Tasks are sequenced module-inward. See `implementation-plan.md` for the dependency
graph and test strategy. Acceptance criteria are in
`../requirements/acceptance-criteria.md`.

---

## TODO-001: module scaffolding

**description:** Create the directory structure under `src/modules/` and declare
`HealthModule` and `TodosModule` with empty controllers/services/repositories.
Register both modules in `AppModule`. Ensure `nest build` compiles without errors.

**depends on:** nothing

**acceptance criteria:**
- `src/modules/health/` and `src/modules/todos/` directories exist
- `AppModule` imports both feature modules
- `npx tsc --noEmit` passes on the empty skeleton

**test approach:** compile check only at this stage

**complexity:** small

---

## TODO-002: entity and DTOs

**description:** Define the `Todo` class in `entities/todo.entity.ts`. Create
`CreateTodoDto` with `class-validator` rules (`@IsNotEmpty`, `@MaxLength`, `@IsOptional`,
`@IsDateString`). Create `UpdateTodoDto` with the same rules made optional and a
`due_at?: string | null` field to support the null-clear semantic.

**depends on:** TODO-001

**acceptance criteria:**
- `Todo` class has fields: `id`, `title`, `completed`, `due_at`, `created_at`, `updated_at`
- `CreateTodoDto` rejects empty title, title over 200 chars, invalid due_at format
- `UpdateTodoDto` allows all fields to be absent; allows `due_at: null`
- package compiles with `npx tsc --noEmit`

**test approach:** validation rules exercised in service tests (TODO-008)

**complexity:** small

---

## TODO-003: in-memory repository

**description:** Implement `TodosRepository` as an `@Injectable()` class in
`src/modules/todos/repositories/todos.repository.ts`. Use `Map<string, Todo>` for
storage and a separate `string[]` for insertion order. Implement: `create`, `findAll`,
`findById`, `update`, `remove`. Generate ids with `crypto.randomBytes(16).toString('hex')`.
All methods that return a `Todo` must return a copy (spread) to prevent callers from
mutating internal state.

**depends on:** TODO-002

**acceptance criteria:**
- `create` returns a todo with a 32-char hex id, `completed: false`, correct timestamps
- `findAll` returns todos in insertion order
- `findById` returns a copy; returns `undefined` for unknown id
- `update` bumps `updated_at`; returns `undefined` for unknown id
- `remove` returns `true` on success, `false` for unknown id; removes from order array

**test approach:** unit tests in `todos.repository.spec.ts` covering all five methods
and edge cases

**complexity:** small

---

## TODO-004: service (business logic)

**description:** Implement `TodosService` in `src/modules/todos/todos.service.ts`. Inject
`TodosRepository` via NestJS DI. Business logic: trim and re-validate title on create
and update (class-validator cannot trim before validating), handle `due_at` null-vs-absent
semantics on update, throw `NotFoundError` when repository returns `undefined`, throw
`ValidationError` for business-rule failures.

**depends on:** TODO-003

**acceptance criteria (links to user stories):**
- title trimming and re-validation on create and update (US-007)
- `completed` defaults to false (US-001)
- `updated_at` changes on PATCH (US-005)
- `due_at: null` clears the field; absent field means no change (US-005)
- `NotFoundError` thrown for unknown ids (US-008)

**test approach:** unit tests in `todos.service.spec.ts` using a real `TodosRepository`
instance via `Test.createTestingModule`

**complexity:** medium

---

## TODO-005: controller (HTTP layer)

**description:** Implement `TodosController` and `HealthController`. Controllers are
thin: decode the request (via `@Body()`, `@Param()`), apply `ValidationPipe` on write
routes, delegate to the service, and return the response. Map status codes via
decorators (`@HttpCode`, `@HttpStatus`). No business logic in controllers.

**depends on:** TODO-004

**acceptance criteria (links to user stories):**
- POST returns 201 with todo body (US-001, US-002)
- GET list returns 200 with `{"items":[...]}` (US-003)
- GET by id returns 200 or 404 (US-004, US-008)
- PATCH returns 200 or 400 or 404 (US-005, US-007, US-008)
- DELETE returns 204 or 404 (US-006, US-008)
- GET /healthz returns 200 `{"status":"ok"}`

**test approach:** integration tests in `todos.controller.spec.ts` via supertest; each
test boots the full NestJS application

**complexity:** medium

---

## TODO-006: exception filter

**description:** Implement `ApiErrorFilter` in
`src/common/filters/api-error.filter.ts`. The filter must catch:
- `BadRequestException` from `ValidationPipe` → extract first class-validator message
- `NotFoundError` / `ValidationError` with pre-shaped body → pass through
- Other `HttpException` → derive code from status
- Non-HttpException → log + return 500 internal

Also implement `NotFoundError` and `ValidationError` typed exceptions.

**depends on:** TODO-002

**acceptance criteria:**
- every non-2xx response uses `{"error":{"code":"...","message":"..."}}` envelope
- `not_found`, `validation_error`, `internal` are the only valid codes emitted
- filter is wired globally in `main.ts`

**test approach:** filter behavior exercised by controller integration tests

**complexity:** small

---

## TODO-007: main.ts bootstrap

**description:** Write `src/main.ts`. Read `PORT` from the environment (default 3000).
Create the NestJS application, wire `ApiErrorFilter` globally, and call `app.listen`.
Log the startup port.

**depends on:** TODO-006

**acceptance criteria:**
- `node dist/main.js` starts successfully
- `GET /healthz` returns `{"status":"ok"}`
- default port is 3000; `PORT=9090` changes the bind port

**test approach:** manual smoke test with curl; automated by TODO-008 integration tests

**complexity:** small

---

## TODO-008: unit and integration tests

**description:** Write comprehensive tests covering all acceptance criteria. Include:
repository unit tests (TODO-003 extended), service unit tests (TODO-004 extended),
and controller integration tests using supertest (TODO-005 extended). Total: 15+ tests
covering every user story from US-001 through US-008.

**depends on:** TODO-007

**acceptance criteria:**
- `npm test` passes with zero failures
- each user story (US-001 through US-008) has at least one corresponding test case
- repository tests cover: create, findAll order, findById copy isolation, update, remove
- service tests cover: validation, not-found, due_at null-vs-absent
- controller tests cover: all six endpoints, happy-path + error-path

**test approach:** Jest + `@nestjs/testing` + supertest

**complexity:** medium

---

## TODO-009: Makefile, CI, and runbook

**description:** Write the `Makefile` with targets: `setup` (`npm install`), `run`
(`npm run start:dev`), `test` (`npm test`), `test-e2e` (`npm run test:e2e`), `lint`
(`npx tsc --noEmit`), `fmt` (noop with comment), `build` (`npm run build`). Write
`.github/workflows/ci.yml` that runs `npm ci`, `npm test`, and `npm run build` on push
and PR. Write `docs/maintenance/runbook.md` and `docs/maintenance/known-issues.md`.
Write `CHANGELOG.md` with `0.1.0` entry. Update workflow state to Phase 8: Maintenance.

**depends on:** TODO-008

**acceptance criteria:**
- `make setup && make test` passes from a clean clone
- `make lint` exits zero on valid TypeScript
- CI workflow runs green on the main branch
- runbook covers: start, stop, change port, read logs, restart
- known-issues documents in-memory limitation and no-auth warning
- `CHANGELOG.md` has `## [0.1.0] - 2026-05-16` entry listing all six endpoints

**test approach:** run all make targets locally before committing; CI is self-verifying

**complexity:** small
