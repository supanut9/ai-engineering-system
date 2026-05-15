# tooling/go

Go tooling configurations for projects bootstrapped from this system.

## Purpose

These files provide enforceable code-quality tooling for Go projects. Starting
with Phase 3, `init-project.sh` copies them into every bootstrapped Go project
automatically. Until that wiring lands, copy them manually (see Installation).

The configs complement the prose in `standards/coding-standards.md` by turning
written conventions into violations that block CI.

## Files

| File | Purpose |
|---|---|
| `.golangci.yml` | golangci-lint v2 configuration — linter set, per-linter settings, exclusion rules, run timeout |
| `.editorconfig` | Editor-agnostic indentation and line-ending rules (tabs for Go/Makefile, spaces for YAML/JSON/Markdown) |
| `.pre-commit-config.yaml` | pre-commit framework hooks — whitespace, merge-conflict, YAML, golangci-lint, `go mod tidy`, short tests |
| `Makefile.template` | Drop-in Makefile with `setup`, `run`, `test`, `test-race`, `test-integration`, `lint`, `lint-fix`, `build`, `clean`, `help` |

## Installation

When `init-project.sh` is wired (Phase 3), this is automatic. Until then, copy
manually from your project root:

```bash
SYSTEM_DIR=/path/to/ai-engineering-system
cp "$SYSTEM_DIR/tooling/go/.golangci.yml"           .
cp "$SYSTEM_DIR/tooling/go/.editorconfig"           .
cp "$SYSTEM_DIR/tooling/go/.pre-commit-config.yaml" .
cp "$SYSTEM_DIR/tooling/go/Makefile.template"       Makefile
```

Activate pre-commit hooks:

```bash
pip install pre-commit        # or: brew install pre-commit
pre-commit install
pre-commit install --hook-type pre-push
```

`Makefile.template` assumes an entrypoint at `./cmd/api/`. Rename `run` and
`build` targets if the project uses a different path.

## Pinned versions

| Tool | Version | Rationale |
|---|---|---|
| golangci-lint | 2.11.4 | Latest v2 release (2026-05-15); v2 config schema is incompatible with v1 |
| pre-commit-hooks | v4.6.0 | Latest stable general-purpose hook collection |

## Customisation

- **Linter set** — add or remove entries under `linters.enable` in `.golangci.yml`.
- **Go version** — update `run.go` to match the project's `go.mod` directive.
- **Max issues** — `issues.max-issues-per-linter` and `issues.max-same-issues` default to `0` (unlimited); set a positive integer to cap output.
- **Test exclusions** — add `issues.exclude-rules` entries for generated code or acceptable test-file patterns.
- **Makefile entrypoint** — change `./cmd/api` in `run` and `build` if the binary lives elsewhere.
