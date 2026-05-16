# hello-todo-rust

A minimal, single-user todo-list HTTP API built with Rust and Axum, structured with hexagonal architecture. It serves as the Rust counterpart to `hello-todo-go` — every layer from domain entity through HTTP adapter is filled in and tested.

Bootstrapped from ai-engineering-system v0.0.1 using the `rust-axum-hexagonal` skeleton.

## Quickstart

```bash
make setup   # cargo fetch
make test    # cargo test --all-features
make run     # starts the server on :8080

# In a second terminal:
curl -s localhost:8080/healthz
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"buy milk"}' localhost:8080/v1/todos
curl -s localhost:8080/v1/todos
```

Environment variable `PORT` overrides the default port `8080`.

## Endpoints

| Method | Path          | Description       | Success |
|--------|---------------|-------------------|---------|
| GET    | /healthz      | Health check      | 200     |
| POST   | /v1/todos     | Create a todo     | 201     |
| GET    | /v1/todos     | List all todos    | 200     |
| GET    | /v1/todos/:id | Get a single todo | 200     |
| PATCH  | /v1/todos/:id | Partial update    | 200     |
| DELETE | /v1/todos/:id | Delete a todo     | 204     |

Error responses use `{"error": {"code": "...", "message": "..."}}` with codes `validation_error`, `not_found`, or `internal`.

## Project layout

```
src/
  main.rs                          — composition root + graceful shutdown
  lib.rs                           — pub mod declarations
  core/
    health.rs                      — HealthService → HealthStatus
    todo/
      entity.rs                    — Todo struct + NewTodo validation
      repository.rs                — TodoRepository trait + Error enum
      service.rs                   — Service impl (create/list/get/update/delete)
  ports/
    inbound.rs                     — HealthChecker + TodoService traits + DTOs
    outbound.rs                    — re-export TodoRepository for adapters
  adapters/
    inbound/http/
      handlers.rs                  — Axum handler functions
      routes.rs                    — Router wiring
    outbound/memory/
      store.rs                     — RwLock<HashMap> + insertion-order Vec
```

## Makefile targets

| Target           | Description                                               |
|------------------|-----------------------------------------------------------|
| setup            | `cargo fetch`                                             |
| run              | `cargo run --bin api`                                     |
| test             | `cargo test --all-features`                               |
| test-integration | builds binary, smoke-tests `/healthz` and `/v1/todos`     |
| lint             | `cargo fmt --check` + `cargo clippy -D warnings`          |
| lint-fix         | auto-fix formatting and clippy suggestions                |
| fmt              | `cargo fmt --all`                                         |
| build            | `cargo build --release --bin api`                         |
| clean            | `cargo clean`                                             |

## Full workflow docs

See `docs/` for the complete Phase 0–8 artifacts mirrored from the Go example. Start with `docs/requirements/project-brief.md`, then follow the phases in order.

This example was bootstrapped from ai-engineering-system v0.0.1 using the `rust-axum-hexagonal` skeleton.
