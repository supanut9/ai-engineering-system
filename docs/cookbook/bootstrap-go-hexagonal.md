# bootstrap a go-gin-hexagonal service

## goal

By the end of this recipe you will have a running Go-Gin-Hexagonal project skeleton: all workflow files stubbed under `.ai/workflow/`, agent adapter files under `.claude/`, a green `make test` run, and `scripts/doctor.sh` reporting no failures.

## prerequisites

- **AI Engineering System** cloned locally (any path; referred to below as `$SYSTEM`).
- **bash 4+** — macOS ships bash 3.2. Install with `brew install bash`.
- **Go 1.21+** — [go.dev/dl](https://go.dev/dl/).
- **make** — pre-installed on macOS and Linux.
- **git** — any recent version.
- Read `docs/quickstart.md` first if this is your first project bootstrap.

## steps

**1. Clone or locate the system repo.**

```bash
export SYSTEM=/path/to/ai-engineering-system
cd "$SYSTEM"
```

**2. Run the init script.**

```bash
./scripts/init-project.sh --name my-api --stack go-gin-hexagonal --agent claude
```

The script prints a next-steps banner when complete:

```
[info] Bootstrapped: ./my-api
   stack   : go-gin-hexagonal
   agent   : claude
   system  : v0.0.1

Next steps:
  1. cd ./my-api
  2. Open .ai/workflow/project-context.md and complete Phase 0 intake.
  3. Read CLAUDE.md and the workflow phase docs.
```

**3. Enter the project and install dependencies.**

```bash
cd my-api
make setup
```

`make setup` runs `go mod tidy`. Expected output ends with no errors and a populated `go.sum`.

**4. Run the test suite.**

```bash
make test
```

Expected output:

```
go test ./...
ok  	github.com/your-org/my-api/internal/...
```

All tests must pass. A freshly bootstrapped skeleton has at minimum one smoke test in the generated skeleton (or the `hello-todo-go` reference service if the skeleton copies that).

**5. Inspect the generated workflow files.**

```bash
ls .ai/workflow/
# project-context.md  workflow-state.md  active-task.md  service-map.md
```

Open `.ai/workflow/project-context.md`. The `system_version:` field is already populated from the system `VERSION` file. Fill in the remaining fields (project goal, audience, constraints) to complete Phase 0.

**6. Inspect the agent adapter files.**

```bash
ls .claude/
# settings.json  skills/  (and any agents/ if present)
cat CLAUDE.md
```

These were copied verbatim from `$SYSTEM/claude/`. They are the project's AI collaboration contract.

**7. Run doctor to confirm the project passes all convention checks.**

```bash
$SYSTEM/scripts/doctor.sh --target .
```

Expected summary:

```
doctor: my-api  system v0.0.1
  PASS: N
  WARN: 0
  FAIL: 0
```

WARN results on tooling configs (e.g., `.golangci.yml` not yet present) are acceptable at this stage; FAIL results require action before you proceed.

## verification

```bash
make test           # must exit 0
$SYSTEM/scripts/doctor.sh --target . --strict   # must exit 0
grep system_version .ai/workflow/project-context.md  # must print the version line
```

## common issues

**`bash: BASH_VERSINFO: unbound variable`** — macOS bash 3.2 does not support `BASH_VERSINFO`. Run `brew install bash` and invoke the script with the new bash: `/opt/homebrew/bin/bash scripts/init-project.sh ...`.

**Skeleton warning: "not yet available in this system version"** — `templates/skeletons/go-gin-hexagonal/` does not exist yet. The script continues but no source files are copied. Create the skeleton or point the project at `examples/hello-todo-go/` as a starting reference.

**`make: go: No such file or directory`** — Go is not on your `PATH`. Add `$(go env GOPATH)/bin` to your shell profile and verify with `go version`.

**`doctor` reports `CLAUDE.md — missing`** — the `--agent claude` flag copies `CLAUDE.md` only if `$SYSTEM/claude/CLAUDE.md` exists. Confirm the file is present in the system repo at `claude/CLAUDE.md`.

## see also

- [`run-the-hello-todo-example.md`](run-the-hello-todo-example.md) — walk a fully filled-in Go-Gin-Hexagonal project end-to-end.
- [`add-an-adr.md`](add-an-adr.md) — write the first Architecture Decision Record for this project.
- [`write-a-plan-file.md`](write-a-plan-file.md) — draft a feature plan before implementation.
- [`upgrade-system-version.md`](upgrade-system-version.md) — sync adapter files when a new system version ships.
- `workflow/ai-workflow.md` — the 8-phase workflow this project is set up to follow.
- `project-templates/go/go-gin-hexagonal.md` — the template blueprint describing this stack's file layout.
