import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ValidationError, NotFoundError } from '../../../core/todo/errors.js';

export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof NotFoundError) {
    reply.status(404).send({
      error: { code: 'not_found', message: error.message },
    });
    return;
  }

  if (error instanceof ValidationError) {
    reply.status(400).send({
      error: { code: 'validation', message: error.message },
    });
    return;
  }

  // Fastify validation errors (Zod schema failures) have statusCode 400
  const fe = error as FastifyError;
  if (fe.statusCode === 400) {
    reply.status(400).send({
      error: { code: 'validation', message: error.message },
    });
    return;
  }

  reply.status(500).send({
    error: { code: 'internal', message: 'internal server error' },
  });
}
