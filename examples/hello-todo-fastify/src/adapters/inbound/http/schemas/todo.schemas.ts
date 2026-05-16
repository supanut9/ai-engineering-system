import { z } from 'zod';

export const createTodoBodySchema = z.object({
  title: z.string().min(1, 'title is required').max(200, 'title must not exceed 200 characters'),
});

export const updateTodoBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
});

export const todoParamsSchema = z.object({
  id: z.string().min(1),
});

export const todoResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const todoListResponseSchema = z.object({
  items: z.array(todoResponseSchema),
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type CreateTodoBody = z.infer<typeof createTodoBodySchema>;
export type UpdateTodoBody = z.infer<typeof updateTodoBodySchema>;
export type TodoParams = z.infer<typeof todoParamsSchema>;
