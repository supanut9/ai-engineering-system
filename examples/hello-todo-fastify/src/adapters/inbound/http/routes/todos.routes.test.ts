import { describe, it, expect, beforeEach } from 'vitest';
import { buildServer } from '../server.js';
import { TodoService } from '../../../../core/todo/todo.service.js';
import { TodoMemoryRepo } from '../../../outbound/memory/todo.memory-repo.js';
import type { FastifyInstance } from 'fastify';

describe('Todos HTTP routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const repo = new TodoMemoryRepo();
    const service = new TodoService(repo);
    app = await buildServer(service);
    await app.ready();
  });

  describe('GET /healthz', () => {
    it('returns 200 with status ok', async () => {
      const res = await app.inject({ method: 'GET', url: '/healthz' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ status: 'ok' });
    });
  });

  describe('POST /v1/todos', () => {
    it('creates a todo and returns 201', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/todos',
        body: { title: 'buy milk' },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.id).toBeTruthy();
      expect(body.title).toBe('buy milk');
      expect(body.completed).toBe(false);
    });

    it('returns 400 when title is missing', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/todos',
        body: {},
      });
      expect(res.statusCode).toBe(400);
      const body = res.json();
      expect(body.error.code).toBe('validation');
    });

    it('returns 400 when title is empty string', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/todos',
        body: { title: '' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /v1/todos', () => {
    it('returns empty items array initially', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/todos' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ items: [] });
    });

    it('returns todos in insertion order', async () => {
      await app.inject({ method: 'POST', url: '/v1/todos', body: { title: 'first' } });
      await app.inject({ method: 'POST', url: '/v1/todos', body: { title: 'second' } });
      const res = await app.inject({ method: 'GET', url: '/v1/todos' });
      const { items } = res.json();
      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('first');
      expect(items[1].title).toBe('second');
    });
  });

  describe('GET /v1/todos/:id', () => {
    it('returns a todo by id', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/v1/todos',
        body: { title: 'fetch me' },
      });
      const { id } = created.json();
      const res = await app.inject({ method: 'GET', url: `/v1/todos/${id}` });
      expect(res.statusCode).toBe(200);
      expect(res.json().title).toBe('fetch me');
    });

    it('returns 404 for unknown id', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/todos/no-such-id' });
      expect(res.statusCode).toBe(404);
      expect(res.json().error.code).toBe('not_found');
    });
  });

  describe('PATCH /v1/todos/:id', () => {
    it('updates title', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/v1/todos',
        body: { title: 'old title' },
      });
      const { id } = created.json();
      const res = await app.inject({
        method: 'PATCH',
        url: `/v1/todos/${id}`,
        body: { title: 'new title' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().title).toBe('new title');
    });

    it('marks todo as completed', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/v1/todos',
        body: { title: 'finish me' },
      });
      const { id } = created.json();
      const res = await app.inject({
        method: 'PATCH',
        url: `/v1/todos/${id}`,
        body: { completed: true },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().completed).toBe(true);
    });

    it('returns 404 for unknown id', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/v1/todos/no-such-id',
        body: { title: 'x' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /v1/todos/:id', () => {
    it('deletes a todo and returns 204', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/v1/todos',
        body: { title: 'delete me' },
      });
      const { id } = created.json();
      const res = await app.inject({ method: 'DELETE', url: `/v1/todos/${id}` });
      expect(res.statusCode).toBe(204);
    });

    it('returns 404 when deleting non-existent todo', async () => {
      const res = await app.inject({ method: 'DELETE', url: '/v1/todos/no-such-id' });
      expect(res.statusCode).toBe(404);
    });
  });
});
