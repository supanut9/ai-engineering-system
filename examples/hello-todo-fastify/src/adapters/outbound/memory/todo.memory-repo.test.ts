import { describe, it, expect, beforeEach } from 'vitest';
import { TodoMemoryRepo } from './todo.memory-repo.js';
import type { Todo } from '../../../core/todo/todo.js';

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'test-id',
    title: 'test todo',
    completed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

describe('TodoMemoryRepo', () => {
  let repo: TodoMemoryRepo;

  beforeEach(() => {
    repo = new TodoMemoryRepo();
  });

  it('saves and retrieves a todo by id', async () => {
    const todo = makeTodo({ id: 'abc' });
    await repo.save(todo);
    const found = await repo.findById('abc');
    expect(found).toBeDefined();
    expect(found?.id).toBe('abc');
  });

  it('returns undefined for unknown id', async () => {
    const found = await repo.findById('does-not-exist');
    expect(found).toBeUndefined();
  });

  it('preserves insertion order in findAll', async () => {
    await repo.save(makeTodo({ id: 'a', title: 'first' }));
    await repo.save(makeTodo({ id: 'b', title: 'second' }));
    await repo.save(makeTodo({ id: 'c', title: 'third' }));
    const all = await repo.findAll();
    expect(all.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('updates an existing todo without duplicating order', async () => {
    const todo = makeTodo({ id: 'x', title: 'original' });
    await repo.save(todo);
    await repo.save({ ...todo, title: 'updated' });
    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('updated');
  });

  it('deletes a todo and returns true', async () => {
    await repo.save(makeTodo({ id: 'del' }));
    const result = await repo.delete('del');
    expect(result).toBe(true);
    expect(await repo.findById('del')).toBeUndefined();
    expect(await repo.findAll()).toHaveLength(0);
  });

  it('returns false when deleting unknown id', async () => {
    const result = await repo.delete('no-such-id');
    expect(result).toBe(false);
  });

  it('returns copies to prevent external mutation', async () => {
    const todo = makeTodo({ id: 'copy-test', title: 'original' });
    await repo.save(todo);
    const found = await repo.findById('copy-test');
    found!.title = 'mutated';
    const found2 = await repo.findById('copy-test');
    expect(found2?.title).toBe('original');
  });
});
