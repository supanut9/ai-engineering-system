# ADR 0001: use Rust + Axum + hexagonal architecture

## status

Accepted
Date: 2026-05-17

## context

Problem:

- The ai-engineering-system needs a second fully filled-in reference example that
  demonstrates the 8-phase workflow for a real HTTP API, this time using Rust.
- The example must be small enough to read in full, but architecturally rich enough to
  teach meaningful patterns.

Constraints:

- The service must be a single binary with no external runtime dependencies.
- It must exercise the hexagonal architecture pattern documented in
  `code-architectures/hexagonal-architecture.md`.
- Implementation must complete in one focused developer-day.
- Long-term maintenance cost is weighted more heavily than first-version speed,
  consistent with the Rust stack profile in `stacks/rust.md`.

Forces at play:

- Simplicity: fewer moving parts means the architecture is easier to see.
- Teaching value: the example should show port/adapter boundaries clearly.
- Correctness: Rust's type system encodes invariants that would be runtime checks
  in other languages; the example should demonstrate this thesis.
- Dependency minimalism: no ORM, no external DB, no message queue reduces noise.

## decision

Use Rust edition 2024 with MSRV 1.85, the Axum 0.8 HTTP framework, and a hexagonal
(ports-and-adapters) architecture. The core domain (`src/core/todo/`) is isolated from
HTTP and storage concerns via two port traits: `ports/inbound.rs` (what handlers call)
and `ports/outbound.rs` (what the service calls). Handlers receive the inbound port as
`State<Arc<dyn TodoServicePort + Send + Sync>>` — this keeps them generic and avoids
importing the concrete service type. The outbound trait (`TodoRepository`) defines
`save`, `find_all`, `find_by_id`, and `delete`; the concrete adapter is an in-memory
`MemoryStore` backed by `tokio::sync::RwLock`. This makes the architecture boundaries
explicit and swappable without any external library.

Id generation uses `uuid::Uuid::new_v4().simple()` (32 lowercase hex characters) — one
lightweight crate, no custom entropy code.

Structured logging uses `tracing` + `tracing-subscriber`; Axum's `TraceLayer` wires the
two together automatically so each HTTP request gets a span with method, path, status,
and latency.

See `../system-design.md` for the full component breakdown and ASCII diagram.

## consequences

Positive:

- the port traits enforce the dependency inversion principle in a visible way; the
  compiler rejects code that crosses the wrong boundary
- swapping the in-memory adapter for a database adapter (v0.2.0) requires no changes
  to the core service or inbound port
- the single-binary deployment shape (no runtime, no GC) demonstrates Rust's
  deployment advantage
- Axum's type-driven extractors (`State`, `Path`, `Json`) catch handler signature
  mismatches at compile time, not at runtime
- `tracing` integrates natively with Axum's `TraceLayer` and is the standard for
  async Rust observability

Negative:

- hexagonal introduces more files and traits than a simple layered structure; a
  beginner might find it intimidating for a service with one entity
- Rust compile times are longer than Go or Node.js; full `cargo build` on a cold
  cache may take 30–60 seconds
- MSRV 1.85 is required for edition 2024; teams on older stable toolchains must
  update

Neutral:

- the in-memory store means the example cannot demonstrate migrations or schema
  evolution; those concerns are deferred to a future example
- `Arc<dyn Trait>` trait objects add a small indirection cost at call sites; for this
  in-memory example the cost is immeasurable

## alternatives considered

| alternative | why not chosen |
|---|---|
| Go + Gin | Go is the primary reference example (`hello-todo-go`); this example exists specifically to demonstrate Rust + Axum; the two together show the same hexagonal pattern in different languages |
| Actix-Web | comparable performance to Axum; however Axum has a cleaner middleware story via `tower::Layer` and is maintained directly by the Tokio team; `tower` interop makes adding auth, tracing, and timeout layers predictable |
| Rocket | explicit macro-driven routing was the Rocket hallmark, but Rocket 0.5 adoption has been slower than Axum; ecosystem momentum and `tower` compatibility favour Axum |
| flat `src/main.rs` with no ports | valid for a truly minimal service; rejected because the teaching goal is to demonstrate hexagonal boundaries, not the simplest possible Rust HTTP server |

## links

- PRD: `../../requirements/prd.md` — non-goals (no auth, in-memory only)
- system design: `../system-design.md` — component breakdown and data flow
- architecture reference: `code-architectures/hexagonal-architecture.md` (system repo root)
- tech stack: `../tech-stack.md` — version pins
- project template: `project-templates/rust/axum-hexagonal.md`
