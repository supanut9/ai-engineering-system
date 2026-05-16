# implementation plan — hello-todo-rust

## scope

Implement the six HTTP endpoints and supporting infrastructure described in
`../requirements/prd.md` (FR-01 through FR-06) as a single Rust binary using the
hexagonal architecture specified in `../architecture/system-design.md`.

All acceptance criteria are in `../requirements/acceptance-criteria.md`. All tasks are
listed in `tasks.md`.

---

## milestones overview

| milestone | description | target |
|---|---|---|
| v0.1.0 | first runnable todo API passing all acceptance criteria | 2026-05-17 |

Details in `milestones.md`.

---

## sequencing

Tasks are sequenced domain-outward: domain entity first, then service, then repository
adapter, then HTTP handlers, then routing, then composition root. Tests, Makefile/CI, and
runbook follow once the core is stable.

```text
TODO-001  domain entity + id generation
    └─ TODO-002  core service (business logic)
           └─ TODO-003  in-memory repository adapter
                  └─ TODO-004  HTTP handlers
                         └─ TODO-005  route wiring
                                └─ TODO-006  composition root (main.rs)
                                       └─ TODO-007  unit + integration tests
                                              └─ TODO-008  Makefile + CI
                                                     └─ TODO-009  runbook + docs polish
```

---

## dependencies

| dependency | type | status |
|---|---|---|
| Rust edition 2024, MSRV 1.85 | language toolchain | install via `rustup` |
| Axum 0.8 | HTTP framework | `cargo add axum` |
| Tokio 1.45 | async runtime | `cargo add tokio --features full` |
| tower-http 0.6 | middleware | `cargo add tower-http --features trace` |
| serde + serde_json 1.0 | serialization | `cargo add serde --features derive && cargo add serde_json` |
| uuid 1.x | id generation | `cargo add uuid --features v4` |
| tracing + tracing-subscriber 0.1/0.3 | logging | `cargo add tracing tracing-subscriber` |
| chrono 0.4 | timestamp handling | `cargo add chrono --features serde` |

No external database, cache, or message queue required.

---

## test strategy

| layer | approach | tool |
|---|---|---|
| core service | unit tests with a hand-rolled stub repository implementing the outbound trait | `#[tokio::test]` |
| in-memory repository | unit tests exercising CRUD operations and concurrency safety | `#[tokio::test]` |
| HTTP handlers | handler tests using `tower::ServiceExt::oneshot` against the full router | `#[tokio::test]` |
| full stack smoke test | integration test: bind to `127.0.0.1:0`, run HTTP requests, assert responses | `#[tokio::test]` in `tests/` |

All tests must pass with `cargo test` from the repo root. Coverage target: all
acceptance criteria from `../requirements/acceptance-criteria.md` have at least one
corresponding test case.
