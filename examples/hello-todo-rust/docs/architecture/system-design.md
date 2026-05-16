# system design — hello-todo-rust

References: `../requirements/prd.md` (success criteria), `../specs/functional-spec.md`
(behavioral contract), `decisions/0001-rust-axum-hexagonal.md` (architectural choice).

---

## context

`hello-todo-rust` is a single-binary HTTP API that stores todo items in memory. Its
primary purpose is to be a readable, self-contained reference example; simplicity
is a first-class constraint alongside correctness. There are no external dependencies
at runtime (no database, no cache, no message queue).

---

## hexagonal architecture overview

```text
                        ┌─────────────────────────────┐
                        │       HTTP (Axum router)     │
                        │  adapters/inbound/http/      │
                        │  routes.rs                   │
                        └────────────┬────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │    Inbound Port Trait        │
                        │  ports/inbound.rs            │
                        └────────────┬────────────────┘
                                     │
         ┌───────────────────────────▼──────────────────────────┐
         │                    CORE DOMAIN                        │
         │           src/core/todo/                              │
         │   entity: Todo    service: TodoService (business)     │
         └───────────────────────────┬──────────────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │   Outbound Port Trait        │
                        │  ports/outbound.rs           │
                        └────────────┬────────────────┘
                                     │
                        ┌────────────▼────────────────┐
                        │   In-Memory Adapter          │
                        │  adapters/outbound/memory/   │
                        │  store.rs                    │
                        └─────────────────────────────┘
```

---

## components

### src/main.rs — composition root

Wires all adapters, creates the repository, creates the service, builds the Axum router,
and starts the HTTP server via `axum::serve`. The only file that imports all layers
together. Handles graceful shutdown via `tokio::signal`.

### src/core/todo/

- `entity.rs` — `Todo` struct; derives `serde::Serialize`/`Deserialize`; id generation
  via `uuid::Uuid::new_v4().simple()`
- `service.rs` — `TodoService` struct implementing the inbound port trait; contains
  all business logic (validation, `updated_at` stamping, id generation on create,
  `NotFound` error propagation)

### src/ports/inbound.rs

Trait `TodoServicePort` that HTTP handlers depend on via `State<Arc<dyn TodoServicePort>>`.
Defines: `create`, `list`, `get`, `update`, `delete`. Also defines the `CreateInput`,
`Patch`, and `TodoItem` types so the inbound port does not import the core domain struct
directly. Handlers reference only these types, never the concrete service.

### src/ports/outbound.rs

Trait `TodoRepository` that `TodoService` depends on. Defines: `save`, `find_all`,
`find_by_id`, `delete`. Exposes `RepositoryError::NotFound` so the service can map
storage errors to domain errors without importing the concrete adapter.

### src/adapters/inbound/http/handlers.rs

Axum handler functions for all six endpoints. Each handler extracts inputs via
`State`, `Path`, and `Json` extractors, calls the inbound port, maps the result to an
`AppError` or a typed response. Handlers do not import the core service directly.

### src/adapters/inbound/http/routes.rs

Constructs the `Router` and mounts all handlers. Called by `main.rs`. Applies
`TraceLayer::new_for_http()` at the top-level router.

### src/adapters/outbound/memory/store.rs

`MemoryStore` struct wrapping `Arc<RwLock<StoreInner>>`. `StoreInner` holds a
`HashMap<String, Todo>` and a `Vec<String>` for insertion-order tracking. All mutations
acquire a write lock; reads acquire a read lock. `find_by_id` returns a clone so callers
cannot mutate internal state.

---

## data flow

```text
Request → Axum router → handler (inbound adapter)
       → TodoServicePort (inbound port → core)
       → TodoRepository (outbound port → outbound adapter)
       → return value → handler → JSON response
```

Error flow: repository returns `RepositoryError::NotFound`; service converts it to a
domain `ServiceError::NotFound`; handler converts it to `AppError::NotFound`, which
implements `IntoResponse` and serializes to the uniform JSON error envelope.

---

## key tradeoffs

| tradeoff | choice | rationale |
|---|---|---|
| simplicity vs persistence | in-memory only | keeps the example readable; persistence is out of scope for v0.1.0 |
| hexagonal vs layered | hexagonal | demonstrates adapter swappability; teaches more about architecture boundaries |
| Axum vs Actix-Web | Axum | maintained by the Tokio team; simpler middleware story via `tower`; see ADR-0001 |
| uuid crate vs manual id generation | `uuid` crate | idiomatic for Rust; one dependency; v4 UUIDs provide sufficient entropy |
| structured logging | `tracing` + `tracing-subscriber` | idiomatic for async Rust; integrates with Axum's `TraceLayer` |

---

## deployment shape

Single Rust binary. Build and start with:

```bash
cargo build --release
PORT=8080 ./target/release/my-service
```

No containerization required for local development. The binary is self-contained; there
is no database to migrate, no secret manager to connect to, no sidecar required.

---

## observability

- **logging:** `tracing` to stdout via `tracing-subscriber` in JSON format.
  Log level controlled by `RUST_LOG` env var.
- **health check:** `GET /healthz` returns `{"status":"ok"}` while the process is alive.
- **metrics:** out of scope for v0.1.0.
- **tracing:** `TraceLayer::new_for_http()` instruments each request/response with span
  data; exporters are out of scope for v0.1.0.
