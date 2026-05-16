# service map — hello-todo-fastify

> Single-service example. There are no inter-service dependencies.

## services

| service | role | port | notes |
|---|---|---|---|
| hello-todo-fastify | todo HTTP API | 8080 (default) | in-process only; no sidecars |

## external dependencies

None. The service is self-contained: no database, no cache, no message queue, no
third-party HTTP calls.

## environment variables

| variable | default | description |
|---|---|---|
| `PORT` | `8080` | TCP port the Fastify server listens on |
| `LOG_LEVEL` | `info` | pino log level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`) |
