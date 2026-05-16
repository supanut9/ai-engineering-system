# Rust tooling

Configs copied into Rust projects bootstrapped from the AI Engineering System.

## Files

| File | Purpose |
|---|---|
| `rustfmt.toml` | Rustfmt config. Keeps line width at 100 and pins edition 2024. |
| `clippy.toml` | Clippy MSRV pin (1.85). Crate-level `#![warn(clippy::...)]` lives in `src/lib.rs`. |
| `Makefile.template` | Authoritative Make targets: `setup`, `run`, `test`, `test-integration`, `lint`, `lint-fix`, `fmt`, `build`, `audit`, `clean`. |

## What is not here

- `Cargo.toml` — every project owns its own; this directory only ships tooling
  that is invariant across projects.
- A pre-commit config — Rust projects typically wire fmt + clippy into CI and
  rely on editor-side hooks. Add `tooling/shared/.pre-commit-config.shared.yaml`
  patterns to your project if you want a uniform local hook.

## Versions pinned in this directory

Verified 2026-05-17. See `stacks/rust.md` and `stacks/axum.md` for the full pin table.
