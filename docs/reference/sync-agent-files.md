# sync-agent-files.sh

Re-sync AI adapter files from the AI Engineering System into an existing bootstrapped project.

## Synopsis

```
./scripts/sync-agent-files.sh [options]
```

## Description

`sync-agent-files.sh` updates the AI adapter files (`CLAUDE.md`, `.claude/`, `.codex/`) inside a project that was previously bootstrapped with `init-project.sh`. Use it when a new system version ships and you want to pull in updated agent configuration without re-initialising the entire project.

Run the script from inside the target project directory, or pass `--target` explicitly.

When no `--agent` flag is provided, the script auto-detects the adapter type by checking whether `CLAUDE.md`, `.claude/`, or `.codex/` already exist in the target.

The script requires **bash 4+**.

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--target <path>` | current directory | Path to the bootstrapped project to update. |
| `--agent <agent>` | auto-detected | Adapter to sync: `claude`, `codex`, or `both`. If omitted, the script detects which adapters are present in the target. |
| `--yes`, `-y` | off | Skip the confirmation prompt and overwrite files immediately. |
| `--check` | off | Diff-only mode: compare source and destination files, print any drift, and exit non-zero if drift exists. No files are written. |
| `--help`, `-h` | — | Print usage and exit. |

## Examples

```bash
# Run from inside the project — auto-detects adapter, prompts for confirmation
cd ~/projects/my-api
/path/to/ai-engineering-system/scripts/sync-agent-files.sh

# Check for drift without writing anything
/path/to/ai-engineering-system/scripts/sync-agent-files.sh \
  --target ~/projects/my-api --check

# Sync both adapters non-interactively (CI/scripting use)
/path/to/ai-engineering-system/scripts/sync-agent-files.sh \
  --target ~/projects/my-api --agent both --yes

# Sync Claude adapter only into a specific directory
/path/to/ai-engineering-system/scripts/sync-agent-files.sh \
  --target /srv/apps/todo-api --agent claude --yes
```

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success — files synced (or no drift found in `--check` mode). |
| `1` | Target directory does not exist. |
| `1` | Invalid `--agent` value. |
| `1` | Drift detected in `--check` mode. |
| `1` | Unknown flag passed. |
| `1` | Bash version is older than 4. |
