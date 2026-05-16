# go-live checklist — hello-todo-nextjs v0.1.0

Work through this list top to bottom before directing any traffic to the new process.

## engineering readiness

- [ ] `make test` passes on the release commit — all suites passing.
- [ ] CI pipeline is green for the release commit or tag.
- [ ] `make lint` exits zero (no TypeScript or ESLint errors).
- [ ] `make build` produces a `.next/` build directory without error.
- [ ] `make start` starts the server and responds:
      `curl http://localhost:3000/healthz` returns `{"status":"ok"}`.
- [ ] `curl http://localhost:3000/` returns HTTP 200 HTML.

## configuration

- [ ] `PORT` environment variable is set correctly in the target environment
      (default `3000`).
- [ ] No secrets are required by this service (no auth, no database credentials in
      v0.1.0).
- [ ] Stdout logs are captured by the host process manager (systemd, Docker, etc.).

## functional verification

- [ ] Manual test checklist (`docs/tests/manual-test-checklist.md`) sections 0–11
      completed against the release build.
- [ ] All six API endpoints respond with correct status codes.
- [ ] Home page (`GET /`) renders todo list correctly.

## operations readiness

- [ ] Runbook (`docs/maintenance/runbook.md`) reviewed and up to date.
- [ ] Known issues (`docs/maintenance/known-issues.md`) reviewed; no new blockers
      identified.
- [ ] Rollback plan (`docs/release/rollback-plan.md`) reviewed; previous build is
      available.
- [ ] Deployment plan (`docs/release/deployment-plan.md`) reviewed and steps are clear.

## post-deploy verification

- [ ] `curl /healthz` returns 200 from the production address.
- [ ] `GET /` returns HTML from the production address.
- [ ] Create a test todo, retrieve it, and delete it from the production endpoint.
- [ ] Logs are flowing to stdout and visible in the log aggregator (or terminal).
- [ ] Process is running under the correct user/group with no unnecessary privileges.
