import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../../common/errors/not-found.error';
import { ValidationError } from '../../common/errors/validation.error';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';
import { TodosRepository } from './repositories/todos.repository';

/**
 * TodosService owns the business logic for the todos resource.
 *
 * Responsibilities:
 *   - Title trimming and whitespace validation beyond class-validator rules.
 *   - due_at null-vs-absent distinction for PATCH semantics.
 *   - Propagating NotFoundError when the repository returns undefined.
 *
 * The service does not perform id generation or timestamp management; those
 * are delegated to TodosRepository.
 */
@Injectable()
export class TodosService {
  constructor(private readonly todosRepository: TodosRepository) {}

  /**
   * Creates a new todo. title is trimmed and re-validated here because
   * class-validator cannot trim before validating.
   */
  create(dto: CreateTodoDto): Todo {
    const title = dto.title.trim();
    if (title.length === 0) {
      throw new ValidationError('title is required');
    }
    if (title.length > 200) {
      throw new ValidationError('title must not exceed 200 characters');
    }
    return this.todosRepository.create(title, dto.due_at ?? null);
  }

  /**
   * Returns all todos in insertion order.
   */
  findAll(): Todo[] {
    return this.todosRepository.findAll();
  }

  /**
   * Returns a single todo by id.
   * Throws NotFoundError when the id does not exist.
   */
  findOne(id: string): Todo {
    const todo = this.todosRepository.findById(id);
    if (!todo) throw new NotFoundError();
    return todo;
  }

  /**
   * Applies a partial update to an existing todo.
   *
   * PATCH semantics for due_at:
   *   - undefined (key absent from body) → no change
   *   - null (explicit JSON null)         → clear to null
   *   - string                            → set new value
   *
   * Throws NotFoundError when the id does not exist.
   * Throws ValidationError for an empty or whitespace-only title.
   */
  update(id: string, dto: UpdateTodoDto): Todo {
    // Confirm the todo exists before applying any changes.
    const existing = this.todosRepository.findById(id);
    if (!existing) throw new NotFoundError();

    const fields: Partial<Pick<Todo, 'title' | 'completed' | 'due_at'>> = {};

    if (dto.title !== undefined) {
      const title = dto.title.trim();
      if (title.length === 0) {
        throw new ValidationError('title must not be empty');
      }
      if (title.length > 200) {
        throw new ValidationError('title must not exceed 200 characters');
      }
      fields.title = title;
    }

    if (dto.completed !== undefined) {
      fields.completed = dto.completed;
    }

    // due_at: null means clear; string means set; undefined means no-op.
    if (dto.due_at === null) {
      fields.due_at = null;
    } else if (dto.due_at !== undefined) {
      fields.due_at = dto.due_at;
    }

    const updated = this.todosRepository.update(id, fields);
    if (!updated) throw new NotFoundError();
    return updated;
  }

  /**
   * Deletes a todo by id.
   * Throws NotFoundError when the id does not exist.
   */
  remove(id: string): void {
    const removed = this.todosRepository.remove(id);
    if (!removed) throw new NotFoundError();
  }
}
