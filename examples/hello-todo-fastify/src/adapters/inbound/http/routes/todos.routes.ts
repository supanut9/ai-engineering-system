import type { FastifyInstance } from 'fastify';
import type { TodoServicePort } from '../../../../ports/inbound/todo-service.port.js';
import {
  createTodoBodySchema,
  updateTodoBodySchema,
  todoParamsSchema,
} from '../schemas/todo.schemas.js';

export async function todosRoutes(
  app: FastifyInstance,
  { service }: { service: TodoServicePort },
): Promise<void> {
  // POST /v1/todos
  app.post(
    '/v1/todos',
    {
      schema: {
        body: createTodoBodySchema,
      },
    },
    async (request, reply) => {
      const body = request.body as { title: string };
      const todo = await service.create({ title: body.title });
      return reply.status(201).send(todo);
    },
  );

  // GET /v1/todos
  app.get('/v1/todos', async (_request, reply) => {
    const todos = await service.list();
    return reply.status(200).send({ items: todos });
  });

  // GET /v1/todos/:id
  app.get(
    '/v1/todos/:id',
    {
      schema: {
        params: todoParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const todo = await service.getById(id);
      return reply.status(200).send(todo);
    },
  );

  // PATCH /v1/todos/:id
  app.patch(
    '/v1/todos/:id',
    {
      schema: {
        params: todoParamsSchema,
        body: updateTodoBodySchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { title?: string; completed?: boolean };
      const todo = await service.update(id, body);
      return reply.status(200).send(todo);
    },
  );

  // DELETE /v1/todos/:id
  app.delete(
    '/v1/todos/:id',
    {
      schema: {
        params: todoParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await service.delete(id);
      return reply.status(204).send();
    },
  );
}
