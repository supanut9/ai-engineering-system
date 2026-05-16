# bootstrap a multi-service monorepo

## goal

By the end of this recipe you will have a monorepo with `apps/api/` (Go-Gin-Hexagonal) and `apps/web/` (Next.js) under one umbrella, a root Makefile that orchestrates both, a single CI workflow scoped per app, and product-level workflow state in `.ai/workflow/`.

## prerequisites

- A clone of the AI Engineering System at `$SYSTEM` (or the npm wrapper installed — substitute `npm create ai-engineering-system@latest --` for `$SYSTEM/scripts/init-project.sh`).
- Bash ≥ 4, `git`, plus the per-stack toolchains: Go ≥ 1.25, Node ≥ 20.
- A clear answer to "do these services ship together?" — if no, use two separate repos instead of this recipe.

## when to use this recipe

Use it only when:

- two or more deployables share a release cadence, owners, and ADR stream;
- the cost of cross-service coordination is lower than the cost of running two repos.

Otherwise, prefer two single-service repos. The multi-service blueprint is a deliberate exception, not the default.

## steps

**1. Create the umbrella directory.**

```bash
mkdir my-product && cd my-product
```

**2. Bootstrap the API into `apps/api/`.**

```bash
$SYSTEM/scripts/init-project.sh \
  --name api \
  --stack go-gin-hexagonal \
  --agent claude \
  --target apps/api \
  --no-git
```

`--no-git` is required — git is initialised once at the umbrella root in step 6, not per app.

**3. Bootstrap the web app into `apps/web/`.**

```bash
$SYSTEM/scripts/init-project.sh \
  --name web \
  --stack nextjs-default \
  --agent claude \
  --target apps/web \
  --no-git
```

You can swap stacks freely. Common combinations:

| API stack | Web stack |
|---|---|
| `go-gin-hexagonal` | `nextjs-default` |
| `nestjs-layered` | `nextjs-default` |
| `fastapi-layered` | `nextjs-default` |
| `fastify-hexagonal` | `react-native-expo` (rename target to `apps/mobile`) |

**4. Add the root `Makefile`.**

```makefile
.PHONY: setup test lint build run clean

APPS := apps/api apps/web

setup:
	@for app in $(APPS); do $(MAKE) -C $$app setup; done

test:
	@for app in $(APPS); do $(MAKE) -C $$app test; done

lint:
	@for app in $(APPS); do $(MAKE) -C $$app lint; done

build:
	@for app in $(APPS); do $(MAKE) -C $$app build; done

run:
	@$(MAKE) -C apps/api run &
	@$(MAKE) -C apps/web run

clean:
	@for app in $(APPS); do $(MAKE) -C $$app clean; done
```

The umbrella Makefile is intentionally thin — each per-app target is the authoritative implementation; the root just fan-outs.

**5. Add the root `README.md`.**

Copy `templates/docs/multi-service-root-readme.md` from the system and replace the `{{PRODUCT_NAME}}`, `{{API_BLUEPRINT}}`, `{{WEB_BLUEPRINT}}`, `{{API_PURPOSE}}`, `{{WEB_PURPOSE}}`, `{{SYSTEM_VERSION}}`, and `{{DATE}}` tokens.

```bash
cp $SYSTEM/templates/docs/multi-service-root-readme.md README.md
# Then open README.md and replace every {{TOKEN}} with real content.
```

**6. Add the umbrella workflow state.**

```bash
mkdir -p .ai/workflow
cp $SYSTEM/templates/project-files/project-context.md  .ai/workflow/project-context.md
cp $SYSTEM/templates/project-files/workflow-state.md   .ai/workflow/workflow-state.md
cp $SYSTEM/templates/project-files/service-map.md      .ai/workflow/service-map.md
```

Edit `service-map.md` to list **both** apps, their stacks, their ports, and which app depends on which. This is the cross-app source of truth; the per-app workflow files only describe a single service.

**7. Add the umbrella `CLAUDE.md`.**

```markdown
# {{PRODUCT_NAME}}

This is a multi-service monorepo. Two AI adapter files are authoritative:

- `apps/api/CLAUDE.md` — API conventions and per-app workflow.
- `apps/web/CLAUDE.md` — Web conventions and per-app workflow.

Read both before doing cross-app work (anything that touches API contracts
consumed by the web app, or shared env vars). Update the affected app's
`.ai/workflow/workflow-state.md` **and** the umbrella `.ai/workflow/workflow-state.md`
when a phase advances at the product level.

The umbrella `service-map.md` lists every app and its dependencies. Update it
whenever an app is added or an inter-app contract changes.

Invoke the `workflow-runner` skill from the umbrella root for product-level
phase transitions; invoke it from inside `apps/<name>/` for service-level
transitions.
```

**8. Consolidate `.gitignore` at the umbrella root.**

```bash
# Union both apps' ignores plus a "Common" section.
cat apps/api/.gitignore apps/web/.gitignore > .gitignore
# Edit out the duplicate "Common" section so only one remains.
```

The per-app `.gitignore` files can stay (git honours them), but the root file is authoritative — when you later need to add a new pattern, add it once at the root.

**9. Add the single CI workflow.**

```yaml
# .github/workflows/ci.yml
name: ci
on: [push, pull_request]
jobs:
  api:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/api
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-go@v6
        with:
          go-version: '1.25.x'
      - run: make setup
      - run: make test
      - run: make lint
  web:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22.x'
      - run: make setup
      - run: make test
      - run: make lint
```

One job per app, each scoped to that app's `working-directory`. Avoid copying per-app workflow files to the root.

**10. Initialise git once at the umbrella root.**

```bash
git init
git add .
git commit -m "chore: bootstrap multi-service from ai-engineering-system"
```

## verification

```bash
# Both apps' tests pass through the root Makefile.
make test

# Both apps' lint passes.
make lint

# Workflow state at the umbrella + each app is present.
ls .ai/workflow/ apps/api/.ai/workflow/ apps/web/.ai/workflow/

# The service map lists both apps.
grep -E '^### Name|^### Type' .ai/workflow/service-map.md
```

## common issues

**Per-app `git init` ran by mistake** — if you forgot `--no-git` on a per-app bootstrap, you'll have a nested `.git` inside `apps/<name>/`. Delete it (`rm -rf apps/<name>/.git`) before running `git init` at the umbrella.

**Duplicate `CHANGELOG.md` per app** — the multi-service blueprint assumes a single product-level changelog. Delete the per-app `CHANGELOG.md` files (or leave them as TODO stubs) and use the umbrella one as the single source of truth. If you genuinely need per-app changelogs, the apps probably should not share a repo.

**CI matrix duplication** — if you find yourself copy-pasting setup steps for a third app, extract the shared steps into a reusable workflow (`.github/workflows/_setup.yml`) and call it from each app's job. Do this only when the duplication actually hurts; two copies is cheaper than one abstraction.

**Cross-app type-sharing temptation** — resist creating `packages/types/` on day one. Wait until two apps actually consume the same type definition before extracting; otherwise you'll carry the abstraction without the payoff.

**Per-app workflow state drifts from the umbrella** — the `workflow-runner` skill operates at one level at a time. Run it from inside `apps/<name>/` for per-app phase work and from the umbrella root for cross-app phase work. The two state files describe different scopes and should not be merged.

## see also

- `project-templates/multi-service/api-and-web.md` — the blueprint this recipe operationalises.
- `templates/docs/multi-service-root-readme.md` — the umbrella README template referenced in step 5.
- [`drive-the-workflow`](drive-the-workflow.md) — how `workflow-runner` operates per scope.
- [`split-work-into-parallel-lanes`](split-work-into-parallel-lanes.md) — the parallel-lanes pattern often shows up first in multi-service projects when an API change and a web change land in the same milestone.
- `workflow/ai-workflow.md §Phase 3` — architecture decisions for multi-service projects belong in the umbrella's ADR stream.
