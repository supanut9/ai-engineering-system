# Rollback Plan — {{TITLE}}

> Companion to `deployment-plan.md`. Prepare this before deployment begins.

## trigger conditions

Roll back when any of the following are observed:

- Error budget burn rate exceeds: TBD
- P0 / P1 alert fired: TBD
- SLO breach: TBD  <!-- e.g. availability < 99.5% over 5-min window -->
- Manual call by decision authority (see below)
- TBD

## decision authority

Single point of accountability: TBD
Backup: TBD

> One person makes the call. No committee vote during an incident.

## rollback steps

Steps mirror the deployment plan in reverse. Confirm with the deployment plan before executing.

1. TBD
2. TBD
3. TBD

> Link to deployment plan: TBD
> Link to runbook: TBD

## data considerations

| Concern | Action |
|---|---|
| Rows written since deploy | TBD  <!-- backfill | replay | discard | leave in place --> |
| Messages / events in queue | TBD |
| Irreversible migration steps | TBD  <!-- document what cannot be undone --> |

## verification after rollback

- Health endpoint: TBD
- Log signals: TBD
- Metric thresholds: TBD
- Confirm prior stable version is serving: TBD

## partial rollback vs full rollback

Partial rollback (feature flag off, single service reverted):
- Appropriate when: TBD
- Risk: TBD

Full rollback (all services, full artifact revert):
- Appropriate when: TBD
- Risk: TBD

## lessons-learned hand-off

After rollback is stable, open a post-incident review: TBD  <!-- link to PIR template or ticket -->
