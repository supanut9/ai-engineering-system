import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Todo } from '../entities/todo.entity';

/**
 * TodosRepository provides in-memory CRUD for Todo entities.
 *
 * Storage is a Map<string, Todo> keyed by id. Node's single-threaded event
 * loop guarantees that no concurrent writes can corrupt the map; no locking
 * is needed.
 *
 * Insertion order is preserved via a separate id-ordered array so that
 * GET /v1/todos returns todos in creation order.
 */
@Injectable()
export class TodosRepository {
  private readonly store = new Map<string, Todo>();
  private readonly order: string[] = [];

  /**
   * Generates a unique 32-char hex id using crypto.randomBytes.
   */
  private generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Creates and stores a new Todo from the given title and optional due_at.
   * Returns the persisted entity.
   */
  create(title: string, due_at: string | null | undefined): Todo {
    const now = new Date().toISOString();
    const todo: Todo = {
      id: this.generateId(),
      title,
      completed: false,
      due_at: due_at ?? null,
      created_at: now,
      updated_at: now,
    };
    this.store.set(todo.id, todo);
    this.order.push(todo.id);
    return { ...todo };
  }

  /**
   * Returns all todos in insertion order.
   */
  findAll(): Todo[] {
    return this.order.map((id) => ({ ...this.store.get(id)! }));
  }

  /**
   * Returns the todo with the given id, or undefined if not found.
   */
  findById(id: string): Todo | undefined {
    const todo = this.store.get(id);
    return todo ? { ...todo } : undefined;
  }

  /**
   * Updates the todo with the given id using the partial fields provided.
   * Returns the updated entity, or undefined if id is not found.
   *
   * Caller is responsible for validation before calling this method.
   */
  update(
    id: string,
    fields: Partial<Pick<Todo, 'title' | 'completed' | 'due_at'>>,
  ): Todo | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;

    const updated: Todo = {
      ...existing,
      ...fields,
      updated_at: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return { ...updated };
  }

  /**
   * Removes the todo with the given id.
   * Returns true if the todo was found and removed, false otherwise.
   */
  remove(id: string): boolean {
    if (!this.store.has(id)) return false;
    this.store.delete(id);
    const idx = this.order.indexOf(id);
    if (idx !== -1) this.order.splice(idx, 1);
    return true;
  }
}
