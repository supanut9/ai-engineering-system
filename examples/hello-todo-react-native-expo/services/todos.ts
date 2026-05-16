import { Todo, CreateTodoInput, UpdateTodoInput, validateCreateInput } from "@/types/todo";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createTodo(todos: Todo[], input: CreateTodoInput): { todos: Todo[]; todo: Todo } {
  validateCreateInput(input);
  const todo: Todo = {
    id: generateId(),
    title: input.title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  return { todos: [...todos, todo], todo };
}

export function listTodos(todos: Todo[]): Todo[] {
  return [...todos];
}

export function updateTodo(
  todos: Todo[],
  id: string,
  input: UpdateTodoInput
): { todos: Todo[]; todo: Todo | null } {
  let updated: Todo | null = null;
  const next = todos.map((t) => {
    if (t.id !== id) return t;
    updated = {
      ...t,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.completed !== undefined ? { completed: input.completed } : {}),
    };
    return updated;
  });
  return { todos: next, todo: updated };
}

export function deleteTodo(todos: Todo[], id: string): { todos: Todo[]; deleted: boolean } {
  const next = todos.filter((t) => t.id !== id);
  return { todos: next, deleted: next.length < todos.length };
}
