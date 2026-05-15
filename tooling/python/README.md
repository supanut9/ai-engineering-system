# python tooling configs

Python tooling configurations for projects bootstrapped from the ai-engineering-system.
These files provide enforceable lint, format, type-check, and pre-commit standards
for Python 3.12+ services (e.g. FastAPI). They are landed in Phase 3 ahead of the
Python stack profile (Phase 5) because the configs are cheap and fit the
"make standards enforceable" theme.

## files

| file | purpose |
|---|---|
| `ruff.toml` | ruff linter + formatter config; target Python 3.12 |
| `pyproject.toml.template` | project metadata + tooling config template (hatch build backend) |
| `.pre-commit-config.yaml` | pre-commit hooks: file hygiene, ruff lint+format, mypy |

## stack assumptions

- Python 3.12 minimum (compatible with 3.11 and 3.13 by adjusting `target-version`
  and `requires-python`).
- `src/` layout: source code lives under `src/<package>/`, tests under `tests/`.
- pytest for all test types; slow and integration tests gated via markers.
- hatch as build backend; uv recommended as the package resolver and installer.

## adoption

1. Copy `ruff.toml` and `.pre-commit-config.yaml` to the project root.
2. Copy `pyproject.toml.template` to `pyproject.toml` and replace all `{{PROJECT_NAME}}`
   placeholders with the actual project name. Fill in `description` and `authors`.
3. Install the dev dependencies:
   ```
   uv venv && uv pip install -e ".[dev]"
   ```
   Or with plain pip:
   ```
   python -m venv .venv && source .venv/bin/activate && pip install -e ".[dev]"
   ```
4. Wire the git hooks:
   ```
   pre-commit install
   ```
5. Verify all hooks pass against the current codebase:
   ```
   pre-commit run --all-files
   ```

## versions pinned

| tool | version |
|---|---|
| ruff | 0.15.13 |
| mypy | 2.1.0 |
| pytest | 9.0.3 |
| pre-commit | 4.6.0 |
| hatch | 1.16.5 |
| uv | 0.11.14 (see note below) |

## customisation

**ruff rules** — drop codes from `[lint.select]` as needed: `S` for internal tooling,
`ARG` for framework callbacks, `PL` for large legacy files.

**mypy strict** — for untyped third-party libraries add an override:
`[[tool.mypy.overrides]] / module = ["lib.*"] / ignore_missing_imports = true`.

**Python version** — to target 3.11, set `target-version = "py311"` in `ruff.toml`,
`python_version = "3.11"` in `[tool.mypy]`, and `requires-python = ">=3.11"` in
`[project]`.

## note on uv

`uv` (0.11.14) is the recommended package manager — a single fast binary that replaces
`pip` + `venv`. Plain `pip` works everywhere `uv pip` appears in the adoption steps.
`uv` is not required by any config file; it is a developer-experience recommendation.
