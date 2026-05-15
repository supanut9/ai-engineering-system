# implementation plan — hello-todo-nestjs

## scope

Implement the six HTTP endpoints and supporting infrastructure described in
`../requirements/prd.md` (FR-01 through FR-06) as a single Node.js process using the
NestJS layered architecture specified in `../architecture/system-design.md`.

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

Tasks are sequenced module-inward: entity/DTO shapes first, then repository, then
service, then controller, then filter, then bootstrap. Tests, Makefile/CI, and runbook
follow once the core is stable.

```
TODO-001  module scaffolding (directory structure, modules declared)
    └─ TODO-002  entity and DTOs (Todo, CreateTodoDto, UpdateTodoDto)
           └─ TODO-003  in-memory repository (TodosRepository)
                  └─ TODO-004  service (TodosService — business logic)
                         └─ TODO-005  controller (TodosController — HTTP layer)
                                └─ TODO-006  exception filter (ApiErrorFilter)
                                       └─ TODO-007  main.ts bootstrap
                                              └─ TODO-008  unit and integration tests
                                                     └─ TODO-009  Makefile, CI, runbook
```

---

## dependencies

| dependency | type | status |
|---|---|---|
| Node.js 22 | runtime | available |
| NestJS ^11.1.21 | framework | `npm install` on first build |
| class-validator ^0.15.1 | validation | `npm install` |
| class-transformer ^0.5.1 | validation support | `npm install` |
| Jest ^29.7.0 + ts-jest | testing | `npm install` |
| supertest ^7.2.2 | HTTP test client | `npm install` |
| `crypto`, `reflect-metadata` | Node stdlib / NestJS peer | available |

No external database, cache, or message queue required.

---

## test strategy

| layer | approach | tool |
|---|---|---|
| repository | unit tests covering CRUD + id generation + insertion order | Jest |
| service | unit tests with real repository instance; verify validation and error propagation | Jest + `@nestjs/testing` |
| controller + full stack | integration tests booting the full NestJS app via `Test.createTestingModule`; HTTP assertions via supertest | Jest + supertest |

All tests must pass with `npm test` from the repo root. Coverage target: all
acceptance criteria from `../requirements/acceptance-criteria.md` have at least one
corresponding test case.
