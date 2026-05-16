# hello-todo-nextjs

A minimal, single-user todo-list application built with Next.js 16 (App Router), React 19, and TypeScript. It serves as the canonical filled-in reference project for the ai-engineering-system workflow: every phase from project intake (Phase 0) through maintenance documentation (Phase 8) is represented here.

## Quickstart

```bash
make setup   # npm install
make test    # vitest run
make run     # starts the dev server on :3000

# In a second terminal:
curl -s localhost:3000/healthz
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"buy milk"}' localhost:3000/api/todos
curl -s localhost:3000/api/todos
```

Open [http://localhost:3000](http://localhost:3000) in a browser to use the interactive UI.

Environment variable `PORT` overrides the default port `3000`.

## Endpoints

| Method | Path               | Description                       |
|--------|--------------------|-----------------------------------|
| GET    | /healthz           | Health check                      |
| GET    | /api/todos         | List all todos                    |
| POST   | /api/todos         | Create a todo `{ title: string }` |
| PATCH  | /api/todos/:id     | Partial update (title, completed) |
| DELETE | /api/todos/:id     | Delete a todo                     |

## Project layout

```
src/
  app/
    layout.tsx                    — root layout (RSC)
    page.tsx                      — home page (RSC), renders TodoList
    healthz/route.ts              — GET /healthz
    api/todos/route.ts            — GET, POST /api/todos
    api/todos/[id]/route.ts       — PATCH, DELETE /api/todos/:id
  components/
    TodoList.tsx                  — client component, interactive list
    TodoItem.tsx                  — single todo row
    AddTodoForm.tsx               — new todo form
  services/
    todos.ts                      — pure service functions
    todos.test.ts                 — unit tests for service layer
  lib/
    repo.ts                       — in-memory repository (Map)
  types/
    todo.ts                       — Todo type + hand-rolled validation
  test-setup.ts                   — vitest + @testing-library/jest-dom bootstrap
docs/                             — Phase 0–8 artifacts (see docs/)
```

## Makefile targets

| Target | Description                        |
|--------|------------------------------------|
| setup  | `npm install --no-audit --no-fund` |
| run    | `npm run dev` (dev server)         |
| test   | `vitest run` (all tests, no watch) |
| lint   | `eslint .`                         |
| fmt    | configure prettier in Phase 3      |
| build  | `next build`                       |

## Architecture notes

- **In-memory store**: todos live in a module-level `Map` for the lifetime of the process. Tests use an isolated `createMemoryRepo()` factory so they never share state.
- **RSC + Client split**: `page.tsx` is a Server Component that reads the store directly (no HTTP round-trip on first load). `TodoList.tsx` is a Client Component that owns all interactive state and calls the JSON API for mutations.
- **Validation**: hand-rolled validators in `src/types/todo.ts` — no Zod dependency to keep the bundle minimal.

## Full workflow docs

See `docs/` for the complete Phase 0–8 artifacts. Start with `docs/requirements/project-brief.md` to understand the product context, then follow the phases in order.

This example was bootstrapped from ai-engineering-system v0.2.0.
