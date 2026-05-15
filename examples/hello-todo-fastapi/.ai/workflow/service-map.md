# service map — hello-todo-fastapi

This file maps services, their owners, and key integration points for the
hello-todo-fastapi example project.

## services

### hello-todo-fastapi

| field | value |
|---|---|
| type | HTTP API |
| owner | Example Maintainer <maintainer@example.com> |
| language | Python 3.12 |
| framework | FastAPI 0.136.1 |
| default port | 8000 |
| port override | `PORT` environment variable |
| start command | `uvicorn hello_todo_fastapi.main:app --host 0.0.0.0 --port $PORT` |
| health endpoint | `GET /healthz` |

## external dependencies

None. The service runs with no external runtime dependencies in v0.1.0. All storage is
in-memory.

## integration points

| endpoint | method | consumers |
|---|---|---|
| `/healthz` | GET | liveness probe, CI smoke test |
| `/v1/todos` | POST | API clients |
| `/v1/todos` | GET | API clients |
| `/v1/todos/{id}` | GET | API clients |
| `/v1/todos/{id}` | PATCH | API clients |
| `/v1/todos/{id}` | DELETE | API clients |

## notes

- no service-to-service calls in v0.1.0
- no message queue or event bus
- no shared database
