import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  AppConfig,
  assertSafeForProduction,
  getAppConfig,
} from '../config/app-config';
import { APP_CONFIG } from './security.constants';

/**
 * Registers the guards for every route. The rate limiter is in memory, so on
 * Lambda it is best-effort per warm instance: a brake, not a wall.
 */
@Global()
@Module({})
export class SecurityModule {
  static register(override?: AppConfig): DynamicModule {
    return {
      module: SecurityModule,
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])],
      providers: [
        {
          provide: APP_CONFIG,
          useFactory: (): AppConfig => {
            if (override) return override;
            const config = getAppConfig(process.env);
            for (const warning of assertSafeForProduction(
              config,
              process.env,
            )) {
              new Logger('Security').warn(warning);
            }
            return config;
          },
        },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
      exports: [APP_CONFIG],
    };
  }
}
