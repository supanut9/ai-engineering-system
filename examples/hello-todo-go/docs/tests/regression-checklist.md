# Regression Checklist — hello-todo-go

Run this checklist before every release (including patch releases).

## Automated checks

- [ ] `make setup` — `go mod tidy` completes with no changes to `go.mod` or `go.sum` (if it does change, commit the diff first).
- [ ] `make lint` — `gofmt -l .` prints nothing; `go vet ./...` prints nothing.
- [ ] `make test` — all packages report `ok`; no `FAIL` lines.
- [ ] Run with race detector: `go test -race ./...` — no race warnings.
- [ ] `make build` — `bin/api` is produced without error.

## Manual smoke

- [ ] Complete `docs/tests/manual-test-checklist.md` sections 0–9.

## CI gate

- [ ] The GitHub Actions CI workflow is green on the release commit / tag.

## Release artifact

- [ ] `CHANGELOG.md` has an entry for the version being released with correct date.
- [ ] `go.mod` specifies the correct `go` directive version.

## After release

- [ ] Tag created (`git tag v<version>`).
- [ ] `bin/api` binary verified with `curl /healthz` after deployment.
