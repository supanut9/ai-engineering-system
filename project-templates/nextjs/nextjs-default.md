# Next.js Default

## Use When

Use this blueprint when:

- the stack is Next.js
- the product is primarily a web application
- you want the standard App Router baseline

## Stack

- runtime: Node.js
- framework: Next.js
- router: App Router

## Code Architecture

- style: feature-oriented application structure

## Bootstrap

Initial setup:

```bash
npx create-next-app@latest my-app --ts --eslint --app
```

## Folder Structure

```text
app/
public/
src/
  components/
  features/
  lib/
  services/
  types/
docs/
  requirements/
  specs/
  architecture/
  plan/
  tests/
  release/
  maintenance/
.ai/
  workflow/
```

## Folder Responsibilities

- `app/` = routing, layouts, and entry screens
- `src/components/` = shared presentational components
- `src/features/` = feature-owned UI and local behavior
- `src/lib/` = lower-level helpers
- `src/services/` = backend calls and orchestration helpers
- `src/types/` = shared TypeScript types

## Required Workflow Files

- `AGENTS.md` or `CLAUDE.md` depending on tool
- `.ai/workflow/project-context.md`
- `.ai/workflow/workflow-state.md`
- `.ai/workflow/active-task.md`

## Notes

- keep business logic out of page components where possible
- keep server and client responsibilities explicit
- use this as the default Next.js blueprint until a stronger frontend
  architecture pattern is needed
