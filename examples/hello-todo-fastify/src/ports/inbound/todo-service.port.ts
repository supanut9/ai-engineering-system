import type { Todo } from '../../core/todo/todo.js';

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoPatch {
  title?: string;
  completed?: boolean;
}

export interface TodoServicePort {
  create(input: CreateTodoInput): Promise<Todo>;
  list(): Promise<Todo[]>;
  getById(id: string): Promise<Todo>;
  update(id: string, patch: UpdateTodoPatch): Promise<Todo>;
  delete(id: string): Promise<void>;
}
