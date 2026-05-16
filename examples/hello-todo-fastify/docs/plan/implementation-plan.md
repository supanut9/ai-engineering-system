# implementation plan — hello-todo-fastify

## scope

Implement the six HTTP endpoints and supporting infrastructure described in
`../requirements/prd.md` (FR-01 through FR-06) as a single Node.js process using the
hexagonal architecture specified in `../architecture/system-design.md`.

All acceptance criteria are in `../requirements/acceptance-criteria.md`. All tasks are
listed in `tasks.md`.

---

## milestones overview

| milestone | description | target |
|---|---|---|
| v0.1.0 | first runnable todo API passing all acceptance criteria | 2026-05-16 |

Details in `milestones.md`.

---

## sequencing

Tasks are sequenced domain-outward: domain entity first, then service, then repository
adapter, then HTTP routes, then composition root. Tests, Makefile/CI, and runbook follow
once the core is stable.

```
TODO-001  domain entity (Todo interface, createTodo factory)
    └─ TODO-002  core service (business logic, port interface)
           └─ TODO-003  in-memory repository adapter
                  └─ TODO-004  Zod schemas + Fastify routes
                         └─ TODO-005  error handler
                                └─ TODO-006  composition root (index.ts)
                                       └─ TODO-007  unit + integration tests (Vitest)
                                              └─ TODO-008  Makefile + CI
                                                     └─ TODO-009  runbook + docs polish
```

---

## dependencies

| dependency | type | status |
|---|---|---|
| Node.js 22 LTS | runtime | available |
| TypeScript 6.0.3 | language | installed via `npm ci` |
| Fastify 5.8.5 | HTTP framework | installed via `npm ci` |
| Zod 4.4.3 | schema validation | installed via `npm ci` |
| `fastify-type-provider-zod` 6.1.0 | type bridge | installed via `npm ci` |
| `uuid` 11.1.0 | id generation | installed via `npm ci` |
| pino 10.3.1 | logging | installed via `npm ci` |
| Vitest 4.1.6 | test runner | installed via `npm ci` |
| `tsx` 4.22.0 | dev runner | installed via `npm ci` |

No external database, cache, or message queue required.

---

## test strategy

| layer | approach | tool |
|---|---|---|
| core service | unit tests with a stub repository implementing `TodoRepository` | Vitest |
| in-memory repository | unit tests exercising CRUD operations | Vitest |
| HTTP routes (integration) | route tests using `fastify.inject()`; full app wired to real memory store | Vitest |
| full stack smoke test | integration test: build app, call all six routes via `fastify.inject()`, assert status and body | Vitest (`make test`) |

All tests must pass with `npm test` from the repo root. Coverage target: all
acceptance criteria from `../requirements/acceptance-criteria.md` have at least one
corresponding test case.

`fastify.inject()` fires HTTP requests directly through Fastify's dispatch without
opening a real TCP socket. This avoids port conflicts and is the idiomatic Fastify
testing pattern, analogous to `httptest.NewRecorder` in Go.
