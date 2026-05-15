import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { HealthService } from "./core/health/service.js";
import { registerHealthRoute } from "./adapters/inbound/http/routes/health.route.js";

// buildServer constructs and configures the Fastify instance.
// Exporting it separately from listen() enables inject()-based testing.
export function buildServer(): FastifyInstance {
  const server = Fastify({
    logger: process.env["LOG_PRETTY"] === "true"
      ? { transport: { target: "pino-pretty" } }
      : true,
  });

  server.register(cors);
  server.register(helmet);

  const healthSvc = new HealthService();
  registerHealthRoute(server, healthSvc);

  return server;
}

// Start the server when this module is the entry point.
const server = buildServer();
const port = Number(process.env["PORT"] ?? 4000);

server.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
