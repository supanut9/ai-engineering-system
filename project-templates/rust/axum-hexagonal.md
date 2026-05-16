# Rust Axum Hexagonal

## Use When

Use this blueprint when:

- the stack is Rust
- the HTTP framework is Axum
- the code architecture is hexagonal architecture
- the service has multiple integrations or clear inbound and outbound adapter
  boundaries — or you expect it to grow there

## Stack

- language: Rust (edition 2024, MSRV 1.85)
- HTTP framework: Axum 0.8
- async runtime: Tokio 1.45 (multi-threaded)
- default database: PostgreSQL via `sqlx` (added when persistence is needed)

See [`stacks/rust.md`](../../stacks/rust.md) and
[`stacks/axum.md`](../../stacks/axum.md) for the full stack profile.

## Code Architecture

- style: hexagonal architecture
- the **core** (under `src/core/`) has no axum, no tokio-specific types, and no
  database crates in its dependency surface
- **ports** (`src/ports/`) describe the use cases the core offers (inbound) and
  what the core needs from the outside world (outbound)
- **adapters** (`src/adapters/`) implement ports; the HTTP adapter lives under
  `src/adapters/inbound/http/`

## Bootstrap

Initial setup:

```bash
cargo build
cargo test
```

No `cargo init` or `cargo new` is required — the skeleton ships a complete
`Cargo.toml`. Adjust `[package].name` from `my-service` to your project name
before publishing.

## Folder Structure

```text
Cargo.toml
src/
  main.rs                       # entrypoint — wires adapters + core
  lib.rs                        # public module surface (integration tests)
  core/
    health.rs
    mod.rs
  ports/
    inbound.rs                  # use-case traits the core fulfils
    outbound.rs                 # traits the core needs externally
    mod.rs
  adapters/
    inbound/
      http/
        handlers.rs
        routes.rs
        mod.rs
      mod.rs
    mod.rs
tests/                          # cargo integration tests
docs/
  requirements/
  specs/
  architecture/
  plan/
  tests/
  release/
  maintenance/
.ai/
  workflow/
```

## Folder Responsibilities

- `src/main.rs` = composition root — constructs core services, wires adapters,
  runs `axum::serve`
- `src/lib.rs` = re-exports so integration tests under `tests/` can reach into
  the crate without going through `main`
- `src/core/` = protected business logic; depends only on standard library and
  serde (for shared DTOs)
- `src/ports/inbound.rs` = traits the inbound adapters call into
- `src/ports/outbound.rs` = traits the core depends on; concrete adapters live
  under `src/adapters/outbound/`
- `src/adapters/inbound/http/` = axum router, handlers, and HTTP-specific
  translation (`State`, `Json`, status codes)

## Required Workflow Files

- `AGENTS.md` or `CLAUDE.md` depending on tool
- `.ai/workflow/project-context.md`
- `.ai/workflow/workflow-state.md`
- `.ai/workflow/active-task.md`

## Notes

- use axum only as an inbound adapter; the core never imports `axum` or `tokio`
  beyond `tokio::sync` primitives that aren't tied to the runtime
- define ports only where they protect a real boundary — when a concrete struct
  has only one implementation and is not crossing a deployment line, the trait
  is premature
- prefer this blueprint over a flat `src/` layout when there is at least one
  outbound integration (database, message broker, third-party API) or when
  growth in that direction is on the next milestone
- when adding persistence, create `src/adapters/outbound/postgres/` and an
  outbound port that exposes only the operations the core needs (not a generic
  "Repository" interface)
- the skeleton's `routes::register` returns `Router`, not `Router<S>` — keeping
  the router opaque to callers makes it trivial to compose multiple resource
  routers without leaking shared state through the type signature
