# doctor.sh

Verify that a bootstrapped project still follows AI Engineering System conventions.

## Synopsis

```
./scripts/doctor.sh [--target <path>] [--strict]
```

## Description

`doctor.sh` is an advisory health-check intended to run **inside a bootstrapped project** (or against one via `--target`). It surfaces drift between the project and the system conventions early so contributors can correct it before it compounds.

Each check produces one of three outcomes:

- `PASS` — the convention is satisfied.
- `WARN` — the convention is mostly satisfied or the gap is non-critical.
- `FAIL` — the convention is unmet and downstream tooling may break.

The script tallies the results at the end and exits non-zero on any `FAIL`. With `--strict`, `WARN` is treated as `FAIL`.

The eight check groups:

1. **Workflow files** — `.ai/workflow/{project-context,workflow-state,active-task}.md` present and non-empty.
2. **Repo health files** — `README.md`, `CHANGELOG.md`, `.gitignore`, `.env.example`.
3. **Adapter files** — `.claude/settings.json` valid JSON, `.codex/config.toml` valid TOML.
4. **System version drift** — compare the `system_version` recorded in `.ai/workflow/project-context.md` against the system's current `VERSION`.
5. **Phase artifacts** — advisory matrix showing which workflow phases the project has reached.
6. **Tooling configs** — per-stack expected lint/format/test configs.
7. **Workflow doc references** — `CONTRIBUTING.md` mentions Conventional Commits and DCO sign-off.
8. **Git hygiene** — repository initialised, at least one commit, dirty-file count reported as info.

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--target <path>` | `.` | Directory to check. Use this to run the system's `doctor.sh` against a project that lives elsewhere. |
| `--strict` | off | Treat `WARN` as `FAIL`. Suitable for CI gates. |
| `--help`, `-h` | — | Print usage and exit. |

## Examples

```bash
# Run inside a bootstrapped project
cd my-service && /path/to/ai-engineering-system/scripts/doctor.sh

# Run from the system repo against a project elsewhere
./scripts/doctor.sh --target /path/to/my-service

# Strict mode for CI
./scripts/doctor.sh --target . --strict
```

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | No `FAIL` results (and no `WARN` under `--strict`). |
| `1` | At least one `FAIL`, or any `WARN` when `--strict` is set. |
| `1` | Unknown flag or invalid `--target` path. |
| `1` | Bash version is older than 4. |

## See also

- [init-project](init-project.md) — bootstrap a new project.
- [sync-agent-files](sync-agent-files.md) — adopt adapter-file updates from a newer system version.
- [governance](../governance.md) — release model and drift policy.
