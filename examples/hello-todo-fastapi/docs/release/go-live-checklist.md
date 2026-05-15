# Go-Live Checklist — hello-todo-fastapi v0.1.0

Work through this list top to bottom before directing any traffic to the new process.

## Engineering readiness

- [ ] `make test` passes on the release commit — all tests pass.
- [ ] CI pipeline is green for the release commit or tag.
- [ ] `make lint` exits zero (no ruff findings, no format issues).
- [ ] `make typecheck` exits zero (mypy strict).
- [ ] `uvicorn hello_todo_fastapi.main:app` starts and responds: `curl http://localhost:8000/healthz` returns `{"status":"ok"}`.

## Configuration

- [ ] `PORT` environment variable is set correctly in the target environment (default `8000`).
- [ ] `LOG_LEVEL` is set appropriately (`INFO` for production).
- [ ] No secrets are required by this service (no auth, no database credentials in v0.1.0).
- [ ] Stdout logs are captured by the host process manager (systemd, Docker, etc.).

## Functional verification

- [ ] Manual test checklist (`docs/tests/manual-test-checklist.md`) sections 0–9 completed against the release process.
- [ ] All six endpoints respond with correct status codes.
- [ ] Graceful shutdown verified: `kill -TERM <pid>` causes clean exit.

## Operations readiness

- [ ] Runbook (`docs/maintenance/runbook.md`) reviewed and up to date.
- [ ] Known issues (`docs/maintenance/known-issues.md`) reviewed; no new blockers identified.
- [ ] Rollback plan (`docs/release/rollback-plan.md`) reviewed; previous package or image is available.
- [ ] Deployment plan (`docs/release/deployment-plan.md`) reviewed and steps are clear.

## Post-deploy verification

- [ ] `curl /healthz` returns 200 from the production address.
- [ ] Create a test todo, retrieve it, and delete it from the production endpoint.
- [ ] Logs are flowing to stdout and visible in the log aggregator (or terminal).
