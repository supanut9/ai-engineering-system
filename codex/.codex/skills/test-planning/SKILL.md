---
name: test-planning
description: Use when defining unit, integration, end-to-end, and manual verification plans for a feature or release.
---

# test planning

Phase 6 of the AI Engineering System workflow (v0.0.1).
Reference: `../../workflow/ai-workflow.md`, `../../workflow/phase-gates.md`.

## when to use

- Implementation of a milestone or feature is complete or near complete.
- A user says "write the test plan", "what tests do we need", or "plan QA for this release".
- The project has automated tests but no structured record of what is covered and what is not.

## what to produce

| Artifact | Path |
|---|---|
| Test plan | `docs/tests/test-plan.md` |
| Manual test checklist | `docs/tests/manual-test-checklist.md` |
| Regression checklist | `docs/tests/regression-checklist.md` |

Use `../../templates/docs/test-plan.md` as the starting point.
See `../../examples/hello-todo-go/docs/tests/test-plan.md`,
`../../examples/hello-todo-go/docs/tests/manual-test-checklist.md`, and
`../../examples/hello-todo-go/docs/tests/regression-checklist.md` for filled-in examples.

## process

1. **Load the acceptance criteria and functional spec.** Read `docs/requirements/acceptance-criteria.md` and `docs/specs/functional-spec.md`. Every criterion must map to at least one test. Every error path defined in the spec must be covered.

2. **Define the test split.** For this project, decide the percentage split between unit, integration, and end-to-end tests. Record the reasoning. Default: unit 70%, integration 25%, e2e 5% for backend services; adjust upward on e2e for UI-heavy products. Ask the user if they have a stated preference.

3. **Map tests to layers.** For each feature or acceptance criterion, assign the appropriate layer:
   - **Unit**: pure logic, transformations, validation rules, no I/O.
   - **Integration**: repository calls, external API calls, database interactions — tested against real or containerized dependencies.
   - **End-to-end**: user-facing flows through the full stack, run against a deployed or locally running environment.

4. **Write the test plan.** For each test, record: test ID, scope, layer, what it verifies, and pass/fail criteria. Group by feature.

5. **Write the manual test checklist.** List every scenario that is too expensive or impractical to automate for this release. For each: scenario name, preconditions, steps, expected result. These are executed by a human before release.

6. **Write the regression checklist.** List the critical paths that must pass on every release, regardless of what changed. These are the minimum viable checks for confidence that existing behavior has not broken.

7. **Record what is not covered.** In the test plan, include an explicit "out of scope" section listing scenarios that are deferred and why. This prevents false confidence.

8. **Verify CI alignment.** Confirm that the automated tests in the test plan are or will be run by the CI pipeline (`.github/workflows/` or equivalent). Flag any tests that are not yet wired up.

9. **Confirm gate passage.** Gate 6 from `../../workflow/phase-gates.md`: critical flows are verified for the current milestone, remaining risks are recorded.

## templates to reference

- `../../templates/docs/test-plan.md` — canonical test plan template.
- `../../standards/testing.md` — project testing standards and tooling conventions.

## quality checks

- Every acceptance criterion from Phase 1 maps to at least one test in the plan.
- Every error path from the functional spec appears in the manual checklist or has an automated test.
- Regression checklist covers the critical user paths (not just happy paths).
- Out-of-scope section is present and non-empty.
- Phase-gate 6 criteria pass (`../../workflow/phase-gates.md` § Gate 6).

## anti-patterns

- **Writing test plans after tests are already written.** The plan should drive test coverage, not document it retrospectively. Retrospective plans create coverage gaps.
- **Treating manual checks as a substitute for automation.** Manual checklists are for release gates, not for verifying logic that runs on every commit.
- **Omitting the regression checklist.** New features break existing features. Without an explicit regression list, the scope of "does it still work" is undefined.
- **Not recording what is out of scope.** Unstated omissions create the false impression that the product is fully tested.
- **Using test IDs that don't reference the acceptance criteria.** Tests that cannot be traced back to a requirement cannot be audited when the requirement changes.
