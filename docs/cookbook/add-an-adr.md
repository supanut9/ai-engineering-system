# add an architecture decision record

## goal

By the end of this recipe you will have written a complete ADR using the system template, committed it with a Conventional Commits message, and confirmed it is in the right place to render on the docs site.

## prerequisites

- A bootstrapped project with a `docs/architecture/decisions/` directory, or any project where you want to record a decision.
- The AI Engineering System repo accessible at `$SYSTEM` (needed only to locate the template; you may copy the template once and work independently).
- Familiarity with [Conventional Commits](https://www.conventionalcommits.org/).

## steps

**1. Determine the next ADR number.**

List existing ADRs and pick the next monotonically increasing four-digit number:

```bash
ls docs/architecture/decisions/
# 0001-go-gin-hexagonal.md
```

The next ADR is `0002`.

**2. Copy the template.**

```bash
cp $SYSTEM/templates/docs/ADR.md \
   docs/architecture/decisions/0002-<kebab-case-title>.md
```

Replace `<kebab-case-title>` with a short slug describing the decision, for example `use-postgres-for-persistence`.

**3. Fill in the frontmatter fields.**

Open the file. Replace every `{{PLACEHOLDER}}` with real content:

- `{{ADR_NUMBER}}` → `0002`
- `{{TITLE}}` → human-readable title, e.g. `use PostgreSQL for persistence`
- `{{STATUS}}` → `Proposed` (or `Accepted` if already decided)
- `{{DATE}}` → today's date in `YYYY-MM-DD` format

**4. Write the `## context` section.**

Fill the three sub-fields:

- **Problem** — the concrete situation that forced a decision. One to three bullet points.
- **Constraints** — non-negotiable limits (budget, team skill, timeline, compliance).
- **Forces at play** — competing concerns that influenced the options (performance, operational complexity, vendor lock-in).

**5. Write the `## decision` section.**

State the choice in one declarative paragraph: "We will use X because Y." Avoid "we decided to consider X" — the decision section records what was chosen, not what was evaluated.

**6. Write the `## consequences` section.**

List concrete positive, negative, and neutral consequences. Each bullet should describe an observable outcome, not a restatement of the decision.

**7. Fill in `## alternatives considered`.**

Add one row per rejected option. The "why not chosen" column must explain the actual reason, not a tautology.

**8. Fill in `## links`.**

Point to the PRD section, related ADRs by number, and any code modules the decision directly affects.

**9. Stage and commit.**

```bash
git add docs/architecture/decisions/0002-use-postgres-for-persistence.md
git commit -m "docs(adr): [0002] use PostgreSQL for persistence"
```

The commit message format: `docs(adr): [NNNN] <imperative summary>`. This follows Conventional Commits and makes ADRs searchable in `git log`.

**10. Verify rendering (optional, requires mkdocs).**

```bash
mkdocs serve
# open http://127.0.0.1:8000 and navigate to the ADR page
```

Confirm headings render correctly and no placeholder text remains.

## verification

```bash
# No placeholder tokens remain in the file
grep -n '{{' docs/architecture/decisions/0002-use-postgres-for-persistence.md
# → should print nothing

# File is committed
git log --oneline -1
# → docs(adr): [0002] use PostgreSQL for persistence
```

## common issues

**Placeholder text left in the file** — a search for `{{` will reveal any unfilled tokens. The file must not ship with template placeholders.

**ADR number collision** — two people adding an ADR simultaneously may both pick the same number. Resolve by re-numbering one file before merge and updating any cross-references in the `## links` sections.

**Status left as `Proposed` when the decision is already made** — update `status:` to `Accepted` before committing if the team has already agreed. `Proposed` is for decisions still under discussion.

**Commit message missing the ADR number** — the `[NNNN]` token in the commit message is what makes `git log --grep='\[000'` work. Do not omit it.

## see also

- `templates/docs/ADR.md` — the template this recipe uses.
- `examples/hello-todo-go/docs/architecture/decisions/0001-go-gin-hexagonal.md` — a fully filled-in ADR to use as a reference.
- [`write-a-plan-file.md`](write-a-plan-file.md) — plan files often surface the decisions that become ADRs.
- `workflow/ai-workflow.md §Phase 3` — Architecture phase, where ADRs are required output.
- `claude/.claude/skills/adr-write/SKILL.md` — the Claude skill that automates ADR drafting from a prompt.
