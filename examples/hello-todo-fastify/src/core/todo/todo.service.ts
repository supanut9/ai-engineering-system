import type { TodoServicePort, CreateTodoInput, UpdateTodoPatch } from '../../ports/inbound/todo-service.port.js';
import type { TodoRepository } from '../../ports/outbound/todo-repository.port.js';
import type { Todo } from './todo.js';
import { createTodo } from './todo.js';
import { NotFoundError, ValidationError } from './errors.js';

export class TodoService implements TodoServicePort {
  constructor(private readonly repo: TodoRepository) {}

  async create(input: CreateTodoInput): Promise<Todo> {
    const todo = createTodo(input.title);
    await this.repo.save(todo);
    return todo;
  }

  async list(): Promise<Todo[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<Todo> {
    const todo = await this.repo.findById(id);
    if (!todo) {
      throw new NotFoundError(`todo not found`);
    }
    return todo;
  }

  async update(id: string, patch: UpdateTodoPatch): Promise<Todo> {
    const todo = await this.repo.findById(id);
    if (!todo) {
      throw new NotFoundError(`todo not found`);
    }

    if (patch.title !== undefined) {
      const trimmed = patch.title.trim();
      if (!trimmed) {
        throw new ValidationError('title is required');
      }
      if (trimmed.length > 200) {
        throw new ValidationError('title must not exceed 200 characters');
      }
      todo.title = trimmed;
    }

    if (patch.completed !== undefined) {
      todo.completed = patch.completed;
    }

    todo.updatedAt = new Date();
    await this.repo.save(todo);
    return todo;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`todo not found`);
    }
  }
}
