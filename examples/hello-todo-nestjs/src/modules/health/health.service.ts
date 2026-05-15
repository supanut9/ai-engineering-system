import { Injectable } from '@nestjs/common';

/**
 * HealthService performs any liveness checks required before reporting healthy.
 *
 * For v0.1.0 with in-memory storage there are no external dependencies to
 * probe; the method returns immediately.
 */
@Injectable()
export class HealthService {
  check(): string {
    return 'ok';
  }
}
