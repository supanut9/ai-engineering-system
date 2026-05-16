import { randomUUID } from "crypto";
import { Todo, CreateTodoInput, UpdateTodoInput, ValidationError } from "@/types/todo";
import { TodoRepo } from "@/lib/repo";

export function listTodos(repo: TodoRepo): Todo[] {
  return repo.findAll();
}

export function createTodo(repo: TodoRepo, input: CreateTodoInput): Todo {
  if (!input.title || input.title.trim() === "") {
    throw new ValidationError("title must be a non-empty string");
  }
  const todo: Todo = {
    id: randomUUID(),
    title: input.title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  repo.save(todo);
  return todo;
}

export function updateTodo(
  repo: TodoRepo,
  id: string,
  input: UpdateTodoInput
): Todo {
  const existing = repo.findById(id);
  if (!existing) {
    throw new Error(`Todo ${id} not found`);
  }
  const updated: Todo = {
    ...existing,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.completed !== undefined ? { completed: input.completed } : {}),
  };
  repo.save(updated);
  return updated;
}

export function deleteTodo(repo: TodoRepo, id: string): void {
  const deleted = repo.delete(id);
  if (!deleted) {
    throw new Error(`Todo ${id} not found`);
  }
}
