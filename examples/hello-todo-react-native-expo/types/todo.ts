export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO 8601
}

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoInput {
  completed?: boolean;
  title?: string;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateCreateInput(input: CreateTodoInput): void {
  const title = input.title?.trim();
  if (!title) {
    throw new ValidationError("title is required");
  }
  if (title.length > 200) {
    throw new ValidationError("title must be 200 characters or fewer");
  }
}
