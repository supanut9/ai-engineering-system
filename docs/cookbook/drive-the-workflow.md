# drive the workflow with the workflow-runner skill

## goal

By the end of this recipe you will be able to ask Claude or Codex "what phase are we in" and "what's next" on any bootstrapped project, and the `workflow-runner` skill will read state, check the relevant gate, and either delegate to the right phase skill or advance state for you.

## prerequisites

- A project bootstrapped with `scripts/init-project.sh` (so `.ai/workflow/` exists), or any project that has at least `.ai/workflow/project-context.md` and `.ai/workflow/workflow-state.md`.
- The Claude or Codex adapter installed for the project (`CLAUDE.md` + `.claude/`, or `.codex/`).
- Skills mirrored into the project — they are copied automatically by `init-project.sh`.

## what the skill does

`workflow-runner` is a meta-skill. It does not write PRDs, specs, architecture docs, plans, tests, or release artifacts. It only:

1. Reads `.ai/workflow/workflow-state.md` to find the current phase.
2. Reads `.ai/workflow/project-context.md` for project name, stack, and goal.
3. Checks which artifacts the current phase requires and which are missing.
4. Checks the phase's gate in `workflow/phase-gates.md`.
5. Either delegates to the matching phase skill, or — if the gate passes — advances `workflow-state.md` to the next phase.

The single output the skill writes is `.ai/workflow/workflow-state.md`. Phase artifacts are owned by the delegate skills.

## steps

**1. Invoke the skill.**

Inside Claude Code (or Codex) running in your project, simply ask:

```text
What phase are we in? What's next?
```

The `workflow-runner` skill's `description` triggers on prompts like:

- "what phase are we in"
- "what's next"
- "run the workflow"
- "advance to the next phase"
- "drive this project forward"

**2. Read the three-line report.**

The skill always replies with exactly three lines:

```text
Phase: <current> — <one-sentence status>
Gate: pass | block — <reason if block>
Next: <skill name to invoke, or task to execute>
```

If `Gate` is `block`, the skill will tell you which artifacts are missing and which delegate skill it is about to invoke.

**3. Let it delegate.**

If the gate fails, the skill calls the matching phase skill from the table below. You do not need to know the skill name — `workflow-runner` chooses it.

| Phase | Delegate skill |
|---|---|
| 0 Intake | `project-intake` |
| 1 Requirements | `requirements-prd` |
| 2 Functional spec | `functional-spec` |
| 3 Architecture | `architecture-design` (+ `adr-write` per decision) |
| 4 Implementation planning | `implementation-planning` |
| 5 Implementation | *no delegate — agent implements `.ai/workflow/active-task.md` directly* |
| 6 Testing | `test-planning` |
| 7 Release readiness | `release-readiness` |
| 8 Maintenance | `changelog-update`, `adr-write` |

**4. Advance state when a gate passes.**

When the skill reports `Gate: pass`, it will tick the completed phase's checkbox under `Completed Phases` in `workflow-state.md`, set `Current Phase` to the next phase title, and update `Next Step`.

You do not have to edit `workflow-state.md` by hand. If you want to override the advance (e.g., to repeat a phase), edit the file directly and re-invoke the skill.

## verification

```bash
# Workflow state was updated to the next phase.
grep -E '^Current Phase' .ai/workflow/workflow-state.md

# Required artifacts for the now-current phase are present or in progress.
ls docs/requirements/ docs/specs/ docs/architecture/ docs/plan/ 2>/dev/null
```

## common issues

**`.ai/workflow/workflow-state.md` is missing** — the project was not bootstrapped with `init-project.sh`. Render the file from `templates/project-files/workflow-state.md` once and let `workflow-runner` take over from Phase 0.

**Skill never triggers** — confirm the project has `.claude/skills/workflow-runner/SKILL.md` (Claude) or `.codex/skills/workflow-runner/SKILL.md` (Codex). Run `scripts/sync-agent-files.sh` from the system to refresh.

**Gate reports `pass` but you disagree** — open `workflow/phase-gates.md`, find the gate criterion you believe is unmet, and add a `Blockers` entry in `workflow-state.md`. Re-invoke the skill; it will respect blockers and stay on the current phase.

**Skipping straight to Phase 5** — the workflow's Core Rule (`workflow/ai-workflow.md`) is "do not jump straight into coding". The skill enforces this by checking lower-numbered phases first. For genuinely small changes (typo fixes, doc edits), skip the workflow entirely rather than fighting the skill.

## see also

- `claude/.claude/skills/workflow-runner/SKILL.md` — the skill definition.
- `workflow/ai-workflow.md` — the 9-phase workflow this skill orchestrates.
- `workflow/phase-gates.md` — the gate criteria the skill checks at every step.
- `workflow/task-lifecycle.md` — what Phase 5 execution looks like once `active-task.md` is driving.
- [`add-a-custom-claude-skill.md`](add-a-custom-claude-skill.md) — for authoring new phase-adjacent skills the runner can delegate to.
