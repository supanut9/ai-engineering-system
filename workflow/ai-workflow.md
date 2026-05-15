# AI Workflow

## Purpose

This workflow defines the default operating model for AI-assisted software
delivery. It is intended to work across multiple agents, stacks, and projects.

Use this workflow to move from initiative to maintainable production software in
small, verifiable steps.

## Core Rule

Do not jump straight into coding.

Move through the workflow in order. Do not skip gates unless the task is truly
small, local, and low risk.

## Phases

### Phase 0: Project Intake

Goal:
- clarify what is being built and why

Required artifacts:
- `docs/requirements/project-brief.md`
- `.ai/workflow/project-context.md`

Required output:
- product idea
- target users
- problem statement
- business outcome
- constraints
- initial risks

Exit gate:
- the project goal, users, and constraints are clear enough to write
  requirements

### Phase 1: Requirements

Goal:
- turn the idea into explicit product requirements

Required artifacts:
- `docs/requirements/prd.md`
- `docs/requirements/user-stories.md`
- `docs/requirements/acceptance-criteria.md`

Required output:
- goals and non-goals
- user stories
- feature scope
- acceptance criteria
- important edge cases

Exit gate:
- each planned feature has clear behavior and acceptance criteria

### Phase 2: Functional Specification

Goal:
- define how the product should behave in enough detail to implement safely

Required artifacts:
- `docs/specs/functional-spec.md`
- `docs/specs/screens.md`
- `docs/specs/api-spec.md`
- `docs/specs/data-model.md`

Required output:
- screens and flows
- API contracts
- validation behavior
- data entities
- error states
- role and permission behavior

Exit gate:
- features are implementable without guessing core behavior

### Phase 3: Architecture

Goal:
- define the technical shape of the system before implementation

Required artifacts:
- `docs/architecture/system-design.md`
- `docs/architecture/tech-stack.md`
- `docs/architecture/decisions/`

Required output:
- service boundaries
- stack choices
- data ownership
- integration points
- key tradeoffs
- ADRs for major decisions

Exit gate:
- architecture and stack choices are explicit enough to plan implementation

### Phase 4: Implementation Planning

Goal:
- break the work into executable, testable units

Required artifacts:
- `docs/plan/implementation-plan.md`
- `docs/plan/milestones.md`
- `docs/plan/tasks.md`
- `.ai/workflow/active-task.md`

Required output:
- milestones
- backlog items
- task sequence
- dependencies
- acceptance criteria per task
- test strategy per task

Exit gate:
- at least one task is ready to implement without vague assumptions

### Phase 5: Implementation

Goal:
- implement one bounded task at a time

Required behavior:
- read relevant docs first
- identify affected services and files
- make small changes
- add or update tests
- summarize assumptions and risks

Exit gate:
- the scoped task is implemented and verified against its acceptance criteria

### Phase 6: Testing

Goal:
- verify correctness, regressions, and release confidence

Required artifacts:
- `docs/tests/test-plan.md`
- `docs/tests/manual-test-checklist.md`
- `docs/tests/regression-checklist.md`

Required behavior:
- run the most relevant checks available
- document what was verified and what was not
- record remaining risks

Exit gate:
- critical flows are verified for the current milestone

### Phase 7: Release Readiness

Goal:
- prepare the system to go live safely

Required artifacts:
- `docs/release/go-live-checklist.md`
- `docs/release/deployment-plan.md`
- `docs/release/rollback-plan.md`

Required behavior:
- confirm tests and build status
- confirm environment and migration readiness
- confirm logging, monitoring, and rollback plan

Exit gate:
- release risks are documented and operational readiness is explicit

### Phase 8: Maintenance

Goal:
- keep the system operable and understandable after launch

Required artifacts:
- `docs/maintenance/runbook.md`
- `docs/maintenance/changelog.md`
- `docs/maintenance/known-issues.md`

Required behavior:
- update runbook after meaningful operational changes
- track known issues and tradeoffs
- keep rollout history understandable

Exit gate:
- future engineers and agents can continue without reverse engineering the
  system from scratch

## Plan Files At Project Root

### when to write a `<feature>-plan.md`

Write a plan file for any feature or initiative that:
- spans more than roughly 3 phases or more than roughly 10 files;
- needs explicit user approval of scope and stack before implementation begins;
- benefits from being inspected as a single document (PRD + architecture + roadmap
  in one place).

Routine bug fixes, small refactors, and doc edits do not need a plan file.

### where it lives

At the project repo root (or the relevant monorepo root) as `<feature>-plan.md`.
Examples:

- `cms-plan.md`
- `form-plan.md`
- `ai-engineering-system-plan.md`

This is intentionally at the root — not under `docs/` — so it is the first thing
visible when a contributor opens the repo. The plan file is a living artifact: it
receives edits, approval stamps, and version notes as decisions lock in.

### shape

Use `templates/docs/plan.md` as the starting template. Standard sections:

1. Status, last updated, owner, audience (locked decisions header).
2. Context and goal.
3. Locked scope — decisions the user has approved and are not open for re-discussion.
4. Audit — existing vs missing, when relevant.
5. Locked stack and pinned versions.
6. Architecture — concise design: service boundaries, data flow, key tradeoffs.
7. File layout — target end-state directory tree.
8. Phased roadmap — phases sequential, lanes within each wave parallel.
9. Parallel sub-agent execution plan (see `workflow/subagent-contract.md §Parallel Lanes And Waves`).
10. Critical decisions (locked) — table of decision, rationale.
11. Verification — concrete end-to-end smoke test steps.
12. Risks and open questions.
13. Pre-flight checklist before execution.

### process

1. Draft the plan in coordinator plan mode before touching any implementation files.
2. Surface user-decision points explicitly (scope, stack choices, licensing) and wait
   for answers before locking those sections.
3. Once decisions are locked, write the plan file to the project root.
4. Implementation phases reference the plan file rather than re-deriving design.
   Each lane brief links back to the relevant plan section.

### why this exists

Without a persistent artifact, multi-phase work loses its decision trail. Phase 1
makes a choice; by Phase 4 that choice is invisible to a new agent or collaborator.
The plan file is the single document that survives the full workflow and lets a future
contributor — or the same agent next month — reconstruct the design and all locked
trade-offs without mining the conversation history.

## Default Working Rules

Before coding:
- read `.ai/workflow/project-context.md`
- read `.ai/workflow/workflow-state.md`
- read the current phase artifacts
- read only the relevant stack profiles and standards
- confirm the active task and its acceptance criteria

During coding:
- prefer small, focused changes
- keep business logic separate from transport and presentation concerns
- follow existing project conventions
- do not widen scope without recording it
- do not change architecture silently

After coding:
- update or add tests
- run relevant verification
- update docs if behavior or decisions changed
- record open risks and next steps

## Definition Of Ready

A task is ready only when:
- goal is clear
- acceptance criteria exist
- likely affected services are known
- required docs and contracts exist
- test approach is known

## Definition Of Done

A task is done only when:
- code is implemented
- tests are added or updated as needed
- relevant checks were run or explicitly skipped
- acceptance criteria are satisfied
- docs and workflow state are updated where needed

## Restrictions

Do not:
- invent large features from vague prompts
- skip architecture for complex work
- perform broad rewrites without justification
- claim production readiness without release artifacts
- introduce new dependencies without explaining the tradeoff
