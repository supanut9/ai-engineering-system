---
name: release-readiness
description: Use when preparing a feature or project for deployment, including go-live checks, rollback planning, and operational risk review.
---

# release readiness

Phase 7 of the AI Engineering System workflow (v0.0.1).
Reference: `../../workflow/ai-workflow.md`, `../../workflow/phase-gates.md`.

## when to use

- Testing phase is complete and the milestone is a candidate for production.
- A user says "prepare for release", "are we ready to deploy", or "write the deployment plan".
- The team needs a structured go/no-go checklist before pushing to production.

## what to produce

| Artifact | Path |
|---|---|
| Go-live checklist | `docs/release/go-live-checklist.md` |
| Deployment plan | `docs/release/deployment-plan.md` |
| Rollback plan | `docs/release/rollback-plan.md` |

Use `../../templates/docs/go-live-checklist.md`, `../../templates/docs/deployment-plan.md`, and
`../../templates/docs/rollback-plan.md` as starting points.
See `../../examples/hello-todo-go/docs/release/go-live-checklist.md`,
`../../examples/hello-todo-go/docs/release/deployment-plan.md`, and
`../../examples/hello-todo-go/docs/release/rollback-plan.md` for filled-in examples.

## process

1. **Confirm test status.** Verify that all tests in the test plan pass and that CI is green. Record the commit SHA or build ID. Do not proceed if any critical test is failing.

2. **Confirm environment readiness.** Check that all required environment variables are set in the target environment. Reference `.env.example` for the required variable list. Confirm the deployment target (platform, region, namespace).

3. **Audit database and migration state.** List every migration that will run on this release. Verify each migration is reversible or that a compensating migration exists. Flag any destructive changes (column drops, table renames) for explicit approval.

4. **Confirm observability.** Verify that logging is configured, that structured log output is flowing, and that error reporting (if applicable) is active. Define the minimum set of metrics or log lines that indicate the release is healthy.

5. **Write the deployment plan.** Record: pre-deployment steps (drain, backup, notify), deployment steps in exact order, post-deployment verification steps, and the expected duration. Each step must be executable without interpretation.

6. **Write the rollback plan.** For every deployment step that changes production state, write the corresponding rollback action. Rollback steps must be executable under pressure without consulting the original author. Record the rollback trigger: what observable condition activates rollback.

7. **Write the go-live checklist.** Consolidate: build status, environment checks, migration status, observability confirmation, deployment plan acknowledged, rollback plan acknowledged. Each item must be a binary yes/no check — not a judgment call.

8. **Identify operational risks.** List any risk that could cause a production incident in the first 24 hours. For each risk, record: likelihood, impact, and mitigation. This section is not optional — if no risks are found, that is itself a signal to look harder.

9. **Confirm gate passage.** Gate 6 from `../../workflow/phase-gates.md`: tests and build status are known, deployment steps exist, rollback steps exist, operational risks are documented.

## templates to reference

- `../../templates/docs/go-live-checklist.md` — canonical go-live checklist template.
- `../../templates/docs/deployment-plan.md` — canonical deployment plan template.
- `../../templates/docs/rollback-plan.md` — canonical rollback plan template.
- `../../templates/docs/runbook.md` — reference for post-release operational runbook.

## quality checks

- Go-live checklist has no items left unchecked or marked "TBD".
- Deployment plan lists steps in executable order with no ambiguous instructions.
- Rollback plan covers every step that mutates production state.
- Rollback trigger condition is defined.
- Operational risks section is non-empty.
- Phase-gate 6 criteria pass (`../../workflow/phase-gates.md` § Gate 6).

## anti-patterns

- **Treating the go-live checklist as a formality.** Unchecked items are blockers, not suggestions. A checklist with items marked "probably fine" offers no safety guarantee.
- **Writing a deployment plan that requires the original author to interpret.** Steps must be executable by any team member with appropriate access.
- **Skipping the rollback plan for "low-risk" releases.** Every production change has a rollback path. Documenting it takes ten minutes and saves hours during an incident.
- **Not recording the commit SHA or build ID in the release artifacts.** Without a pinned reference, it is impossible to audit what was deployed or reproduce the release.
- **Deferring observability setup to after the release.** Logging and monitoring must be verified before go-live, not during the incident that follows.
