import { TodosRepository } from './todos.repository';

describe('TodosRepository', () => {
  let repo: TodosRepository;

  beforeEach(() => {
    repo = new TodosRepository();
  });

  describe('create', () => {
    it('returns a todo with a non-empty id', () => {
      const todo = repo.create('buy milk', null);
      expect(todo.id).toBeTruthy();
      expect(todo.id).toHaveLength(32);
    });

    it('sets completed to false', () => {
      const todo = repo.create('task', null);
      expect(todo.completed).toBe(false);
    });

    it('stores due_at when provided', () => {
      const todo = repo.create('task', '2026-12-31T00:00:00Z');
      expect(todo.due_at).toBe('2026-12-31T00:00:00Z');
    });

    it('stores null due_at when omitted', () => {
      const todo = repo.create('task', null);
      expect(todo.due_at).toBeNull();
    });

    it('assigns different ids to two sequential creates', () => {
      const a = repo.create('first', null);
      const b = repo.create('second', null);
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('findAll', () => {
    it('returns empty array when store is empty', () => {
      expect(repo.findAll()).toEqual([]);
    });

    it('preserves insertion order', () => {
      repo.create('alpha', null);
      repo.create('beta', null);
      repo.create('gamma', null);
      const all = repo.findAll();
      expect(all.map((t) => t.title)).toEqual(['alpha', 'beta', 'gamma']);
    });
  });

  describe('findById', () => {
    it('returns the todo when found', () => {
      const created = repo.create('find me', null);
      const found = repo.findById(created.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
    });

    it('returns undefined for unknown id', () => {
      expect(repo.findById('no-such-id')).toBeUndefined();
    });

    it('returns a copy — mutating the result does not affect stored state', () => {
      const created = repo.create('original', null);
      const found = repo.findById(created.id)!;
      found.title = 'mutated';
      const refetched = repo.findById(created.id)!;
      expect(refetched.title).toBe('original');
    });
  });

  describe('update', () => {
    it('updates the specified fields and bumps updated_at', async () => {
      const created = repo.create('old title', null);
      // Ensure clock advances.
      await new Promise((r) => setTimeout(r, 2));
      const updated = repo.update(created.id, { title: 'new title', completed: true });
      expect(updated).toBeDefined();
      expect(updated!.title).toBe('new title');
      expect(updated!.completed).toBe(true);
      expect(updated!.updated_at > created.updated_at).toBe(true);
    });

    it('returns undefined for unknown id', () => {
      expect(repo.update('ghost', { title: 'x' })).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('removes the todo and returns true', () => {
      const created = repo.create('to delete', null);
      expect(repo.remove(created.id)).toBe(true);
      expect(repo.findById(created.id)).toBeUndefined();
    });

    it('returns false for unknown id', () => {
      expect(repo.remove('ghost')).toBe(false);
    });

    it('removes item from findAll results', () => {
      const a = repo.create('keep', null);
      const b = repo.create('remove', null);
      repo.remove(b.id);
      const all = repo.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(a.id);
    });
  });
});
