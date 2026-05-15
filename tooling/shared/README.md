# shared tooling

Language-agnostic baseline configs that every project bootstrapped from this system
should adopt. The `init-project.sh` script copies these into new projects automatically.

## files

| File | Purpose |
|---|---|
| `.editorconfig` | UTF-8, LF line endings, trim trailing whitespace, 2-space default indent |
| `.markdownlint.jsonc` | markdownlint-cli2 config; disables MD013/MD033, allows sibling duplicate headings |
| `commitlint.config.mjs` | Conventional Commits rules (header max 72 chars, no uppercase subject) |
| `.commitizen.yaml` | commitizen interactive commit helper; tag format `v$version` |
| `.pre-commit-config.shared.yaml` | Language-agnostic pre-commit hooks: whitespace, EOL, YAML/TOML/JSON validation, gitleaks |
| `.gitattributes` | LF normalisation for all text files; language-stat annotations for GitHub |
| `.gitignore.go` | Go-specific ignores (binaries, test output, go.work, air temp files) |
| `.gitignore.node` | Node.js ignores (node_modules, dist, .next, cache dirs, coverage) |
| `.gitignore.python` | Python ignores (pycache, venv, .coverage, mypy/ruff caches, dist) |
| `.gitignore.common` | Universal ignores (.DS_Store, .idea, .vscode, .env*, *.log, tmp/) |

## adoption

1. Copy the files you need into your project root.
2. For `.gitignore`, concatenate the relevant stack-specific file(s) with
   `.gitignore.common` into a single `.gitignore`.
3. For pre-commit, copy `.pre-commit-config.shared.yaml` to your project root
   as `.pre-commit-config.yaml` (or merge its `repos` list into your existing config),
   then run `pre-commit install`.
4. For commitlint, copy `commitlint.config.mjs` to the project root and install
   `@commitlint/cli` and `@commitlint/config-conventional`.

## pre-commit hook versions (2026-05-15)

| Hook repo | Rev |
|---|---|
| pre-commit/pre-commit-hooks | v5.0.0 |
| adrienverge/yamllint | v1.37.0 |
| gitleaks/gitleaks | v8.27.2 |
| compilerla/conventional-pre-commit | v3.6.0 |

Run `pre-commit autoupdate` to bump hook revisions.

## notes

- `.markdownlint.jsonc` is identical to the one at the system repo root; keep them in sync.
- The gitleaks hook requires a `gitleaks.toml` at the repo root only if you need custom
  allow-lists; it works without one for most projects.
- `.commitizen.yaml` defaults to `version_provider: commitizen` (reads from
  `[tool.commitizen]` in `pyproject.toml`). For Node projects, change to
  `version_provider: npm`. For Go projects, use a plain `VERSION` file and set
  `version_provider: commitizen` with `version_files = ["VERSION"]`.
