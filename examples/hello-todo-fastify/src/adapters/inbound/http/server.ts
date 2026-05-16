import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import type { TodoServicePort } from '../../../ports/inbound/todo-service.port.js';
import { healthRoutes } from './routes/health.routes.js';
import { todosRoutes } from './routes/todos.routes.js';
import { errorHandler } from './error-handler.js';

export async function buildServer(service: TodoServicePort) {
  const app = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
    },
  });

  // Zod type provider
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Plugins
  await app.register(cors);
  await app.register(helmet);

  // Error handler
  app.setErrorHandler(errorHandler);

  // Routes
  await app.register(healthRoutes);
  await app.register(todosRoutes, { service });

  return app;
}
