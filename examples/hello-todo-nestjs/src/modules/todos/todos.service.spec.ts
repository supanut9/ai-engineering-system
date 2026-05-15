import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundError } from '../../common/errors/not-found.error';
import { ValidationError } from '../../common/errors/validation.error';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosRepository } from './repositories/todos.repository';
import { TodosService } from './todos.service';

/**
 * Helper to build a service + repo pair for each test.
 */
async function makeService(): Promise<{ service: TodosService; repo: TodosRepository }> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [TodosService, TodosRepository],
  }).compile();

  return {
    service: module.get<TodosService>(TodosService),
    repo: module.get<TodosRepository>(TodosRepository),
  };
}

describe('TodosService', () => {
  describe('create', () => {
    it('creates a todo with trimmed title and completed=false', async () => {
      const { service } = await makeService();
      const dto: CreateTodoDto = { title: '  buy milk  ' } as CreateTodoDto;
      const todo = service.create(dto);
      expect(todo.id).toHaveLength(32);
      expect(todo.title).toBe('buy milk');
      expect(todo.completed).toBe(false);
      expect(todo.due_at).toBeNull();
    });

    it('throws ValidationError for empty title', async () => {
      const { service } = await makeService();
      const dto: CreateTodoDto = { title: '' } as CreateTodoDto;
      expect(() => service.create(dto)).toThrow(ValidationError);
    });

    it('throws ValidationError for whitespace-only title', async () => {
      const { service } = await makeService();
      const dto: CreateTodoDto = { title: '   ' } as CreateTodoDto;
      expect(() => service.create(dto)).toThrow(ValidationError);
    });

    it('throws ValidationError for title over 200 chars', async () => {
      const { service } = await makeService();
      const dto: CreateTodoDto = { title: 'x'.repeat(201) } as CreateTodoDto;
      expect(() => service.create(dto)).toThrow(ValidationError);
    });

    it('accepts title of exactly 200 chars', async () => {
      const { service } = await makeService();
      const dto: CreateTodoDto = { title: 'x'.repeat(200) } as CreateTodoDto;
      const todo = service.create(dto);
      expect(todo.title).toHaveLength(200);
    });

    it('stores due_at when provided', async () => {
      const { service } = await makeService();
      const dto: CreateTodoDto = { title: 'task', due_at: '2026-12-31T00:00:00Z' } as CreateTodoDto;
      const todo = service.create(dto);
      expect(todo.due_at).toBe('2026-12-31T00:00:00Z');
    });
  });

  describe('findAll', () => {
    it('returns empty array when no todos exist', async () => {
      const { service } = await makeService();
      expect(service.findAll()).toEqual([]);
    });

    it('returns todos in insertion order', async () => {
      const { service } = await makeService();
      service.create({ title: 'alpha' } as CreateTodoDto);
      service.create({ title: 'beta' } as CreateTodoDto);
      const items = service.findAll();
      expect(items[0].title).toBe('alpha');
      expect(items[1].title).toBe('beta');
    });
  });

  describe('findOne', () => {
    it('returns the todo when found', async () => {
      const { service } = await makeService();
      const created = service.create({ title: 'find me' } as CreateTodoDto);
      const found = service.findOne(created.id);
      expect(found.id).toBe(created.id);
    });

    it('throws NotFoundError for unknown id', async () => {
      const { service } = await makeService();
      expect(() => service.findOne('no-such-id')).toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('updates title and completed, bumps updated_at', async () => {
      const { service } = await makeService();
      const created = service.create({ title: 'original' } as CreateTodoDto);
      await new Promise((r) => setTimeout(r, 2));
      const dto: UpdateTodoDto = { title: 'updated', completed: true } as UpdateTodoDto;
      const updated = service.update(created.id, dto);
      expect(updated.title).toBe('updated');
      expect(updated.completed).toBe(true);
      expect(updated.updated_at > created.updated_at).toBe(true);
    });

    it('clears due_at when dto.due_at is explicitly null', async () => {
      const { service } = await makeService();
      const created = service.create({ title: 't', due_at: '2026-12-31T00:00:00Z' } as CreateTodoDto);
      const dto = { due_at: null } as UpdateTodoDto;
      const updated = service.update(created.id, dto);
      expect(updated.due_at).toBeNull();
    });

    it('does not change due_at when omitted from dto', async () => {
      const { service } = await makeService();
      const created = service.create({ title: 't', due_at: '2026-12-31T00:00:00Z' } as CreateTodoDto);
      const dto: UpdateTodoDto = { completed: true } as UpdateTodoDto;
      const updated = service.update(created.id, dto);
      expect(updated.due_at).toBe('2026-12-31T00:00:00Z');
    });

    it('throws NotFoundError for unknown id', async () => {
      const { service } = await makeService();
      expect(() => service.update('ghost', {} as UpdateTodoDto)).toThrow(NotFoundError);
    });

    it('throws ValidationError for empty title on update', async () => {
      const { service } = await makeService();
      const created = service.create({ title: 'task' } as CreateTodoDto);
      expect(() => service.update(created.id, { title: '' } as UpdateTodoDto)).toThrow(
        ValidationError,
      );
    });

    it('throws ValidationError for whitespace-only title on update', async () => {
      const { service } = await makeService();
      const created = service.create({ title: 'task' } as CreateTodoDto);
      expect(() => service.update(created.id, { title: '   ' } as UpdateTodoDto)).toThrow(
        ValidationError,
      );
    });
  });

  describe('remove', () => {
    it('removes the todo successfully', async () => {
      const { service } = await makeService();
      const created = service.create({ title: 'delete me' } as CreateTodoDto);
      expect(() => service.remove(created.id)).not.toThrow();
      expect(() => service.findOne(created.id)).toThrow(NotFoundError);
    });

    it('throws NotFoundError for unknown id', async () => {
      const { service } = await makeService();
      expect(() => service.remove('ghost')).toThrow(NotFoundError);
    });
  });
});
