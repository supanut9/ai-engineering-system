import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { ApiErrorFilter } from '../../common/filters/api-error.filter';

/**
 * Controller-level integration tests. Each test boots the full NestJS
 * application (no mocks) and exercises the HTTP layer via supertest.
 *
 * This mirrors the handler-test approach in the Go reference example:
 * spin up a real app, make HTTP requests, assert status codes and bodies.
 */
describe('TodosController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new ApiErrorFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // Helper to create a todo and return its id.
  async function createTodo(title: string, due_at?: string): Promise<string> {
    const body: Record<string, string> = { title };
    if (due_at) body.due_at = due_at;
    const res = await request(app.getHttpServer())
      .post('/v1/todos')
      .send(body)
      .set('Content-Type', 'application/json');
    return (res.body as { id: string }).id;
  }

  // --- GET /healthz ---

  describe('GET /healthz', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app.getHttpServer()).get('/healthz');
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  // --- POST /v1/todos ---

  describe('POST /v1/todos', () => {
    it('creates a todo and returns 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/todos')
        .send({ title: 'buy milk' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.id).toHaveLength(32);
      expect(res.body.title).toBe('buy milk');
      expect(res.body.completed).toBe(false);
      expect(res.body.due_at).toBeNull();
    });

    it('creates a todo with due_at', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/todos')
        .send({ title: 'dentist', due_at: '2026-12-31T09:00:00Z' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.due_at).toBe('2026-12-31T09:00:00Z');
    });

    it('returns 400 for empty title', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/todos')
        .send({ title: '' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.error.code).toBe('validation_error');
    });

    it('returns 400 for missing title', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/todos')
        .send({})
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.error.code).toBe('validation_error');
    });

    it('returns 400 for title over 200 chars', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/todos')
        .send({ title: 'x'.repeat(201) })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.error.code).toBe('validation_error');
    });
  });

  // --- GET /v1/todos ---

  describe('GET /v1/todos', () => {
    it('returns 200 with empty items when store is empty', async () => {
      const res = await request(app.getHttpServer()).get('/v1/todos');
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toEqual({ items: [] });
    });

    it('returns all created todos', async () => {
      await createTodo('first');
      await createTodo('second');
      const res = await request(app.getHttpServer()).get('/v1/todos');
      expect(res.status).toBe(HttpStatus.OK);
      expect((res.body as { items: unknown[] }).items).toHaveLength(2);
    });
  });

  // --- GET /v1/todos/:id ---

  describe('GET /v1/todos/:id', () => {
    it('returns 200 with the todo', async () => {
      const id = await createTodo('get me');
      const res = await request(app.getHttpServer()).get(`/v1/todos/${id}`);
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.id).toBe(id);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app.getHttpServer()).get('/v1/todos/nonexistent');
      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body.error.code).toBe('not_found');
    });
  });

  // --- PATCH /v1/todos/:id ---

  describe('PATCH /v1/todos/:id', () => {
    it('updates title and completed', async () => {
      const id = await createTodo('original');
      const res = await request(app.getHttpServer())
        .patch(`/v1/todos/${id}`)
        .send({ title: 'updated', completed: true })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.title).toBe('updated');
      expect(res.body.completed).toBe(true);
    });

    it('clears due_at when sent as null', async () => {
      const id = await createTodo('task', '2026-12-31T00:00:00Z');
      const res = await request(app.getHttpServer())
        .patch(`/v1/todos/${id}`)
        .send({ due_at: null })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.due_at).toBeNull();
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .patch('/v1/todos/ghost')
        .send({ title: 'x' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('returns 400 for empty title', async () => {
      const id = await createTodo('task');
      const res = await request(app.getHttpServer())
        .patch(`/v1/todos/${id}`)
        .send({ title: '' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.error.code).toBe('validation_error');
    });
  });

  // --- DELETE /v1/todos/:id ---

  describe('DELETE /v1/todos/:id', () => {
    it('returns 204 and removes the todo', async () => {
      const id = await createTodo('delete me');
      const delRes = await request(app.getHttpServer()).delete(`/v1/todos/${id}`);
      expect(delRes.status).toBe(HttpStatus.NO_CONTENT);

      // Confirm it is gone.
      const getRes = await request(app.getHttpServer()).get(`/v1/todos/${id}`);
      expect(getRes.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app.getHttpServer()).delete('/v1/todos/ghost');
      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
