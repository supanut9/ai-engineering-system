import { Module } from '@nestjs/common';
import { TodosRepository } from './repositories/todos.repository';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

/**
 * TodosModule wires together the todos resource's controller, service,
 * and repository. The repository is scoped to this module (not re-exported)
 * so other modules cannot bypass the service layer.
 */
@Module({
  controllers: [TodosController],
  providers: [TodosService, TodosRepository],
})
export class TodosModule {}
