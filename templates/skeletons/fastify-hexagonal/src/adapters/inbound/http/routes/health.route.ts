import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { HealthPort } from "../../../../ports/inbound/health.js";

const HealthResponseSchema = z.object({
  status: z.string(),
});

// registerHealthRoute wires the health-check endpoint onto the Fastify instance.
export async function registerHealthRoute(
  server: FastifyInstance,
  port: HealthPort
): Promise<void> {
  server.get(
    "/healthz",
    {
      schema: {
        response: {
          200: HealthResponseSchema,
        },
      },
    },
    async (_request, _reply) => {
      return { status: port.check() };
    }
  );
}
