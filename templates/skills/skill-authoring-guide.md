# skill authoring guide

A practical reference for contributors adding new skills to the AI Engineering System.

---

## how a skill works (the runtime model)

Claude Code loads skill files at startup. It reads the YAML frontmatter — the `name:` and
`description:` fields — and indexes them. When a user prompt arrives, Claude compares it against
the indexed descriptions to decide whether a skill applies. If there is a strong match, Claude
invokes the skill via the Skill tool and reads the full skill body as instructions for that turn.

The body is not read at load time — only at invocation. Write the body as direct instructions that
Claude will execute in the current context, not as documentation about the skill.

Codex uses an analogous discovery mechanism. Skills at `codex/.codex/skills/<name>/SKILL.md` are
loaded at session start and matched against the active task context.

---

## where skills live in this repo

| Path | Purpose |
|---|---|
| `claude/.claude/skills/<name>/SKILL.md` | Canonical source for Claude Code. |
| `codex/.codex/skills/<name>/SKILL.md` | Mirror for Codex. Content is byte-identical. |

Both directories are copied into bootstrapped projects by `scripts/init-project.sh`.

For skills that are specific to one project (not intended to ship with the system), add them at
the project's own `.claude/skills/<name>/SKILL.md` after bootstrap. Do not put project-specific
skills into this repo.

---

## writing a good description

The `description:` field drives invocation. Claude cannot invoke a skill it cannot match.

Rules:

- One sentence, 140 characters or fewer.
- Start with a trigger phrase: `Use when …` or `Use to …`.
- Be specific about the situation, not the domain. Compare:
  - Weak: `Handles pull request reviews.`
  - Strong: `Use when reviewing a pull request to apply consistent review focus across code quality, test coverage, and breaking-change risk.`
- Do not repeat the skill name.
- Do not write a tagline or marketing copy.

The description is not shown to the user. It is machine-read. Optimize for precision, not appeal.

---

## writing a good body

Write the body as instructions Claude will follow in the current turn. Use the imperative mood.
The reader is Claude, not a human developer.

### the six standard sections

| Section | Purpose | Required? |
|---|---|---|
| `## when to use` | Bullet list of triggering situations | Yes |
| `## what to produce` | Concrete artifact(s): paths, formats, naming | Yes |
| `## process` | Ordered steps Claude must follow | Yes |
| `## templates to reference` | Links to relevant templates in this repo | If templates exist |
| `## quality checks` | Verifiable conditions that define "done" | Yes |
| `## anti-patterns` | Common mistakes and why they are wrong | Yes |

Omit a section only when it genuinely does not apply (e.g., a skill with no relevant templates).
Do not omit `## process` — Claude needs ordered steps to produce consistent output.

### length

60–160 lines is the normal range. A skill that requires more is likely doing two things; split it
into two skills with focused descriptions.

---

## naming convention

- Format: kebab-case.
- Pattern: verb-noun (`pr-review`, `changelog-update`) or noun-only (`adr-write`, `architecture-design`).
- Be descriptive of the task, not the tool or persona.
- Avoid generic names: `helper`, `utility`, `misc` are not valid skill names.

The directory name under `claude/.claude/skills/` must match the `name:` field in frontmatter.

---

## versioning and drift

Skills are versioned with the system as a whole. The `VERSION` file at the repo root is the
canonical version number. When a skill's format changes in a way that breaks existing bodies,
bump the system minor version and add a migration note in `docs/migrations/`.

User-global skills at `~/.claude/skills/` override system skills of the same name. This is a
personal layer. Do not sync personal skills upward into the system repo — flow is one-way:
system → user/project.

---

## testing a skill

Before opening a pull request:

1. Bootstrap a project (or open an existing one) with the system loaded.
2. Run a prompt that matches the new skill's description.
3. Confirm Claude announces invocation via the Skill tool.
4. Confirm the output satisfies every item in the skill's `## quality checks` section.

For Codex, run the equivalent flow in a Codex session with the bootstrapped project open.

Document the test prompt as a bullet under `## when to use` so future maintainers can replay it.

---

## adding a codex mirror

The mirror is the same content at a different path:

```
claude/.claude/skills/<name>/SKILL.md   ← write here first
codex/.codex/skills/<name>/SKILL.md     ← cp from the Claude path
```

Keep the two files byte-identical. A future `scripts/doctor.sh` (Phase 6) will diff them and
report drift. Do not introduce Codex-specific divergences — if the two runtimes need genuinely
different instructions, create separate skill names (e.g., `pr-review` and `codex-pr-review`).

---

## common mistakes

- **Exhortation without instruction.** "Be careful with breaking changes" tells Claude nothing
  actionable. Replace with a specific step: "Check the public API surface against the previous
  release tag before approving."

- **Missing `## process` section.** Without ordered steps, Claude produces inconsistent output
  across invocations.

- **Vague description.** If the description does not tightly match a real user prompt, the skill
  is never invoked. Test the description against at least two real prompts before merging.

- **Overlapping skill names.** `code-review` and `pr-review` covering the same ground cause
  unpredictable invocation. Pick one name, keep one skill, and redirect the other via an
  anti-pattern note if needed.

- **Re-implementing a template.** If a template at `templates/docs/ADR.md` already defines
  the ADR structure, the skill body should reference that template, not duplicate its contents.

---

## example reference skill

`claude/.claude/skills/pr-review/SKILL.md` (produced by Lane L15) is the canonical example of a
fully-authored skill in this system. Read it before writing a new skill.
