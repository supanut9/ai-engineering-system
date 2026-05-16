export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateCreateInput(body: unknown): CreateTodoInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be a JSON object");
  }
  const obj = body as Record<string, unknown>;
  if (typeof obj.title !== "string" || obj.title.trim() === "") {
    throw new ValidationError("title must be a non-empty string");
  }
  return { title: obj.title.trim() };
}

export function validateUpdateInput(body: unknown): UpdateTodoInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be a JSON object");
  }
  const obj = body as Record<string, unknown>;
  const result: UpdateTodoInput = {};
  if ("title" in obj) {
    if (typeof obj.title !== "string" || obj.title.trim() === "") {
      throw new ValidationError("title must be a non-empty string");
    }
    result.title = obj.title.trim();
  }
  if ("completed" in obj) {
    if (typeof obj.completed !== "boolean") {
      throw new ValidationError("completed must be a boolean");
    }
    result.completed = obj.completed;
  }
  return result;
}
