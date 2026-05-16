# {{PRODUCT_NAME}}

> Bootstrapped from the AI Engineering System using the **multi-service
> api-and-web** blueprint.

This is a multi-service monorepo. Each deployable service lives under
`apps/<name>/` and follows its own single-service blueprint. The umbrella root
holds cross-app concerns: shared CI, the product-level workflow state, repo-wide
docs, and the orchestrating Makefile.

## Apps

| Path | Blueprint | Purpose |
|---|---|---|
| `apps/api/` | `{{API_BLUEPRINT}}` | {{API_PURPOSE}} |
| `apps/web/` | `{{WEB_BLUEPRINT}}` | {{WEB_PURPOSE}} |

Add a row per app. The full inventory and inter-app dependencies are recorded
in `.ai/workflow/service-map.md`.

## Quickstart

```bash
make setup   # install dependencies in every app
make test    # run each app's test target
make lint    # run each app's lint target
make run     # start every app locally (api first, then web)
```

Every target delegates to the matching target inside each `apps/<name>/Makefile`.

## Repository Layout

```text
{{PRODUCT_NAME}}/
  apps/
    api/                  # one single-service blueprint
    web/                  # another single-service blueprint
  packages/               # optional shared code — only when 2+ apps consume it
  docs/                   # repo-wide docs (architecture, release, decisions)
  .ai/workflow/           # product-level workflow state
  .github/workflows/      # one CI workflow; each job scopes to one app
  Makefile
  CLAUDE.md               # umbrella adapter — see Working With AI below
  README.md               # this file
  CHANGELOG.md
  .gitignore
  .env.example
```

See `project-templates/multi-service/api-and-web.md` in the system repo for the
full blueprint reference.

## Working With AI

This repo ships with both umbrella-level and per-app AI adapter files:

- `CLAUDE.md` at the umbrella root — instructs the agent to read each per-app
  adapter before doing cross-app work, and to update both the umbrella and the
  affected app's `workflow-state.md`.
- `apps/<name>/CLAUDE.md` — per-app conventions, stack, and workflow.

When working on a single app, the agent should treat that app's directory as
its working root. When the change crosses app boundaries (e.g. an API contract
change consumed by the web app), the agent uses the umbrella `service-map.md`
to identify affected apps and updates the product-level workflow state.

## Release Process

This product is versioned at the umbrella root. The single `CHANGELOG.md` and
release pipeline cover every app. If any app needs to release independently,
split it into its own repo — the multi-service blueprint exists for
ship-together projects only.

## Environment Variables

Cross-app env vars (consumed by more than one app) are documented in the root
`.env.example`. Per-app env vars stay in `apps/<name>/.env.example`. Avoid
duplicating a variable in both — pick the lowest level that needs it.

## Contributing

Follow the per-app conventions when working inside `apps/<name>/`. Use the
umbrella `docs/` for any change that affects more than one app (architecture
decisions, release plan, integration tests). The `workflow-runner` skill drives
phase transitions; invoke it with "what phase are we in" or "what's next".

---

_Bootstrapped from ai-engineering-system v{{SYSTEM_VERSION}} on {{DATE}}._
