# Regression Checklist — hello-todo-fastapi

Run this checklist before every release (including patch releases).

## Automated checks

- [ ] `make setup` — installs cleanly; no dependency conflicts.
- [ ] `make lint` — `ruff check src tests` and `ruff format --check src tests` both pass with zero findings.
- [ ] `make typecheck` — `mypy src tests` passes in strict mode with zero errors.
- [ ] `make test` — all pytest tests pass; no `FAILED` or `ERROR` lines.

## Manual smoke

- [ ] Complete `docs/tests/manual-test-checklist.md` sections 0–9.

## CI gate

- [ ] The GitHub Actions CI workflow is green on the release commit / tag.

## Release artifact

- [ ] `CHANGELOG.md` has an entry for the version being released with the correct date.
- [ ] `pyproject.toml` `version` field matches the release tag.

## After release

- [ ] Tag created (`git tag v<version>`).
- [ ] Service verified with `curl /healthz` after deployment.
