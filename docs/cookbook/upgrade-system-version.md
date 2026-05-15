# upgrade to a newer system version

## goal

By the end of this recipe your bootstrapped project's AI adapter files will match the latest version of the AI Engineering System, `doctor.sh` will report no version-drift warnings, and the update will be captured in a single clean commit.

## prerequisites

- A project bootstrapped from the AI Engineering System (has `.ai/workflow/project-context.md` with a `system_version:` entry).
- The AI Engineering System repo at a known local path (referred to below as `$SYSTEM`).
- **bash 4+**.
- Internet access to `git pull` the system repo if you want the latest upstream changes.

## steps

**1. Check the current system version recorded in your project.**

```bash
grep system_version .ai/workflow/project-context.md
# system_version: 0.0.1
```

**2. Check the upstream system version.**

```bash
cat $SYSTEM/VERSION
# 0.1.0
```

If the versions match, you are up to date. Stop here.

**3. Read the migration guide for your version range.**

```bash
ls $SYSTEM/docs/migrations/
# v0.0.1-to-v0.1.0.md
```

Open the relevant migration page before running the sync script. Migration guides document breaking changes, renamed files, and manual steps that the sync script cannot automate.

**4. Run the sync script in check mode to see what has drifted.**

```bash
$SYSTEM/scripts/sync-agent-files.sh --check --target .
```

Expected output lists each differing file:

```
[drift] CLAUDE.md: differs
[drift] .claude/: differs: settings.json
[drift] .claude/: missing in project: skills/adr-write/SKILL.md
```

Exit code 1 means drift was found.

**5. Apply the sync.**

```bash
$SYSTEM/scripts/sync-agent-files.sh --target . --yes
```

The `--yes` flag skips the interactive confirmation prompt. Remove it if you want to confirm before each overwrite. The script copies all adapter files from the system's `claude/` and/or `codex/` directories into your project, overwriting the old versions.

**6. Run `doctor.sh` to confirm drift is resolved.**

```bash
$SYSTEM/scripts/doctor.sh --target .
```

Expected summary:

```
doctor: my-api  system v0.1.0
  PASS: N
  WARN: 0
  FAIL: 0
```

A `WARN` on `system_version mismatch` at this point means the project-context file still records the old version. Update it manually:

```bash
sed -i '' 's/system_version: 0\.0\.1/system_version: 0.1.0/' \
  .ai/workflow/project-context.md
```

(Linux: omit the `''` after `-i`.)

**7. Commit the update.**

```bash
git add CLAUDE.md .claude/ .ai/workflow/project-context.md
git commit -m "chore: sync adapter files to ai-engineering-system v0.1.0"
```

## verification

```bash
grep system_version .ai/workflow/project-context.md
# system_version: 0.1.0   ← must match $SYSTEM/VERSION

$SYSTEM/scripts/sync-agent-files.sh --check --target .
# exit 0 (no drift)
```

## common issues

**`sync-agent-files.sh --check` exits 0 but doctor still shows a mismatch** — the sync script checks adapter files (CLAUDE.md, .claude/, .codex/), not the `system_version` key in project-context.md. You must update that field manually (step 6).

**Migration guide references files the script does not touch** — some migrations require manual steps: renaming a workflow file, adding a new required section to project-context.md, or updating a Makefile target. Read the migration guide completely before running the sync.

**`--yes` overwrites a locally customised CLAUDE.md** — the sync is a full overwrite. If your project has customised `CLAUDE.md`, diff it against the incoming version first (`diff CLAUDE.md $SYSTEM/claude/CLAUDE.md`) and re-apply your customisations after the sync. Consider keeping local overrides in a separate `CLAUDE.local.md` that the main `CLAUDE.md` references.

**No migration guide exists for the version range** — if `docs/migrations/` does not contain the relevant file, check the system repo's `CHANGELOG.md` for breaking changes. Minor-version bumps (0.x.0) should have a guide; patch bumps (0.0.x) rarely do.

## see also

- `scripts/sync-agent-files.sh` — the sync script this recipe uses.
- `scripts/doctor.sh` — the verification tool.
- `docs/migrations/` — migration guides per version pair.
- [`bootstrap-go-hexagonal.md`](bootstrap-go-hexagonal.md) — how the project was originally bootstrapped (for reference on what `init-project.sh` placed).
- `workflow/ai-workflow.md` — understanding what the adapter files configure.
