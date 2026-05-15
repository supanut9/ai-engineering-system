# implementation plan — hello-todo-fastapi

## scope

Implement the six HTTP endpoints and supporting infrastructure described in
`../requirements/prd.md` (FR-01 through FR-06) as a single Python process using the
layered architecture specified in `../architecture/system-design.md`.

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

Tasks are sequenced domain-outward: models first, then repository, then service, then
HTTP handlers, then composition root. Tests, Makefile/CI, and runbook follow once the
core is stable.

```
TODO-001  Pydantic models + error types
    └─ TODO-002  in-memory repository
           └─ TODO-003  todo service (business logic)
                  └─ TODO-004  HTTP handlers (api/todos.py)
                         └─ TODO-005  app factory + exception handlers (main.py)
                                └─ TODO-006  settings + logging
                                       └─ TODO-007  unit + integration tests
                                              └─ TODO-008  Makefile + CI
                                                     └─ TODO-009  runbook + docs polish
```

---

## dependencies

| dependency | type | status |
|---|---|---|
| Python 3.12 | language runtime | available |
| FastAPI 0.136.1 | HTTP framework | `pip install` on first build |
| Pydantic 2.13.4 | validation + serialisation | `pip install` on first build |
| pydantic-settings 2.14.1 | settings | `pip install` on first build |
| uvicorn[standard] 0.47.0 | ASGI server | `pip install` on first build |
| `asyncio`, `secrets`, `logging` | Python stdlib | available |
| httpx 0.28.1 | HTTP test client | `pip install -e .[dev]` |
| pytest 9.0.3, pytest-asyncio 1.3.0 | testing | `pip install -e .[dev]` |

No external database, cache, or message queue required.

---

## test strategy

| layer | approach | tool |
|---|---|---|
| models | unit tests exercising validation rules | `pytest` |
| repository | unit tests exercising CRUD operations and lock safety | `pytest` + `asyncio` |
| service | unit tests with a stub repository | `pytest` |
| HTTP handlers | end-to-end tests via `TestClient` (HTTPX synchronous wrapper) | FastAPI `TestClient` |
| full stack smoke test | manual curl sequence against a running process | `make run` + curl |

All tests must pass with `pytest` from the repo root. Coverage target: all acceptance
criteria from `../requirements/acceptance-criteria.md` have at least one corresponding
test case.
