import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { TodosModule } from './modules/todos/todos.module';

/**
 * AppModule is the root module. It imports all feature modules.
 */
@Module({
  imports: [HealthModule, TodosModule],
})
export class AppModule {}
