# tasks — hello-todo-rust

Tasks are sequenced domain-outward. See `implementation-plan.md` for the dependency
graph and test strategy. Acceptance criteria are in
`../requirements/acceptance-criteria.md`.

---

## TODO-001: domain entity and id generation

**description:** Define the `Todo` struct in `src/core/todo/entity.rs`. Implement
id generation using `uuid::Uuid::new_v4().simple()`. Derive `serde::Serialize` and
`serde::Deserialize`. Include field-level documentation comments. No business logic
in this task — entity only.

**depends on:** nothing

**acceptance criteria:**

- `Todo` struct has fields: `id: String`, `title: String`, `completed: bool`,
  `due_at: Option<DateTime<Utc>>`, `created_at: DateTime<Utc>`, `updated_at: DateTime<Utc>`
- id generation produces a non-empty 32-character lowercase hex string on every call
- crate compiles with `cargo build`

**test approach:** unit test asserting that two sequential ids are non-empty and unequal

**complexity:** small

---

## TODO-002: core service (business logic)

**description:** Implement `TodoService` in `src/core/todo/service.rs`. The service
implements the inbound port trait (`src/ports/inbound.rs`) and depends on the outbound
port trait (`src/ports/outbound.rs`). Business logic includes: title trim and validation,
`created_at`/`updated_at` stamping, id generation on create, `NotFound` error propagation
on get/update/delete.

**depends on:** TODO-001

**acceptance criteria (links to user stories):**

- title trim and length validation (US-007)
- `completed` defaults to false on create (US-001)
- `updated_at` changes on PATCH (US-005)
- returns `ServiceError::NotFound` when repository returns `RepositoryError::NotFound` (US-008)

**test approach:** unit tests with a hand-rolled stub repository implementing the
outbound trait

**complexity:** medium

---

## TODO-003: in-memory repository adapter

**description:** Implement the in-memory adapter `MemoryStore` in
`src/adapters/outbound/memory/store.rs`. Uses `Arc<RwLock<StoreInner>>` where
`StoreInner` holds `HashMap<String, Todo>` and `Vec<String>` for insertion-order
tracking. Implements the outbound `TodoRepository` trait:
`save`, `find_all`, `find_by_id`, `delete`. `find_by_id` returns a clone so callers
cannot mutate internal state.

**depends on:** TODO-001

**acceptance criteria:**

- `find_by_id` returns `RepositoryError::NotFound` when key is absent
- `delete` returns `RepositoryError::NotFound` when key is absent
- concurrent reads do not race with writes (verified by running tests with `RUSTFLAGS=-Zsanitizer=thread` or checked via `tokio::test` with concurrent tasks)

**test approach:** unit tests covering all four methods run under `#[tokio::test]`

**complexity:** small

---

## TODO-004: HTTP handlers

**description:** Implement Axum handler functions in
`src/adapters/inbound/http/handlers.rs`. Handlers extract inputs via `State`, `Path`,
and `Json` extractors, call the inbound port, and encode the response. Define `AppError`
implementing `IntoResponse` that maps `ServiceError::NotFound` to 404 and validation
errors to 400. Handlers must not import the core service directly — only the port trait.

**depends on:** TODO-002

**acceptance criteria (links to user stories):**

- POST returns 201 with todo body (US-001, US-002)
- GET list returns 200 with `{"items":[...]}` (US-003)
- GET by id returns 200 or 404 (US-004, US-008)
- PATCH returns 200 or 400 or 404 (US-005, US-007, US-008)
- DELETE returns 204 or 404 (US-006, US-008)
- health returns 200 `{"status":"ok"}`
- error responses use the uniform envelope

**test approach:** handler tests using `tower::ServiceExt::oneshot`; inject a stub service

**complexity:** medium

---

## TODO-005: route wiring

**description:** Wire all handlers to the Axum `Router` in
`src/adapters/inbound/http/routes.rs`. Mount todos under `/v1/todos` and health at
`/healthz`. Accept the inbound port as `State<Arc<dyn TodoServicePort + Send + Sync>>`.
Apply `TraceLayer::new_for_http()` at the top-level router.

**depends on:** TODO-004

**acceptance criteria:**

- all six URL patterns are registered on the router
- handler functions are connected to the correct HTTP methods and paths
- `TraceLayer` is applied once at the top level

**test approach:** a single integration-level test that sends requests to the router via
`oneshot` and confirms routing is correct (status code only)

**complexity:** small

---

## TODO-006: composition root (main.rs)

**description:** Write `src/main.rs`. Reads `PORT` env var (defaults to 8080).
Creates the `MemoryStore`, creates the core service wrapped in `Arc`, builds the router
via `routes::register`, starts `axum::serve` with a `tokio::net::TcpListener`.
Wires graceful shutdown using `tokio::signal::unix::signal(SignalKind::terminate)`
and `tokio::signal::ctrl_c`. Sets up `tracing-subscriber` with the JSON format
writing to stdout; log level from `RUST_LOG` env var.

**depends on:** TODO-003, TODO-005

**acceptance criteria:**

- `cargo run` starts successfully
- `GET /healthz` returns `{"status":"ok"}`
- default port is 8080; `PORT=9090` changes the bind port
- graceful shutdown logs `"shutting down"` then exits 0 on SIGTERM

**test approach:** manual smoke test with curl; automated in TODO-008 via `make run`

**complexity:** small

---

## TODO-007: unit and integration tests

**description:** Write comprehensive tests covering all acceptance criteria in
`../requirements/acceptance-criteria.md`. Include: service unit tests (TODO-002
extended), repository unit tests (TODO-003 extended), handler tests with `oneshot`,
and at least one end-to-end integration test under `tests/` that binds a real listener
on port 0 and exercises all six endpoints.

**depends on:** TODO-006

**acceptance criteria:**

- `cargo test` passes with zero failures
- each user story (US-001 through US-008) has at least one corresponding test case

**test approach:** `#[tokio::test]` throughout; `tower::ServiceExt::oneshot` for handler
tests; `reqwest` or `hyper` client for the end-to-end integration test

**complexity:** medium

---

## TODO-008: Makefile and CI

**description:** Write the `Makefile` with targets: `setup` (install toolchain),
`run` (start server), `test` (`cargo test`), `clippy` (`cargo clippy -- -D warnings`),
`fmt` (`cargo fmt --all -- --check`), `build` (compile binary to `./target/release/my-service`),
`smoke` (start server, run curl assertions, stop server). Write
`.github/workflows/ci.yml` that runs `make test`, `make clippy`, and `make fmt` on
push and PR.

**depends on:** TODO-007

**acceptance criteria:**

- `make setup && make test` passes from a clean clone
- `make clippy` exits zero on lint-clean code
- `make fmt` exits zero on correctly formatted code
- CI workflow runs green on the main branch

**test approach:** run all make targets locally before committing; CI is self-verifying

**complexity:** small

---

## TODO-009: runbook and docs polish

**description:** Write `docs/maintenance/runbook.md` (start/stop, log inspection, known
issues) and `docs/maintenance/known-issues.md` (in-memory storage limitation,
no auth, id not time-ordered). Write `CHANGELOG.md` with a `0.1.0` entry. Review all
phase docs for consistency. Update `workflow-state.md` and `active-task.md` to reflect
milestone complete.

**depends on:** TODO-008

**acceptance criteria:**

- runbook covers: how to start, stop, change port, read logs, and restart the service
- known-issues documents the in-memory storage limitation and links to the v0.2.0
  parking-lot item in `milestones.md`
- `CHANGELOG.md` has a `## [0.1.0] — 2026-05-17` entry listing all six endpoints
- `workflow-state.md` current phase = Phase 8: Maintenance, milestone = v0.1.0 shipped

**test approach:** doc review; verify all cross-links resolve

**complexity:** small
