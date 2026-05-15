import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * NotFoundError is thrown by the service layer when a requested resource
 * does not exist. The ApiErrorFilter maps it to a 404 response with the
 * uniform error envelope.
 */
export class NotFoundError extends HttpException {
  constructor(message = 'todo not found') {
    super({ error: { code: 'not_found', message } }, HttpStatus.NOT_FOUND);
  }
}
