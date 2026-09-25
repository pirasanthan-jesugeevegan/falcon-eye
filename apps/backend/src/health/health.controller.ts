import { Controller, Get, Inject } from '@nestjs/common';
import type { AppConfig } from '../config/app-config';
import { APP_CONFIG } from '../security/security.constants';

@Controller('health')
export class HealthController {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  /** Lets the dashboard show a "read-only demo" banner without guessing. */
  @Get()
  check() {
    return { status: 'ok', demoMode: this.config.demoMode };
  }
}
