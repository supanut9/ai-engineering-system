# Stack Profile: Axum

## What It Is

Axum is a Rust HTTP framework built on `tokio`, `hyper`, and the `tower`
middleware ecosystem. It is maintained by the Tokio team and is the dominant
choice for async HTTP services in Rust as of 2026.

Axum favours:

- type-driven handler signatures — extractors (`State`, `Path`, `Json`, `Query`)
  and rejections are part of each handler's type, so missing parameters fail at
  compile time
- composable middleware via `tower::Layer`
- explicit router wiring instead of attribute-driven discovery

## Use When

Use axum when:

- the language is already Rust (see [`rust.md`](rust.md))
- the service is an HTTP API, gateway, or web app backend
- middleware composition (auth, tracing, rate limit, retry) is a first-class
  concern
- type-safe handler signatures are a meaningful design tool, not a chore

## Avoid When

- the team is not yet productive in Rust — pick a stack the team can ship in
- the service is so small that `hyper` + a handful of match arms is enough
- you need a framework with batteries-included auth/admin/scaffolding —
  consider `loco` (Rails-like for Rust) or a different language

## Typical Use Cases

- public HTTP APIs and webhooks
- internal RPC-over-HTTP services
- BFF (backend-for-frontend) layers
- WebSocket gateways (axum has first-class WS support)

## Tooling Versions (verified 2026-05-17)

- `axum`: **0.8**
- `tokio`: **1.45** (features: `full` for servers; trim for libraries)
- `tower`: **0.5**
- `tower-http`: **0.6** (TraceLayer, CorsLayer, TimeoutLayer, CompressionLayer)
- `serde`: **1.0** (with `derive`)
- `tracing`: **0.1** + `tracing-subscriber` **0.3**

## Layout (Hexagonal)

axum is an **inbound adapter** — it lives under
`src/adapters/inbound/http/`. It never appears in the core or in port
definitions. The boundary looks like:

```text
src/
  core/                         # business logic, no axum imports
  ports/
    inbound.rs                  # use-case traits the core fulfils
    outbound.rs                 # traits the core needs externally
  adapters/
    inbound/
      http/
        handlers.rs             # axum handlers — translate State/Json to ports
        routes.rs               # Router::new()...with_state(...)
```

A handler should be small enough to read at a glance: extract inputs, call a
port method, map the result to a response.

## Conventions

- One `Router` constructor function per logical resource group; compose them in
  `routes::register`.
- Use `State<Arc<dyn SomeTrait>>` for trait-object state when the handler must
  remain generic; use `State<MyConcreteService>` when the service is concrete
  and Clone-friendly.
- Apply `TraceLayer::new_for_http()` once at the top-level router, not per
  route.
- Define a single `AppError` type that implements `IntoResponse` and convert
  domain errors into it at the handler boundary; do not return `anyhow::Error`
  from handlers directly.
- Integration tests use `axum::serve` against a `TcpListener::bind("127.0.0.1:0")`
  or `tower::ServiceExt::oneshot` for in-process testing without a network.

## Middleware Order Gotcha

`tower` middleware applies in reverse declaration order — the layer added last
runs first on the request path. The conventional order (auth before logging,
logging before timeout, timeout before the route) is therefore:

```rust
Router::new()
    .route("/", ...)
    .layer(TimeoutLayer::new(Duration::from_secs(30)))
    .layer(TraceLayer::new_for_http())
    .layer(auth_layer);
```

Document this in any project that adds non-trivial middleware — it is the
single most common axum pitfall.

## When Not To Reach For axum-extra

`axum-extra` provides convenience extractors (typed-header, cookie, query),
but each one couples your handlers to that crate. Prefer the core axum
extractors when they suffice; reach for `axum-extra` only when it eliminates
real boilerplate, not for ergonomic preference alone.
