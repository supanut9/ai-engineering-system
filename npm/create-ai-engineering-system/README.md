# create-ai-engineering-system

Thin Node wrapper around [ai-engineering-system](https://github.com/supanut9/ai-engineering-system)'s `scripts/init-project.sh`.

Use it when you don't want to clone the system repo by hand.

## quickstart

```bash
npm create ai-engineering-system@latest -- \
  --name my-api \
  --stack go-gin-hexagonal \
  --agent claude
```

The `--` separator is required by `npm create` — every flag after it is forwarded to `init-project.sh` verbatim.

## stacks

`--stack` is one of:

- `go-gin-layered`
- `go-gin-clean`
- `go-gin-hexagonal`
- `nestjs-layered`
- `nextjs-default`
- `fastify-hexagonal`
- `fastapi-layered`
- `react-native-expo`

## agents

`--agent` is one of `claude` | `codex` | `both` (default: `claude`).

## environment variables

| Variable | Purpose |
|----------|---------|
| `AI_ENG_SYSTEM_HOME` | Path to a local ai-engineering-system checkout. When set, the wrapper uses it instead of cloning. Useful for system contributors. |
| `AI_ENG_KEEP_TMP=1`  | Keep the temporary clone on exit (debugging). |

## requirements

- Node.js ≥ 20
- Bash ≥ 4 on `PATH` (macOS ships bash 3.2; install via `brew install bash`)
- `git` on `PATH` (only when the wrapper has to clone the system)

## how it resolves the system

1. If `AI_ENG_SYSTEM_HOME` is set and points at a valid checkout, use it.
2. Otherwise, walk up from the wrapper's install dir looking for a sibling `scripts/init-project.sh` (this covers running the wrapper from inside the system monorepo during development).
3. Otherwise, shallow-clone the public repo at the tag matching this package's version into a temp dir, then run from there.

The wrapper itself does nothing except locate the system source, verify bash, and exec `init-project.sh`. All bootstrap logic lives in the system repo.

## releasing

The wrapper is versioned independently of the system. To publish a new version:

1. Bump `version` in `package.json`.
2. Open a PR, merge to main.
3. Create and push a tag matching `create-ai-engineering-system-v<version>`:

   ```bash
   git tag create-ai-engineering-system-v0.2.0
   git push origin create-ai-engineering-system-v0.2.0
   ```

4. The `Publish create-ai-engineering-system` GH Actions workflow runs on tag push, verifies the tag matches `package.json`, and publishes to npm with provenance.

A `workflow_dispatch` button on the same workflow runs `npm publish --dry-run` for sanity-checking without uploading. The repo must have an `NPM_TOKEN` secret with publish rights.

## license

MIT — see the [system repo LICENSE](https://github.com/supanut9/ai-engineering-system/blob/main/LICENSE).
