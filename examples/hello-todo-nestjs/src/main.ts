import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ApiErrorFilter } from './common/filters/api-error.filter';
import { configuration } from './config/configuration';

async function bootstrap(): Promise<void> {
  const logger = new Logger('bootstrap');
  const { port } = configuration();

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  // Wire the global exception filter so every non-2xx response uses the
  // uniform error envelope: {"error":{"code":"...","message":"..."}}.
  app.useGlobalFilters(new ApiErrorFilter());

  await app.listen(port);
  logger.log(`server starting on port ${port}`);
}

bootstrap();
