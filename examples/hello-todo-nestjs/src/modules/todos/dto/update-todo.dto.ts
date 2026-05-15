import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

/**
 * UpdateTodoDto is the validated request body for PATCH /v1/todos/:id.
 *
 * All fields are optional (partial update semantics). Explicitly passing
 * due_at: null clears the due date; omitting due_at leaves it unchanged.
 * The service distinguishes absent (undefined) from explicit null.
 */
export class UpdateTodoDto {
  @IsOptional()
  @IsNotEmpty({ message: 'title must not be empty' })
  @MaxLength(200, { message: 'title must not exceed 200 characters' })
  title?: string;

  /**
   * due_at may be:
   *   - absent (undefined) → no change
   *   - null               → clear the due date
   *   - ISO8601 string     → set the due date
   */
  @IsOptional()
  @IsDateString({}, { message: 'due_at must be a valid ISO8601 date string' })
  due_at?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'completed must be a boolean' })
  completed?: boolean;
}
