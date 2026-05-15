import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * ValidationError is thrown by the service layer when business-rule
 * validation fails (e.g. whitespace-only title on PATCH). The
 * ApiErrorFilter maps it to a 400 response with the uniform error envelope.
 *
 * Note: class-validator failures (from the ValidationPipe) are caught by
 * the same filter and also produce a 400 validation_error response.
 */
export class ValidationError extends HttpException {
  constructor(message: string) {
    super(
      { error: { code: 'validation_error', message } },
      HttpStatus.BAD_REQUEST,
    );
  }
}
