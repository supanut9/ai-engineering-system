# bootstrap with the npm create wrapper

## goal

By the end of this recipe you will have used `npm create ai-engineering-system@latest` to bootstrap a project, understood how the wrapper resolves the system source, and verified the generated project builds.

## prerequisites

- Node.js ≥ 20 on `PATH`.
- Bash ≥ 4 on `PATH` (macOS ships bash 3.2; install via `brew install bash`).
- `git` on `PATH` when the wrapper has to clone the system from GitHub.
- A working internet connection on first run (subsequent runs reuse no cache — each invocation is independent).

## what the wrapper does

`create-ai-engineering-system` is a thin Node wrapper. It does not duplicate any bootstrap logic — every artifact you see in the generated project is produced by `scripts/init-project.sh` in the system repo.

The wrapper only does four things:

1. Resolve a system source: `AI_ENG_SYSTEM_HOME` env var, or a walked-up local checkout, or a fresh shallow clone of `github.com/supanut9/ai-engineering-system` at the matching version tag.
2. Verify `bash -c 'echo $BASH_VERSION'` reports a major version ≥ 4.
3. Exec `bash <system>/scripts/init-project.sh <forwarded args>`.
4. Clean up the temp clone on exit (unless `AI_ENG_KEEP_TMP=1`).

## steps

**1. Run the wrapper.**

```bash
npm create ai-engineering-system@latest -- \
  --name my-api \
  --stack go-gin-hexagonal \
  --agent claude
```

The `--` separator is required by `npm create`; every flag after it is forwarded to `init-project.sh` verbatim.

**2. Watch the resolution log.**

The first two `[info]` lines reveal how the wrapper found the system:

```text
[info] Cloning ai-engineering-system @ v0.1.0 into /tmp/ai-eng-system-…
[info] bash 5.2.37(1)-release
```

When you're working inside a clone of the system repo (system contributors), you will instead see:

```text
[info] Using local system at /path/to/ai-engineering-system (walked up from wrapper)
```

**3. Read the generated next-steps banner.**

`init-project.sh` ends with the same banner it prints for direct invocation — `cd <target>`, complete Phase 0 intake, read `CLAUDE.md`.

**4. Verify the generated project.**

```bash
cd my-api
make setup
make test
```

For Go stacks `make test` should report all packages green. For Node/Python stacks substitute the stack's verification command — see [run-the-hello-todo-example](run-the-hello-todo-example.md).

## verification

```bash
# Required scaffolding exists
ls my-api/.ai/workflow/         # project-context.md, workflow-state.md, active-task.md, service-map.md
ls my-api/CLAUDE.md             # or .codex/, depending on --agent
ls my-api/.gitignore my-api/.env.example my-api/README.md

# Generated project tests pass
( cd my-api && make test )
```

## stack flags

`--stack` is one of: `go-gin-layered`, `go-gin-clean`, `go-gin-hexagonal`, `nestjs-layered`, `nextjs-default`, `fastify-hexagonal`, `fastapi-layered`, `react-native-expo`.

`--agent` is one of `claude`, `codex`, `both` (default: `claude`).

`--no-git` skips git init; `--target <path>` overrides the destination.

## environment variables

| Variable | Purpose |
|---|---|
| `AI_ENG_SYSTEM_HOME` | Skip the clone and use this checkout. Useful when contributing to the system itself. |
| `AI_ENG_KEEP_TMP=1` | Keep the temporary clone so you can inspect what was cloned. |

## common issues

**`bash 4+ is required`** — your default `bash` is 3.2 (macOS). Run `brew install bash` and re-invoke. The wrapper does not patch `PATH` for you.

**`Tag v0.x.y not found upstream; falling back to default branch`** — the wrapper version drifted ahead of the system. The fallback clone of `main` should still work, but pin the system explicitly with `AI_ENG_SYSTEM_HOME` if reproducibility matters.

**`git clone failed`** — the wrapper needs `git` on `PATH` when it has to clone. If you only have a tarball download of the system, set `AI_ENG_SYSTEM_HOME` to the extracted directory.

**Wrapper used a local checkout you didn't expect** — the walked-up resolver looked up to six levels above the wrapper. To force a fresh clone, run the wrapper from a directory not nested inside any system checkout, or pre-pin with `AI_ENG_SYSTEM_HOME=` to an explicit path.

## see also

- `npm/create-ai-engineering-system/bin/create.mjs` — the wrapper itself; under 200 lines, no third-party deps.
- `scripts/init-project.sh` — the script the wrapper delegates to.
- [`bootstrap-go-hexagonal`](bootstrap-go-hexagonal.md) — the same workflow without the wrapper.
- [`upgrade-system-version`](upgrade-system-version.md) — how to keep an existing project's adapter files in sync after a system release.
