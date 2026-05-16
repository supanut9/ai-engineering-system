# Rollback Plan — hello-todo-rust v0.1.0

Companion to `deployment-plan.md`. Review this before deployment begins.

## Trigger conditions

Roll back when any of the following are observed within 30 minutes of deploy:

- HTTP 5xx error rate exceeds 1% over a 5-minute window.
- `GET /healthz` returns a non-200 response or times out.
- The process crashes and does not restart within 60 seconds.
- Manual call by the on-call engineer or team lead.

## Decision authority

Single point of accountability: on-call engineer.

One person makes the call — no committee vote during an incident.

## Rollback steps

Because the service is stateless and storage is in-memory, rollback is simply replacing
the binary with the previous version.

1. Stop the running process:

   ```bash
   kill -TERM <pid>
   # or: systemctl stop hello-todo-rust
   ```

   Wait for the process to exit (up to 5 seconds graceful drain).

2. Restore the previous binary:

   ```bash
   cp /opt/hello-todo-rust/my-service.previous /opt/hello-todo-rust/my-service
   ```

   (The previous binary must have been archived before deploying the new one.)

3. Start the previous version:

   ```bash
   PORT=8080 RUST_LOG=info /opt/hello-todo-rust/my-service
   ```

4. Verify:

   ```bash
   curl http://<host>:8080/healthz
   ```

   Expected: `{"status":"ok"}`.

5. Run the manual test checklist sections 1–8 (abbreviated smoke subset).

Link to deployment plan: `deployment-plan.md`
Link to runbook: `../maintenance/runbook.md`

## Data considerations

| Concern | Action |
|---------|--------|
| In-memory todo data since deploy | Lost on process restart — by design in v0.1.0 (no persistent storage). Users must re-enter any todos created after the failed deploy. |
| Database migrations | Not applicable (no database). |
| Irreversible steps | None — the only state is in-memory and is reset on every restart. |

## Verification after rollback

- `curl /healthz` returns 200.
- Create a todo and retrieve it (confirm the service is functional).
- Log lines show `"msg":"server starting"` with the expected version tag (if embedded).
- No ERROR lines in the first 5 minutes.

## Partial vs full rollback

Partial rollback is not applicable: this is a single-binary, single-process service with
no feature flags or canary routing in v0.1.0.

Full rollback (replace binary): appropriate for any trigger condition listed above.

## Lessons-learned hand-off

After rollback is stable, open a post-incident review:

1. Record the trigger, timeline, and impact.
2. Identify root cause.
3. Add a regression test if the cause was a code defect.
4. Update this rollback plan if the procedure was unclear.
