import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AppConfig } from '../config/app-config';
import { DISABLED_IN_DEMO } from './decorators';
import { APP_CONFIG } from './security.constants';

const READ_ONLY_METHODS = ['GET', 'HEAD'];

/**
 * In demo mode the API is read-only and the integration routes are off. Outside
 * demo mode this guard does nothing: protection there is the network perimeter,
 * not the app (see docs/adr/0001).
 */
@Injectable()
export class DemoModeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.config.demoMode) return true;

    const disabled = this.reflector.getAllAndOverride<boolean>(
      DISABLED_IN_DEMO,
      [context.getHandler(), context.getClass()],
    );
    if (disabled) {
      throw new ForbiddenException(
        'Integrations are disabled in the public demo.',
      );
    }

    const { method } = context.switchToHttp().getRequest<Request>();
    if (!READ_ONLY_METHODS.includes(method)) {
      throw new ForbiddenException('This is a read-only public demo.');
    }
    return true;
  }
}
