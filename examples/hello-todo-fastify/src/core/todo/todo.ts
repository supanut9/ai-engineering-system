import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from './errors.js';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function createTodo(title: string): Todo {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new ValidationError('title is required');
  }
  if (trimmed.length > 200) {
    throw new ValidationError('title must not exceed 200 characters');
  }

  const now = new Date();
  return {
    id: uuidv4(),
    title: trimmed,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}
