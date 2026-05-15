# Deployment Plan — {{TITLE}}

## goal

Release: TBD
Target environment: TBD  <!-- staging | production | canary -->

## scope

Services / components in this rollout:
- TBD

Out of scope:
- TBD

## pre-deployment checklist

- [ ] All tests passing (unit, integration, e2e)
- [ ] Migrations reviewed — reversible steps verified
- [ ] Environment variables set in target environment
- [ ] Dependencies updated and pinned
- [ ] On-call engineer notified
- [ ] Runbook updated for new failure modes
- [ ] Rollback plan reviewed and ready
- [ ] Feature flags configured
- [ ] Stakeholders notified of maintenance window

## deployment steps

1. TBD
2. TBD
3. TBD

> Link to runbook: TBD

## migration steps

| Step | Description | Reversible? |
|---|---|---|
| 1 | TBD | Yes / No |

Note: mark irreversible steps explicitly. Run irreversible steps only after verification window.

## verification

- Health endpoint: TBD  <!-- e.g. GET /healthz → 200 -->
- Log signals: TBD  <!-- e.g. no ERROR lines within 5 min post-deploy -->
- Metric thresholds: TBD  <!-- e.g. p99 latency < 500 ms, error rate < 0.1% -->
- Smoke test: TBD

## owners

- Primary: TBD
- Secondary: TBD
- Escalation: TBD

## timing window

- Planned start: TBD
- Code freeze: TBD
- Rollback decision deadline: TBD  <!-- time after deploy by which rollback must be decided -->

## communication

| Audience | Channel | Timing |
|---|---|---|
| Internal team | TBD | Before deploy |
| On-call | TBD | Before deploy |
| Status page | TBD | During / after |
