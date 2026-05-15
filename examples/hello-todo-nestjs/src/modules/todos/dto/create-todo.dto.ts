import { IsDateString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

/**
 * CreateTodoDto is the validated request body for POST /v1/todos.
 *
 * class-validator rules mirror the contract in docs/specs/functional-spec.md.
 */
export class CreateTodoDto {
  @IsNotEmpty({ message: 'title is required' })
  @MaxLength(200, { message: 'title must not exceed 200 characters' })
  title: string;

  @IsOptional()
  @IsDateString({}, { message: 'due_at must be a valid ISO8601 date string' })
  due_at?: string;
}
