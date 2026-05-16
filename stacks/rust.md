# Stack Profile: Rust

## What It Is

Rust is a statically typed, compiled systems language with strong memory and
thread-safety guarantees enforced at compile time. The toolchain (rustc, cargo,
clippy, rustfmt) is unified and consistent.

Use Rust when you want:

- predictable performance and memory behavior without a garbage collector
- aggressive compile-time correctness — most concurrency bugs are caught before
  the program runs
- a single binary deployable with no runtime dependency
- a strong type system that encodes invariants (ownership, lifetimes, Result,
  Option) into the API surface

## Use When

Use Rust when:

- the service has strict latency or tail-latency requirements
- you need to interop with C/C++ libraries or embedded systems
- correctness-critical code paths benefit from algebraic data types and pattern
  matching
- the team is comfortable with a stronger type system in exchange for slower
  initial development velocity
- long-term maintenance cost matters more than first-version speed

## Avoid When

Avoid Rust as the default choice when:

- the team would be much more productive in Go, Python, or TypeScript for the
  same problem
- the service is a thin CRUD API where Rust's correctness guarantees are not
  paying for the learning curve
- iteration speed matters more than absolute performance
- there is no in-team Rust expertise and no time budget to build it

## Typical Use Cases

- low-latency HTTP APIs
- high-throughput stream processors
- CLI tooling that needs to be a single binary
- background workers with strict memory ceilings
- WebAssembly modules

## Tooling Versions (verified 2026-05-17)

- Rust edition: **2024**
- MSRV (minimum supported Rust version): **1.85** — required for edition 2024
- Toolchain installer: `rustup`
- Formatter: `rustfmt` (bundled with toolchain; configured via `rustfmt.toml`)
- Linter: `clippy` (bundled with toolchain; configured via `clippy.toml` and
  per-crate `#![warn(clippy::...)]`)
- Build tool: `cargo` (bundled)
- Audit: `cargo-audit` (run in CI to flag advisories)
- Coverage (optional): `cargo-llvm-cov`

## Conventions

- Pin the edition in `Cargo.toml` (`edition = "2024"`) and the MSRV
  (`rust-version = "1.85"`).
- Use workspace inheritance once the project has two or more crates;
  single-binary services keep one `Cargo.toml`.
- Treat `clippy::all` and `clippy::pedantic` as warnings, then ratchet specific
  lints to deny in CI (`cargo clippy -- -D warnings`).
- Format on commit with `cargo fmt --all`; CI runs `cargo fmt --all -- --check`
  as a gate.
- Tests live next to the code (`#[cfg(test)] mod tests`) for unit scope; under
  `tests/` for integration scope. Property tests use `proptest`; snapshot tests
  use `insta`.
- Errors propagate as `Result<T, E>` with `anyhow::Error` at adapter boundaries
  and a domain `enum Error` inside the core when error variants need to drive
  behavior.

## Recommended Frameworks

- HTTP: **axum** (see [`axum.md`](axum.md)) — Tokio-based, layered on `tower`.
- gRPC: `tonic`.
- Async runtime: `tokio` (multi-threaded for servers; current-thread for
  embedded/CLI).
- Serialization: `serde` + `serde_json`.
- Tracing: `tracing` + `tracing-subscriber`.
- Database access: `sqlx` (compile-time-checked SQL) or `sea-orm` (when an ORM
  is genuinely needed).
- Testing helpers: `tokio::test`, `assert_matches`, `wiremock` for HTTP fakes.

## When Not To Reach For An Adapter

Rust's type system makes "just pass a closure" or "just inline the helper"
viable far longer than in other languages. Resist creating a trait or generic
parameter before you have a second implementation that justifies the indirection.
Hexagonal ports earn their keep when there are at least two adapters (real and
test fake); below that, a concrete struct is enough.
