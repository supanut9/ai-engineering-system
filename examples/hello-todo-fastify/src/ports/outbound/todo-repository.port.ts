import type { Todo } from '../../core/todo/todo.js';

export interface TodoRepository {
  save(todo: Todo): Promise<void>;
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | undefined>;
  delete(id: string): Promise<boolean>;
}
