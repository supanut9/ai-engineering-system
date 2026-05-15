# add a custom claude skill

## goal

By the end of this recipe you will have authored a new SKILL.md, placed it in the correct location inside your project's `.claude/skills/` directory, and confirmed that Claude Code loads and applies it when triggered by the right prompt.

## prerequisites

- A bootstrapped project with a `.claude/` directory (created by `init-project.sh --agent claude` or `--agent both`).
- Claude Code installed and the project open.
- Review `claude/.claude/skills/pr-review/SKILL.md` in the system repo as a concrete example before writing your own.
- Review `templates/skills/skill-authoring-guide.md` for authoring conventions.

## steps

**1. Choose a name for the skill.**

The name is a short, lowercase, hyphenated identifier that describes what the skill does: `db-migration-checklist`, `changelog-update`, `api-review`. It becomes both the directory name and the YAML `name:` field.

**2. Create the skill directory.**

```bash
mkdir -p .claude/skills/<skill-name>
```

**3. Copy the template.**

```bash
cp $SYSTEM/templates/skills/SKILL.md.template \
   .claude/skills/<skill-name>/SKILL.md
```

**4. Fill in the YAML frontmatter.**

Open the file. The first block is YAML frontmatter that Claude Code reads to decide when to invoke the skill:

```yaml
---
name: <skill-name>
description: Use when <trigger condition> — <brief one-line purpose>.
---
```

The `description` field is the most important field. Claude Code uses it to match user prompts to skills. Write it as "Use when [trigger situation] to [outcome]." Be specific: vague descriptions cause skills to be ignored or misapplied.

**5. Write the six standard sections.**

Replace every `{{PLACEHOLDER}}` with real content:

- `## when to use` — two to four bullet points describing prompt patterns or user intents that should trigger this skill. Describe the user's situation, not the tool's internals.
- `## what to produce` — the concrete artifact(s) the skill must emit. Include file paths, naming conventions, and format. Example: "A Markdown checklist at `docs/release/go-live-checklist.md` using the template at `templates/docs/go-live-checklist.md`."
- `## process` — numbered steps. Each step starts with an imperative verb. Be explicit about what Claude reads before acting, what it creates, and in what order.
- `## templates to reference` — bullet list of relative paths to templates this skill uses, with a one-line description of each.
- `## quality checks` — concrete, verifiable conditions the output must satisfy. Each check should be answerable yes/no.
- `## anti-patterns` — two to four common mistakes with a "why it is wrong and what to do instead" clause.

**6. Reload Claude Code.**

Skills are loaded when Claude Code opens a project. To pick up the new skill without restarting your terminal session, close and reopen the Claude Code panel, or run:

```
/reload
```

in the Claude Code chat interface (if supported by your version).

**7. Test the skill with a triggering prompt.**

Open Claude Code and send a prompt that matches the skill's `## when to use` conditions. Observe whether Claude Code applies the skill's process rather than a generic response.

For a skill named `db-migration-checklist` with the trigger "Use when adding a database migration", test with:

```
I'm about to add a database migration. Help me work through the checklist.
```

## verification

```bash
# Skill file is in the right location
ls .claude/skills/<skill-name>/SKILL.md

# No unfilled placeholder tokens
grep -n '{{' .claude/skills/<skill-name>/SKILL.md
# → should print nothing

# Frontmatter parses (requires python3)
python3 -c "
import re, sys
text = open('.claude/skills/<skill-name>/SKILL.md').read()
m = re.match(r'^---\n(.+?)\n---', text, re.DOTALL)
sys.exit(0 if m else 1)
print('frontmatter ok')
"
```

## common issues

**Skill is not triggered by prompts** — the `description` field in the frontmatter is the matching signal. Make it more specific. Compare it against working skills such as `claude/.claude/skills/pr-review/SKILL.md`: the description starts with "Use when reviewing a pull request …" which precisely matches the user's likely wording.

**Skill directory is outside `.claude/skills/`** — Claude Code only scans `.claude/skills/<name>/SKILL.md`. A file placed at `.claude/SKILL.md` or `.claude/skills/SKILL.md` (without a subdirectory) will not be picked up.

**`## process` steps are too vague** — if a step says "review the file", Claude has no guidance on what to look for. Rewrite with explicit criteria: "Read the diff and flag any function that lacks an error return path as a blocking issue."

**Skill conflicts with a system-level skill** — if the system repo's `.claude/skills/` already ships a skill with the same name, your project-level skill will shadow it. This is intentional — project skills override system skills — but confirm the override is what you want before deploying.

## see also

- `claude/.claude/skills/pr-review/SKILL.md` — a production-quality skill to model yours after.
- `templates/skills/SKILL.md.template` — the template this recipe copies.
- `templates/skills/skill-authoring-guide.md` — detailed authoring conventions.
- [`bootstrap-go-hexagonal.md`](bootstrap-go-hexagonal.md) — confirms the `.claude/` directory structure this recipe writes into.
- `workflow/ai-workflow.md` — the phase model skills are designed to support.
