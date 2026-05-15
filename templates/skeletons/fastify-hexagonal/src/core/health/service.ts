import type { HealthPort } from "../../ports/inbound/health.js";

// HealthService is the core health-check business service.
// It implements ports/inbound/HealthPort.
export class HealthService implements HealthPort {
  check(): string {
    return "ok";
  }
}
