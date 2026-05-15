---
name: implementation-planning
description: Use when breaking approved requirements and architecture into milestones, tasks, dependencies, and verifiable implementation slices.
---

# implementation planning

Phase 4 of the AI Engineering System workflow (v0.0.1).
Reference: `../../workflow/ai-workflow.md`, `../../workflow/phase-gates.md`.

## when to use

- Architecture and functional spec are complete (Phases 2 and 3 passed their gates).
- A user says "plan the implementation", "break this into tasks", or "create a milestone plan".
- The team is ready to write code but has no agreed sequencing or task breakdown.

## what to produce

| Artifact | Path |
|---|---|
| Implementation plan | `docs/plan/implementation-plan.md` |
| Milestones | `docs/plan/milestones.md` |
| Task list | `docs/plan/tasks.md` |
| Active task (AI-facing) | `.ai/workflow/active-task.md` |

Use `../../templates/docs/implementation-plan.md`, `../../templates/docs/plan.md`, and
`../../templates/docs/task-spec.md` as starting points.
See `../../examples/hello-todo-go/docs/plan/implementation-plan.md`,
`../../examples/hello-todo-go/docs/plan/milestones.md`,
`../../examples/hello-todo-go/docs/plan/tasks.md`, and
`../../examples/hello-todo-go/.ai/workflow/active-task.md` for filled-in examples.

## process

1. **Load architecture and spec artifacts.** Read `docs/architecture/system-design.md`, `docs/architecture/tech-stack.md`, `docs/specs/functional-spec.md`, and `docs/requirements/acceptance-criteria.md`. Planning without these produces tasks that conflict with settled decisions.

2. **Define milestones.** Group work into 2–5 milestones, each with a clear outcome statement and an exit condition. Milestone 0 is always "project scaffold and CI running". Each milestone must be deployable or demonstrable independently.

3. **Break each milestone into tasks.** A task is the smallest unit of work that produces a verifiable outcome. Write tasks as outcomes, not as file edits (e.g., "user can create a todo item via POST /todos" not "add handler function").

4. **Assign task IDs.** Use `T001`, `T002`, … for unambiguous cross-referencing between tasks and the active-task file.

5. **Sequence by dependency.** For each task, list its direct predecessors. Highlight any tasks that can run in parallel — these are candidates for sub-agent parallelism (see `../../workflow/subagent-contract.md`).

6. **Write acceptance criteria per task.** Every task must have at least one testable criterion that confirms it is done. Reuse language from `docs/requirements/acceptance-criteria.md` where applicable.

7. **Record test approach per task.** For each task, state: unit test, integration test, or manual check. Reference the relevant section of `../../standards/testing.md`.

8. **Write `.ai/workflow/active-task.md`.** Set the first ready task as active. Include: task ID, goal, affected files (estimated), acceptance criteria, test approach, and any blockers.

9. **Confirm gate passage.** Gate 5 from `../../workflow/phase-gates.md`: task goal clear, acceptance criteria exist, affected services known, test plan known.

## templates to reference

- `../../templates/docs/implementation-plan.md` — canonical plan template.
- `../../templates/docs/plan.md` — milestone and overview template.
- `../../templates/docs/task-spec.md` — per-task specification template.

## quality checks

- Every milestone has an outcome statement and an exit condition.
- Every task has an ID, an outcome-based goal, at least one acceptance criterion, and a stated test approach.
- No task depends on work that appears after it in the sequence.
- At least one task is in "ready" state in `.ai/workflow/active-task.md`.
- Phase-gate 5 criteria pass (`../../workflow/phase-gates.md` § Gate 5).

## anti-patterns

- **Writing tasks as file edits.** "Create `handlers/todo.go`" is not a task goal. "Implement POST /todos endpoint that persists a new todo and returns 201" is.
- **Creating tasks without acceptance criteria.** Undefinable done means the task never finishes or finishes wrong.
- **Ignoring dependencies.** Tasks that start before their dependencies are met produce integration failures that block the whole milestone.
- **Making milestones too large.** A milestone that cannot be demonstrated or deployed independently has no useful checkpoint.
- **Skipping the active-task file.** The AI workflow reads `.ai/workflow/active-task.md` before coding. If it is absent or stale, agents work without a bounded scope.
