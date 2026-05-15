# implementation plan — hello-todo-go

## scope

Implement the six HTTP endpoints and supporting infrastructure described in
`../requirements/prd.md` (FR-01 through FR-06) as a single Go binary using the
hexagonal architecture specified in `../architecture/system-design.md`.

All acceptance criteria are in `../requirements/acceptance-criteria.md`. All tasks are
listed in `tasks.md`.

---

## milestones overview

| milestone | description | target |
|---|---|---|
| v0.1.0 | first runnable todo API passing all acceptance criteria | 2026-05-15 |

Details in `milestones.md`.

---

## sequencing

Tasks are sequenced domain-outward: domain entity first, then service, then repository
adapter, then HTTP handlers, then routing, then composition root. Tests, Makefile/CI, and
runbook follow once the core is stable.

```
TODO-001  domain entity + id generation
    └─ TODO-002  core service (business logic)
           └─ TODO-003  in-memory repository adapter
                  └─ TODO-004  HTTP handlers
                         └─ TODO-005  route wiring
                                └─ TODO-006  composition root (main.go)
                                       └─ TODO-007  unit + integration tests
                                              └─ TODO-008  Makefile + CI
                                                     └─ TODO-009  runbook + docs polish
```

---

## dependencies

| dependency | type | status |
|---|---|---|
| Go 1.23 | language runtime | available |
| Gin v1.10.0 | HTTP framework | `go get` on first build |
| `sync`, `crypto/rand`, `log/slog` | Go stdlib | available |
| `net/http/httptest` | test stdlib | available |

No external database, cache, or message queue required.

---

## test strategy

| layer | approach | tool |
|---|---|---|
| core service | unit tests with a mock or stub repository | `testing` package |
| in-memory repository | unit tests exercising CRUD operations and concurrency safety | `testing` package |
| HTTP handlers | handler tests using `httptest.NewRecorder` and `httptest.NewServer` | `net/http/httptest` |
| full stack smoke test | integration test: start real server, run curl assertions | `make test-integration` (added in TODO-008) |

All tests must pass with `go test ./...` from the repo root. Coverage target: all
acceptance criteria from `../requirements/acceptance-criteria.md` have at least one
corresponding test case.
