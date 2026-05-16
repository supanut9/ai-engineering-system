---
name: workflow-runner
description: Use to drive a project through the 9-phase AI Engineering System workflow interactively — detect the current phase, check its gate, delegate to the right phase skill, and advance state. Trigger on "what phase are we in", "run the workflow", "advance the workflow", "what's next", "start the next phase", or any open-ended request to make progress on a project that already has `.ai/workflow/`.
---

# workflow runner

Meta-skill that orchestrates the AI Engineering System workflow (Phase 0 → Phase 8).
It is the single entry point a user can call when they don't know which phase-specific
skill to invoke. It reads workflow state, checks the gate for the current phase, hands
off to the matching phase skill, and advances state when a gate passes.

Reference: `../../workflow/ai-workflow.md`, `../../workflow/phase-gates.md`,
`../../workflow/task-lifecycle.md`.

## when to use

- The user says "what phase are we in", "run the workflow", "what's next", "advance
  to the next phase", or "drive this project forward" without naming a phase.
- A bootstrapped project exists (has `.ai/workflow/project-context.md` or
  `.ai/workflow/workflow-state.md`) but you don't know which phase skill to invoke.
- You need to verify that a phase's exit gate has been satisfied before moving on.
- Multi-phase work needs a consistent state-machine view across sessions.

Do **not** use this skill when:

- The user explicitly names a single phase (call that phase's skill directly).
- The task is a small bug fix, refactor, or doc edit that does not warrant the full
  workflow (`workflow/ai-workflow.md` § Core Rule).

## what to produce

| Artifact | Path | When |
|---|---|---|
| Updated workflow state | `.ai/workflow/workflow-state.md` | Every advance |
| Current-phase artifacts | per phase, see table below | Delegated to phase skill |
| One-line phase summary to user | (chat response) | Always |

The skill itself **does not write phase artifacts** — it delegates to the phase skill
that owns the artifact. It only edits `.ai/workflow/workflow-state.md` and reports
status.

## phase → skill mapping

| Phase | Required artifacts | Gate | Delegate to skill |
|---|---|---|---|
| 0 Project intake | `docs/requirements/project-brief.md`, `.ai/workflow/project-context.md` | Gate 1 | `project-intake` |
| 1 Requirements | `docs/requirements/{prd,user-stories,acceptance-criteria}.md` | Gate 2 | `requirements-prd` |
| 2 Functional spec | `docs/specs/{functional-spec,screens,api-spec,data-model}.md` | Gate 3 | `functional-spec` |
| 3 Architecture | `docs/architecture/{system-design,tech-stack}.md`, `docs/architecture/decisions/` | Gate 4 | `architecture-design` (+ `adr-write` for each major decision) |
| 4 Implementation planning | `docs/plan/{implementation-plan,milestones,tasks}.md`, `.ai/workflow/active-task.md` | Gate 5 | `implementation-planning` |
| 5 Implementation | working code + tests | Gate 5 per-task | *no dedicated skill — agent implements directly using project-local conventions* |
| 6 Testing | `docs/tests/{test-plan,manual-test-checklist,regression-checklist}.md` | (continues toward Gate 6) | `test-planning` |
| 7 Release readiness | `docs/release/{go-live-checklist,deployment-plan,rollback-plan}.md` | Gate 6 | `release-readiness` |
| 8 Maintenance | `docs/maintenance/{runbook,known-issues}.md`, `CHANGELOG.md` | n/a | `changelog-update` (per release); `adr-write` (per new decision) |

Cross-phase helpers (callable from any phase):

- `pr-review` — review a pull request against the active phase's standards.
- `dependency-review` — review a dependency change.
- `adr-write` — write a new ADR (most common in Phase 3, occasionally Phase 4/8).
- `changelog-update` — update `CHANGELOG.md` (most common in Phase 8).

## process

1. **Locate workflow state.** Read `.ai/workflow/workflow-state.md`. If it does not
   exist, the project has not been bootstrapped — tell the user to run
   `scripts/init-project.sh` from the system, or, if they want to retrofit, render
   the file from `../../templates/project-files/workflow-state.md` and set
   `Current Phase` to `Phase 0`.

2. **Read project context.** Read `.ai/workflow/project-context.md` for the project
   name, stack, and goal so subsequent reasoning is project-aware. If absent, the
   project is in pre-intake state — go to Phase 0.

3. **Identify the current phase.** Parse the `Current Phase` field. If ambiguous,
   pick the lowest-numbered phase whose required artifacts (table above) are
   incomplete.

4. **Check artifact presence.** For the current phase, list which required artifacts
   exist and which are missing. Report this list to the user in one short table.

5. **Check the phase's exit gate.** Use `../../workflow/phase-gates.md` for the exact
   gate criteria. A gate passes only when every bullet is satisfied; document any
   that are not.

6. **Decide the next move.**
   - If the gate has **not** passed: invoke the phase's delegate skill from the
     table above (call it directly — do not re-implement its logic here). Phase 5
     is the exception: there is no delegate skill; instead, read
     `.ai/workflow/active-task.md` and proceed with task execution per
     `../../workflow/task-lifecycle.md`.
   - If the gate **has** passed: confirm with the user that the phase is complete,
     then advance state (step 7).

7. **Advance state when a gate passes.**
   - Tick the completed phase's checkbox under `Completed Phases` in
     `workflow-state.md`.
   - Set `Current Phase` to the next phase title.
   - Set `Next Step` to the next phase's first action (e.g., "Phase 1: invoke
     `requirements-prd` skill").
   - Save the file.

8. **Report.** Reply to the user with exactly three lines:
   - `Phase: <current> — <one-sentence status>`
   - `Gate: pass | block — <reason if block>`
   - `Next: <skill name to invoke, or task to execute>`

## state machine

```text
Phase 0 ──Gate 1──▶ Phase 1 ──Gate 2──▶ Phase 2 ──Gate 3──▶ Phase 3
                                                              │
                                                            Gate 4
                                                              ▼
                                                           Phase 4
                                                              │
                                                            Gate 5 (per task)
                                                              ▼
                                                           Phase 5 ◀──┐
                                                              │       │
                                                              ▼       │
                                                           Phase 6 ───┘ (loop until milestone done)
                                                              │
                                                              ▼
                                                           Phase 7 ──Gate 6──▶ Phase 8 (steady state)
```

Phases 5 and 6 loop per task within a milestone; only after the milestone's
acceptance criteria are met does the workflow advance to Phase 7.

## templates to reference

- `../../templates/project-files/workflow-state.md` — canonical workflow-state shape.
- `../../templates/project-files/project-context.md` — project-facing context shape.
- `../../templates/project-files/active-task.md` — active-task shape used in Phase 5.

## quality checks

- `.ai/workflow/workflow-state.md` exists and `Current Phase` matches reality
  (artifacts for that phase are in progress, not complete).
- Every completed phase has all its required artifacts present and non-empty.
- When a gate is reported as `pass`, every bullet of that gate in
  `../../workflow/phase-gates.md` is satisfied.
- When delegating, the chosen skill matches the phase → skill mapping table.
- The three-line report (Phase / Gate / Next) is always emitted at end of a run.

## anti-patterns

- **Implementing phase work inline.** This skill orchestrates; it does not write
  PRDs, architecture docs, or code. Always delegate.
- **Skipping a gate to "save time".** If a gate fails, fix the gap or get explicit
  user approval to defer — do not silently advance state.
- **Editing artifacts owned by phase skills.** `workflow-state.md` is the only file
  this skill writes. Anything else belongs to the delegate.
- **Ignoring `active-task.md` during Phase 5.** In Phase 5 the active-task file
  drives execution; treat it as the unit of work, not the milestone.
- **Reusing the workflow for a tiny change.** A typo fix does not need Phase 0–8.
  Honor the Core Rule in `../../workflow/ai-workflow.md`.
