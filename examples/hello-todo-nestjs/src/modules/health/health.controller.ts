import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

/**
 * HealthController handles GET /healthz.
 *
 * Used for liveness probing and smoke testing. Returns 200 with
 * {"status":"ok"} while the process is alive.
 */
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('healthz')
  healthz(): { status: string } {
    this.healthService.check();
    return { status: 'ok' };
  }
}
