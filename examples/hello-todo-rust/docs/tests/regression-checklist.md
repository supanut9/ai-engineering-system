# Regression Checklist — hello-todo-rust

Run this checklist before every release (including patch releases).

## Automated checks

- [ ] `make setup` — `cargo fetch` completes; `Cargo.lock` is up to date.
- [ ] `make clippy` — `cargo clippy -- -D warnings` prints nothing; exits zero.
- [ ] `make fmt` — `cargo fmt --all -- --check` prints no diff; exits zero.
- [ ] `make test` — all test functions pass; no `FAILED` lines.
- [ ] `make build` — `target/release/my-service` is produced without error.

## Manual smoke

- [ ] Complete `docs/tests/manual-test-checklist.md` sections 0–9.

## CI gate

- [ ] The GitHub Actions CI workflow is green on the release commit / tag.

## Release artifact

- [ ] `CHANGELOG.md` has an entry for the version being released with correct date.
- [ ] `Cargo.toml` specifies the correct `rust-version` directive (MSRV 1.85).
- [ ] `Cargo.lock` is committed (binary crates commit the lock file).

## After release

- [ ] Tag created (`git tag v<version>`).
- [ ] `target/release/my-service` binary verified with `curl /healthz` after deployment.
