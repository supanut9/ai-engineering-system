# rollback plan — hello-todo-nextjs v0.1.0

Companion to `deployment-plan.md`. Review this before deployment begins.

## trigger conditions

Roll back when any of the following are observed within 30 minutes of deploy:

- HTTP 5xx error rate exceeds 1% over a 5-minute window.
- `GET /healthz` returns a non-200 response or times out.
- `GET /` returns a non-200 response or renders a Next.js error page.
- The process crashes and does not restart within 60 seconds.
- Manual call by the on-call engineer or team lead.

## decision authority

Single point of accountability: on-call engineer.

One person makes the call — no committee vote during an incident.

## rollback steps

Because the service is stateless and storage is in-memory, rollback is simply replacing
the `.next/` build directory and restarting the process.

1. Stop the running process:
   ```bash
   kill -TERM <pid>
   # or: systemctl stop hello-todo-nextjs
   ```
   Wait for the process to exit.

2. Restore the previous build directory:
   ```bash
   cp -r /opt/hello-todo-nextjs/.next.previous /opt/hello-todo-nextjs/.next
   ```
   (The previous `.next/` must have been archived before deploying the new one.)

3. Start the previous version:
   ```bash
   PORT=3000 npx next start /opt/hello-todo-nextjs
   ```

4. Verify:
   ```bash
   curl http://<host>:3000/healthz
   ```
   Expected: `{"status":"ok"}`.

5. Run the manual test checklist sections 1–10 (abbreviated smoke subset).

link to deployment plan: `deployment-plan.md`
link to runbook: `../maintenance/runbook.md`

## data considerations

| concern | action |
|---|---|
| in-memory todo data since deploy | lost on process restart — by design in v0.1.0 (no persistent storage). Users must re-enter any todos created after the failed deploy. |
| database migrations | not applicable (no database). |
| irreversible steps | none — the only state is in-memory and is reset on every restart. |

## verification after rollback

- `curl /healthz` returns 200.
- `curl /` returns HTML.
- create a todo and retrieve it (confirm the service is functional).
- no ERROR lines in the first 5 minutes.

## partial vs full rollback

Partial rollback is not applicable: this is a single-process service with no feature
flags or canary routing in v0.1.0.

Full rollback (replace `.next/` and restart): appropriate for any trigger condition
listed above.

## lessons-learned hand-off

After rollback is stable, open a post-incident review:

1. Record the trigger, timeline, and impact.
2. Identify root cause.
3. Add a regression test if the cause was a code defect.
4. Update this rollback plan if the procedure was unclear.
