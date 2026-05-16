# service map — hello-todo-nextjs

## services

| name | type | port | notes |
|---|---|---|---|
| hello-todo-nextjs | full-stack Next.js app | 3000 (default) | single Node.js process; overridable via `PORT` env var |

## dependencies

| from | to | type | notes |
|---|---|---|---|
| hello-todo-nextjs | none | — | no external runtime dependencies; storage is in-memory |

## endpoints

| method | path | handler | notes |
|---|---|---|---|
| GET | /healthz | `app/healthz/route.ts` — GET | liveness probe |
| POST | /api/todos | `app/api/todos/route.ts` — POST | creates a todo |
| GET | /api/todos | `app/api/todos/route.ts` — GET | lists all todos |
| GET | /api/todos/:id | `app/api/todos/[id]/route.ts` — GET | gets one todo |
| PATCH | /api/todos/:id | `app/api/todos/[id]/route.ts` — PATCH | partial update |
| DELETE | /api/todos/:id | `app/api/todos/[id]/route.ts` — DELETE | deletes a todo |

## ui routes

| path | handler | notes |
|---|---|---|
| / | `app/page.tsx` | server-rendered todo list home page |
