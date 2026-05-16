import { TodoMemoryRepo } from './adapters/outbound/memory/todo.memory-repo.js';
import { TodoService } from './core/todo/todo.service.js';
import { buildServer } from './adapters/inbound/http/server.js';

const port = Number(process.env['PORT'] ?? 8080);

const repo = new TodoMemoryRepo();
const service = new TodoService(repo);
const app = await buildServer(service);

try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
