# regression checklist — hello-todo-nextjs

Run this checklist before every release (including patch releases).

## automated checks

- [ ] `make setup` — `npm install` completes without errors.
- [ ] `make lint` — `next lint` and `npx tsc --noEmit` exit zero with no errors.
- [ ] `make test` — all test suites report passing; no failures.
- [ ] `make build` — `.next/` build directory is produced without error.

## manual smoke

- [ ] Complete `docs/tests/manual-test-checklist.md` sections 0–11.

## ci gate

- [ ] The GitHub Actions CI workflow is green on the release commit / tag.

## release artifact

- [ ] `CHANGELOG.md` has an entry for the version being released with correct date.
- [ ] `package.json` `version` field matches the release version.

## after release

- [ ] Tag created (`git tag v<version>`).
- [ ] `GET /healthz` verified with `curl localhost:3000/healthz` after deployment.
- [ ] `GET /` verified to render HTML with todo content after deployment.
