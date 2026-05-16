# {{PROJECT_NAME}}

A Rust + Axum HTTP service organised as a hexagonal architecture. Bootstrapped from the AI Engineering System.

## Quickstart

```bash
make setup
make test
make run    # listens on :8080 by default; override with PORT=...
```

`GET /healthz` returns `{"ok": true}` and is wired through the hexagonal layers (router → handler → inbound port → core service).

## Layout

```text
src/
  main.rs                       # entrypoint — composes adapters + core
  lib.rs                        # public module surface (for integration tests)
  core/                         # protected business logic
    health.rs
  ports/
    inbound.rs                  # use-case traits the core fulfils
    outbound.rs                 # traits the core needs from the outside world
  adapters/
    inbound/
      http/
        handlers.rs             # axum handler functions
        routes.rs               # router wiring
tests/                          # cargo integration tests live here
```

## Conventions

- Core code (under `src/core/`) **does not depend on adapters or external crates** except `serde`. Add a port trait before reaching for an external dependency.
- Inbound ports describe the use cases the service offers (e.g. `HealthChecker`); outbound ports describe what the core needs (databases, message brokers).
- Handlers translate transport (`State`, `Json`, status codes) into port-method calls. Keep them thin.

## Next steps

1. Open `.ai/workflow/project-context.md` and complete Phase 0 intake.
2. Read `CLAUDE.md` (or `.codex/`) and the workflow phase docs.
3. Add your first port + adapter pair following the same shape as `HealthChecker` + `healthz`.
