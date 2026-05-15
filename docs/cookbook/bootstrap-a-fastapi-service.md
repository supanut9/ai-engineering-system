# bootstrap a fastapi service

## goal

By the end of this recipe you will have a running FastAPI service skeleton with all four quality gates green: pytest passes, ruff reports no lint errors, mypy reports no type errors, and uvicorn starts the server on the default port.

## prerequisites

- **AI Engineering System** cloned locally (referred to below as `$SYSTEM`).
- **bash 4+** — macOS ships bash 3.2. Install with `brew install bash`.
- **Python 3.11+** — [python.org/downloads](https://www.python.org/downloads/). The stack requires `tomllib` (3.11+) for tooling validation.
- **uv** 0.11.14+ — [docs.astral.sh/uv](https://docs.astral.sh/uv/). Used by the generated `make setup` target.
- **make** — pre-installed on macOS and Linux.
- **git** — any recent version.

## steps

**1. Run the init script with the FastAPI stack.**

```bash
cd $SYSTEM
./scripts/init-project.sh --name my-api --stack fastapi-layered --agent claude
```

Expected output:

```
[info] Bootstrapped: ./my-api
   stack   : fastapi-layered
   agent   : claude
   system  : v0.0.1
```

**2. Enter the project.**

```bash
cd my-api
```

**3. Create and activate the virtual environment, install dependencies.**

```bash
make setup
```

`make setup` runs `uv venv .venv && uv pip install -e ".[dev]"`. Expected output ends with a list of installed packages and no errors. The virtual environment is at `.venv/`.

Activate it for subsequent commands:

```bash
source .venv/bin/activate
```

**4. Run the test suite.**

```bash
make test
```

This runs `pytest`. Expected output:

```
========================= test session starts ==========================
...
========================= N passed in 0.Xs ===========================
```

All tests must pass. The skeleton includes at minimum one health-endpoint test.

**5. Run the linter.**

```bash
make lint
```

This runs `ruff check .`. Expected output:

```
All checks passed!
```

**6. Run the type checker.**

```bash
make typecheck
```

This runs `mypy --strict`. Expected output:

```
Success: no issues found in N source files
```

If the skeleton ships without full type annotations, mypy may report errors. Fix them before proceeding: strict mypy is a gate, not a suggestion.

**7. Start the server and verify the health endpoint.**

```bash
make run
# INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

In a second terminal:

```bash
curl -s localhost:8000/healthz
# {"status":"ok"}
```

**8. Complete Phase 0 intake.**

Open `.ai/workflow/project-context.md` and fill in the project goal, audience, and constraints. The generated layout places source code under `my_api/`, tests under `tests/`, and workflow artifacts under `.ai/workflow/`.

## verification

```bash
make test       # pytest — exit 0
make lint       # ruff — exit 0
make typecheck  # mypy --strict — exit 0
curl -s localhost:8000/healthz | python3 -m json.tool  # prints {"status": "ok"}
$SYSTEM/scripts/doctor.sh --target .   # exit 0, FAIL: 0
```

## common issues

**`uv: command not found`** — install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`. Restart your shell and verify with `uv --version`.

**`mypy --strict` fails on generated skeleton code** — strict mode requires explicit type annotations on all function signatures. Add `-> None` return types to functions without a return, and annotate all parameters. Do not disable strict mode as a workaround.

**`ruff check` flags imports in the generated `__init__.py`** — the skeleton may use a `from my_api import *` pattern that ruff flags as `F403`. Replace with explicit imports. The ruff config at `ruff.toml` intentionally enables `F403` detection.

**Port 8000 conflict** — set `make run PORT=9000` or `uvicorn my_api.main:app --port 9000 --reload` if another process holds port 8000.

## see also

- [`bootstrap-go-hexagonal.md`](bootstrap-go-hexagonal.md) — the Go counterpart to this recipe.
- `stacks/fastapi.md` — the FastAPI stack profile with version pins and conventions.
- `project-templates/python/fastapi-layered.md` — the template blueprint for this stack's file layout.
- `tooling/python/` — ruff, mypy, and pre-commit configs copied into the project by `init-project.sh`.
- [`run-the-hello-todo-example.md`](run-the-hello-todo-example.md) — a fully filled-in reference project (Go) showing the same Phase 0–8 structure applied to a real service.
- `workflow/ai-workflow.md` — the 8-phase workflow this service is set up to follow.
