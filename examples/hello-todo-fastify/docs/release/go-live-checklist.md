# Go-Live Checklist — hello-todo-fastify v0.1.0

Work through this list top to bottom before directing any traffic to the new build.

## Engineering readiness

- [ ] `make test` passes on the release commit — all Vitest tests green.
- [ ] CI pipeline is green for the release commit or tag.
- [ ] `make lint` produces no output (zero type errors).
- [ ] `make build` produces `dist/index.js` without error.
- [ ] `node dist/index.js` starts and responds: `curl http://localhost:8080/healthz`
      returns `{"status":"ok"}`.

## Configuration

- [ ] `PORT` environment variable is set correctly in the target environment
      (default `8080`).
- [ ] `LOG_LEVEL` is set as appropriate (`info` for production).
- [ ] No secrets are required by this service (no auth, no database credentials in
      v0.1.0).
- [ ] Stdout logs are captured by the host process manager (systemd, Docker, etc.).

## Functional verification

- [ ] Manual test checklist (`docs/tests/manual-test-checklist.md`) sections 0–9
      completed against the release build.
- [ ] All six endpoints respond with correct status codes.
- [ ] Graceful shutdown verified: `kill -TERM <pid>` causes clean exit.

## Operations readiness

- [ ] Runbook (`docs/maintenance/runbook.md`) reviewed and up to date.
- [ ] Known issues (`docs/maintenance/known-issues.md`) reviewed; no new blockers
      identified.
- [ ] Rollback plan (`docs/release/rollback-plan.md`) reviewed; previous build is
      available.
- [ ] Deployment plan (`docs/release/deployment-plan.md`) reviewed and steps are clear.

## Post-deploy verification

- [ ] `curl /healthz` returns 200 from the production address.
- [ ] Create a test todo, retrieve it, and delete it from the production endpoint.
- [ ] Logs are flowing to stdout and visible in the log aggregator (or terminal).
- [ ] Process is running under the correct user/group with no unnecessary privileges.
