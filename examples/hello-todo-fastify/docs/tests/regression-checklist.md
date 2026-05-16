# Regression Checklist — hello-todo-fastify

Run this checklist before every release (including patch releases).

## Automated checks

- [ ] `make setup` — `npm ci` completes with no integrity errors.
- [ ] `make lint` — `tsc --noEmit` exits zero (no type errors).
- [ ] `make test` — all Vitest tests pass; no failed or skipped tests.
- [ ] `make build` — `dist/index.js` is produced without error.

## Manual smoke

- [ ] Complete `docs/tests/manual-test-checklist.md` sections 0–9.

## CI gate

- [ ] The GitHub Actions CI workflow is green on the release commit / tag.

## Release artifact

- [ ] `CHANGELOG.md` has an entry for the version being released with correct date.
- [ ] `package.json` `version` field matches the release version.

## After release

- [ ] Tag created (`git tag v<version>`).
- [ ] `node dist/index.js` verified with `curl /healthz` after deployment.
