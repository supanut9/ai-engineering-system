import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check(): string {
    return 'ok';
  }
}
