import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('healthz')
  healthz(): { ok: boolean } {
    this.healthService.check();
    return { ok: true };
  }
}
