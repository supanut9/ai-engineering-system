# service map — hello-todo-nestjs

## services

| name | type | port | notes |
|---|---|---|---|
| hello-todo-nestjs | HTTP API | 3000 (default) | single Node.js process; overridable via `PORT` env var |

## dependencies

| from | to | type | notes |
|---|---|---|---|
| hello-todo-nestjs | none | — | no external runtime dependencies; storage is in-memory |

## endpoints

| method | path | handler | notes |
|---|---|---|---|
| GET | /healthz | HealthController.healthz | liveness probe |
| POST | /v1/todos | TodosController.create | creates a todo |
| GET | /v1/todos | TodosController.findAll | lists all todos |
| GET | /v1/todos/:id | TodosController.findOne | gets one todo |
| PATCH | /v1/todos/:id | TodosController.update | partial update |
| DELETE | /v1/todos/:id | TodosController.remove | deletes a todo |
