---
name: project-intake
description: Use when starting a new product or initiative and you need to clarify goals, users, constraints, risks, and the initial project brief before deeper planning.
---

# project intake

Phase 0 of the AI Engineering System workflow (v0.0.1).
Reference: `../../workflow/ai-workflow.md`, `../../workflow/phase-gates.md`.

## when to use

- A user says "I want to build …", "we need a system that …", or "start a new project for …".
- An existing project has no `docs/requirements/project-brief.md` or `.ai/workflow/project-context.md`.
- The goal, users, or constraints are vague and would block writing real requirements.

## what to produce

| Artifact | Path |
|---|---|
| Project brief | `docs/requirements/project-brief.md` |
| Project context (AI-facing) | `.ai/workflow/project-context.md` |

Use `../../templates/docs/project-brief.md` as the starting point for the brief.
See `../../examples/hello-todo-go/docs/requirements/project-brief.md` and
`../../examples/hello-todo-go/.ai/workflow/project-context.md` for filled-in examples.

## process

1. **Collect the problem statement.** Ask the user: "What problem does this product solve, and for whom?" If the answer is vague, ask one follow-up: "What does success look like in concrete terms?"

2. **Identify target users.** Ask who the primary user type is. Commit to a default of "internal developer" if the user cannot answer.

3. **Extract business outcome.** Ask what measurable change is expected (e.g., reduced time, fewer errors, revenue). Do not invent KPIs — leave blank if the user does not know, but flag it.

4. **Define non-goals explicitly.** Ask: "What is out of scope for this initiative?" Record at least two non-goals. If none are stated, propose obvious candidates and ask for confirmation.

5. **Surface constraints.** Ask about technology constraints, deadlines, and team size. Accept defaults from the tech-stack files under `../../stacks/` if the user offers none.

6. **Identify initial risks.** List at least two risks (technical or business). Do not require the user to supply them — draft the most obvious ones based on the stated goal and ask for correction.

7. **Record success measures.** At least one quantitative or observable measure must be present. This is the anchor for the PRD acceptance criteria.

8. **Write `docs/requirements/project-brief.md`** using the template. Fill every section; mark unknown items `TBD` with a comment explaining what information is needed.

9. **Write `.ai/workflow/project-context.md`** as a compact AI-facing summary: system name, goal sentence, primary user type, key constraints, scope cap (what the first iteration will NOT do), and owner contact.

10. **Confirm gate passage.** Before moving to Phase 1, verify Gate 1 from `../../workflow/phase-gates.md`: product goal, user types, problem statement, and key constraints are all present.

## templates to reference

- `../../templates/docs/project-brief.md` — canonical brief template.

## quality checks

- `docs/requirements/project-brief.md` exists and has no empty required sections (blanks must be `TBD` with explanatory comment).
- `.ai/workflow/project-context.md` exists and contains: system name, goal, primary user, constraints, and scope cap.
- At least one success measure is defined.
- At least two non-goals are listed.
- Phase-gate 1 criteria pass (`../../workflow/phase-gates.md` § Gate 1).

## anti-patterns

- **Skipping success measures.** They drive acceptance criteria in the PRD. A brief without them produces unmeasurable requirements.
- **Treating non-goals as optional.** Without explicit non-goals, scope expands silently during implementation.
- **Copying goals verbatim from the user's first sentence.** Restate them as observable outcomes.
- **Leaving constraints blank.** If the user does not know, write the most reasonable default and mark it `ASSUMED` so it can be corrected.
- **Proceeding to Phase 1 while the problem statement is still ambiguous.** One extra clarifying question here prevents multiple rework cycles later.
