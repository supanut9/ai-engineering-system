// HealthPort is the inbound port contract for health-check interactions.
export interface HealthPort {
  check(): string;
}
