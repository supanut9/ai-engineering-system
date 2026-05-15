# write a plan file

## goal

By the end of this recipe you will know when a feature warrants a `<feature>-plan.md` at the repo root, how to draft one in Claude Code plan mode, and how to lock decisions before any implementation starts.

## prerequisites

- Claude Code installed and configured for the project (`.claude/` present).
- A project already bootstrapped from the AI Engineering System, or any repo where multi-phase work is about to begin.
- Read `workflow/ai-workflow.md §Plan Files At Project Root` for the rationale.

## steps

**1. Decide whether the feature needs a plan file.**

Write a plan file when the work:

- spans more than roughly 3 phases or touches more than roughly 10 files;
- requires explicit user approval of scope or stack choices before implementation begins;
- benefits from being readable as a single document (PRD + architecture + roadmap in one place).

Routine bug fixes, small refactors, and isolated doc edits do not need a plan file. When in doubt, write the plan — it costs one focused session and prevents weeks of rework.

**2. Open Claude Code in plan mode.**

In your terminal, open Claude Code for the project. Before writing any code, tell Claude to enter plan mode:

```
I want to plan <feature-name> before implementing anything.
Do not create or edit any source files yet. Let's draft a plan file first.
```

Claude Code will restrict itself to reading existing files and drafting markdown.

**3. Gather context.**

Ask Claude to read the relevant existing docs:

```
Read .ai/workflow/project-context.md, the current workflow-state.md,
and any existing phase artifacts in docs/ that relate to <feature>.
```

**4. Identify and surface decision points.**

Before drafting, explicitly ask Claude to list any decisions that require your input — stack choices, scope boundaries, licensing, deployment targets. Claude should not lock these in without your approval.

**5. Draft the plan using the template structure.**

Reference `templates/docs/plan.md` for the standard sections:

1. Status, last updated, owner, audience — with a "locked decisions" header once approved.
2. Context and goal.
3. Locked scope — what is in and what is out.
4. Audit — what already exists vs. what needs to be built.
5. Architecture — service boundaries, data flow, key tradeoffs (one page, not a full spec).
6. File layout — the target directory tree.
7. Phased roadmap — phases sequential; lanes within each wave parallel.
8. Parallel sub-agent execution plan (see `workflow/subagent-contract.md §Parallel Lanes And Waves`).
9. Critical decisions table.
10. Verification — the smoke test steps that prove Phase 1 done.
11. Risks and open questions.
12. Pre-flight checklist before execution.

You do not need every section for every plan. Skip sections that genuinely do not apply, but document why.

**6. Ask Claude to write the file to the project root.**

```
Write the plan to <feature>-plan.md at the repo root. Do not start any implementation yet.
```

The file name follows the pattern seen in this system: `cms-plan.md`, `form-plan.md`, `ai-engineering-system-plan.md`.

**7. Review and lock decisions.**

Read the generated plan. For each open question, either answer it (locking the decision) or explicitly mark it as deferred. Update the plan file with your answers before exiting plan mode.

**8. Exit plan mode and reference the plan in all subsequent work.**

```
The plan is approved. You may now begin Phase 1 Wave 1 as described in the plan.
```

From this point, every lane brief and subagent task should link back to the relevant plan section rather than re-deriving design.

## verification

```bash
# File exists at the repo root
ls <feature>-plan.md

# No open TBD markers remain in locked sections
grep -n 'TBD\|TODO\|FIXME' <feature>-plan.md
```

Check that the "locked decisions" table in the plan has at least the stack choice, license (if relevant), and audience documented.

## common issues

**Plan written inside `docs/` instead of the repo root** — the plan file intentionally lives at the root so it is the first thing visible when a contributor opens the repo. Move it with `git mv`.

**Plan mode drifts into implementation** — if Claude Code starts creating source files or editing non-plan files, interrupt and redirect: "We are still in plan mode. Only read files and write the plan document." Enforce this by checking `git status` before approving the plan.

**Scope grows during planning** — it is normal to discover more work during planning. Record each scope expansion in the plan's "open questions" section and get explicit approval before locking it in. Do not silently expand the plan.

**Plan file never updated after execution starts** — the plan is a living artifact. When a decision changes mid-implementation, update the plan file in the same commit that enacts the change. A stale plan is worse than no plan.

## see also

- `workflow/ai-workflow.md §Plan Files At Project Root` — the authoritative description of when and how to write plan files.
- `templates/docs/plan.md` — the plan template this recipe references.
- [`split-work-into-parallel-lanes.md`](split-work-into-parallel-lanes.md) — how to decompose the plan's wave table into actual subagent calls.
- [`add-an-adr.md`](add-an-adr.md) — plan decisions that involve major architectural choices should produce ADRs.
- `workflow/subagent-contract.md §Parallel Lanes And Waves` — the parallel execution model referenced in plan step 8.
