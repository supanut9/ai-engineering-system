import type { TodoRepository } from '../../../ports/outbound/todo-repository.port.js';
import type { Todo } from '../../../core/todo/todo.js';

export class TodoMemoryRepo implements TodoRepository {
  private readonly store = new Map<string, Todo>();
  private readonly order: string[] = [];

  async save(todo: Todo): Promise<void> {
    if (!this.store.has(todo.id)) {
      this.order.push(todo.id);
    }
    this.store.set(todo.id, { ...todo });
  }

  async findAll(): Promise<Todo[]> {
    return this.order
      .filter((id) => this.store.has(id))
      .map((id) => ({ ...this.store.get(id)! }));
  }

  async findById(id: string): Promise<Todo | undefined> {
    const todo = this.store.get(id);
    return todo ? { ...todo } : undefined;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.store.has(id)) return false;
    this.store.delete(id);
    const idx = this.order.indexOf(id);
    if (idx !== -1) this.order.splice(idx, 1);
    return true;
  }
}
