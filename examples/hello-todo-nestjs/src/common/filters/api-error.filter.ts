import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * ApiErrorFilter catches every exception thrown in the request pipeline and
 * maps it to the uniform JSON error envelope used by this service:
 *
 *   {"error":{"code":"<code>","message":"<message>"}}
 *
 * Mapping rules:
 *   - HttpException with an already-shaped body (e.g. from NotFoundError or
 *     ValidationError) → pass the body through unchanged.
 *   - BadRequestException from the global ValidationPipe → extract the first
 *     class-validator message and wrap it as validation_error.
 *   - Any other HttpException → wrap with the appropriate code derived from
 *     the status (404 → not_found, 4xx → validation_error, else internal).
 *   - Non-HttpException (unexpected errors) → 500 internal.
 */
@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'internal';
    let message = 'internal server error';

    if (exception instanceof BadRequestException) {
      // Handle class-validator ValidationPipe errors.
      const raw = exception.getResponse();
      status = HttpStatus.BAD_REQUEST;
      code = 'validation_error';
      if (
        raw !== null &&
        typeof raw === 'object' &&
        'message' in raw
      ) {
        const msgs = (raw as { message: string | string[] }).message;
        message = Array.isArray(msgs) ? msgs[0] : msgs;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof HttpException) {
      // NotFoundError, ValidationError, and any other HttpException may carry
      // a pre-shaped error body.
      const raw = exception.getResponse();
      status = exception.getStatus();
      if (
        raw !== null &&
        typeof raw === 'object' &&
        'error' in raw &&
        typeof (raw as { error: unknown }).error === 'object'
      ) {
        // Already shaped — pass through.
        response.status(status).json(raw);
        return;
      }
      // Generic HttpException — derive code from status.
      code = status === HttpStatus.NOT_FOUND ? 'not_found' : status < 500 ? 'validation_error' : 'internal';
      message = typeof raw === 'string' ? raw : exception.message;
    } else {
      // Unexpected error — log it.
      this.logger.error(
        `unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({ error: { code, message } });
  }
}
