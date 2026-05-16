# implementation plan — hello-todo-nextjs

## scope

Implement the six HTTP API endpoints, the server-rendered home page, and supporting
infrastructure described in `../requirements/prd.md` (FR-01 through FR-07) as a single
Node.js process using the Next.js App Router layered architecture specified in
`../architecture/system-design.md`.

All acceptance criteria are in `../requirements/acceptance-criteria.md`. All tasks are
listed in `tasks.md`.

---

## milestones overview

| milestone | description | target |
|---|---|---|
| v0.1.0 | first runnable todo app passing all acceptance criteria | 2026-05-16 |

Details in `milestones.md`.

---

## sequencing

Tasks are sequenced inside-out: shared types and repo first, then service, then route
handlers, then the home page, then tests and tooling. This order ensures each layer can
be tested in isolation before the layer above it is built.

```
TODO-001  project scaffolding (Next.js app skeleton, directory structure)
    └─ TODO-002  types and repo (Todo interface, src/lib/repo.ts)
           └─ TODO-003  service (src/services/todos.ts — business logic)
                  └─ TODO-004  route handlers (healthz + api/todos collection + item)
                         └─ TODO-005  home page (app/page.tsx server component)
                                └─ TODO-006  error handling (errorResponse helper,
                                              error codes)
                                       └─ TODO-007  unit and integration tests
                                              └─ TODO-008  Makefile, CI, runbook
```

---

## dependencies

| dependency | type | status |
|---|---|---|
| Node.js 22 | runtime | available |
| Next.js ^15.3.2 | framework | `npm install` on first build |
| React ^19.0.0 | peer dependency | `npm install` |
| Vitest ^3.1.4 | testing | `npm install` |
| @testing-library/react ^16.3.0 | component testing | `npm install` |
| `crypto` | Node stdlib | available |

No external database, cache, or message queue required.

---

## test strategy

| layer | approach | tool |
|---|---|---|
| repo | unit tests covering CRUD + id generation + insertion order; reset Map in `beforeEach` | Vitest |
| service | unit tests with real repo functions; verify validation and error propagation | Vitest |
| route handlers | integration tests using Next.js test utilities or direct handler invocation; HTTP assertions | Vitest |
| server component | render test asserting todo titles appear in output | Vitest + @testing-library/react |

All tests must pass with `npm test` from the repo root. Coverage target: all
acceptance criteria from `../requirements/acceptance-criteria.md` have at least one
corresponding test case.
