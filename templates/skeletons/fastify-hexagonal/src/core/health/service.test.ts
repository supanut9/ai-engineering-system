import { describe, it, expect } from "vitest";
import { HealthService } from "./service.js";

describe("HealthService", () => {
  it("check returns ok", () => {
    const svc = new HealthService();
    expect(svc.check()).toBe("ok");
  });
});
