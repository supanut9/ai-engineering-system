# regression checklist — hello-todo-nestjs

Run this checklist before every release (including patch releases).

## automated checks

- [ ] `make setup` — `npm install` completes without errors.
- [ ] `make lint` — `npx tsc --noEmit` exits zero with no TypeScript errors.
- [ ] `make test` — all test suites report `PASS`; no `FAIL` lines.
- [ ] `make build` — `dist/main.js` is produced without error.

## manual smoke

- [ ] Complete `docs/tests/manual-test-checklist.md` sections 0–9.

## ci gate

- [ ] The GitHub Actions CI workflow is green on the release commit / tag.

## release artifact

- [ ] `CHANGELOG.md` has an entry for the version being released with correct date.
- [ ] `package.json` `version` field matches the release version.

## after release

- [ ] Tag created (`git tag v<version>`).
- [ ] `node dist/main.js` verified with `curl localhost:3000/healthz` after deployment.
