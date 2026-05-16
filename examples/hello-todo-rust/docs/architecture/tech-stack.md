# tech stack — hello-todo-rust

| layer | choice | version | notes |
|---|---|---|---|
| language | Rust | edition 2024, MSRV 1.85 | verified 2026-05-17; edition 2024 requires MSRV 1.85 |
| http framework | Axum | 0.8 | Tokio-team maintained; type-safe extractors; `tower` middleware ecosystem |
| async runtime | Tokio | 1.45 | multi-threaded; `features = ["full"]` for server binaries |
| middleware | tower-http | 0.6 | `TraceLayer` for per-request spans; `TimeoutLayer` for request timeouts |
| storage | in-memory map | — | `HashMap<String, Todo>` inside `Arc<tokio::sync::RwLock<_>>`; no external storage dependency |
| serialization | serde + serde_json | 1.0 | derive macros; handles JSON request/response encoding |
| id generation | uuid | 1.x | `Uuid::new_v4().simple()` produces 32-char lowercase hex; no monotonic guarantee needed for in-memory |
| logging | tracing + tracing-subscriber | 0.1 / 0.3 | structured spans and events; JSON format via `tracing-subscriber::fmt::json()` |
| http testing | axum `TestClient` / `tower::ServiceExt::oneshot` | — | in-process handler tests without a real listener |
| unit testing | `#[tokio::test]` | — | async test macro from Tokio; no third-party assertion library |
| linting | cargo clippy | bundled | `cargo clippy -- -D warnings` enforced in CI |
| formatting | cargo fmt | bundled | `cargo fmt --all -- --check` enforced in CI |
| ci | GitHub Actions | — | see `.github/workflows/ci.yml`; runs `cargo test`, `cargo clippy`, `cargo fmt --check` |

---

## notes

### linting

`cargo clippy -- -D warnings` is enforced in CI. All clippy warnings are treated as
errors. The system's `tooling/rust/clippy.toml` adds project-wide lint configuration;
that file can be adopted for this example once it ships.

### no external runtime dependencies

All imports are from the Rust standard library, Tokio, Axum, serde, uuid, and tracing.
There is no database, message broker, or external service call at runtime.

### future additions (out of scope for v0.1.0)

| capability | candidate | when |
|---|---|---|
| persistent storage | `sqlx` + SQLite or Postgres | v0.2.0 |
| metrics | `metrics` crate + Prometheus exporter | when observability is required |
| distributed tracing | `opentelemetry` + `tracing-opentelemetry` | when tracing is required |
| containerization | multi-stage `Dockerfile` with `scratch` or `distroless` final image | when CI deploy is added |
