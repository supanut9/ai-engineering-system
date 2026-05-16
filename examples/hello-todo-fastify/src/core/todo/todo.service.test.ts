import { describe, it, expect, beforeEach } from 'vitest';
import { TodoService } from './todo.service.js';
import { TodoMemoryRepo } from '../../adapters/outbound/memory/todo.memory-repo.js';
import { NotFoundError, ValidationError } from './errors.js';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    service = new TodoService(new TodoMemoryRepo());
  });

  describe('create', () => {
    it('creates a todo with valid title', async () => {
      const todo = await service.create({ title: 'buy milk' });
      expect(todo.id).toBeTruthy();
      expect(todo.title).toBe('buy milk');
      expect(todo.completed).toBe(false);
    });

    it('trims whitespace from title', async () => {
      const todo = await service.create({ title: '  buy milk  ' });
      expect(todo.title).toBe('buy milk');
    });

    it('throws ValidationError for empty title', async () => {
      await expect(service.create({ title: '' })).rejects.toThrow(ValidationError);
    });

    it('throws ValidationError for whitespace-only title', async () => {
      await expect(service.create({ title: '   ' })).rejects.toThrow(ValidationError);
    });

    it('throws ValidationError for title exceeding 200 chars', async () => {
      await expect(service.create({ title: 'a'.repeat(201) })).rejects.toThrow(ValidationError);
    });
  });

  describe('list', () => {
    it('returns empty array when no todos', async () => {
      const todos = await service.list();
      expect(todos).toHaveLength(0);
    });

    it('returns todos in insertion order', async () => {
      await service.create({ title: 'first' });
      await service.create({ title: 'second' });
      const todos = await service.list();
      expect(todos[0].title).toBe('first');
      expect(todos[1].title).toBe('second');
    });
  });

  describe('getById', () => {
    it('returns the todo by id', async () => {
      const created = await service.create({ title: 'buy milk' });
      const found = await service.getById(created.id);
      expect(found.id).toBe(created.id);
    });

    it('throws NotFoundError for unknown id', async () => {
      await expect(service.getById('unknown-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('updates title', async () => {
      const created = await service.create({ title: 'old title' });
      const updated = await service.update(created.id, { title: 'new title' });
      expect(updated.title).toBe('new title');
    });

    it('updates completed flag', async () => {
      const created = await service.create({ title: 'task' });
      const updated = await service.update(created.id, { completed: true });
      expect(updated.completed).toBe(true);
    });

    it('throws NotFoundError for unknown id', async () => {
      await expect(service.update('bad-id', { title: 'x' })).rejects.toThrow(NotFoundError);
    });

    it('throws ValidationError when patching with empty title', async () => {
      const created = await service.create({ title: 'task' });
      await expect(service.update(created.id, { title: '' })).rejects.toThrow(ValidationError);
    });
  });

  describe('delete', () => {
    it('deletes an existing todo', async () => {
      const created = await service.create({ title: 'task' });
      await expect(service.delete(created.id)).resolves.toBeUndefined();
      await expect(service.getById(created.id)).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError for unknown id', async () => {
      await expect(service.delete('bad-id')).rejects.toThrow(NotFoundError);
    });
  });
});
