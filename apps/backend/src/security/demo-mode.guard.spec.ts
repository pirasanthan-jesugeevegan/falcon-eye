import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DemoModeGuard } from './demo-mode.guard';
import { DisabledInDemo } from './decorators';

class ReadsController {
  list() {}
  create() {}
}

@DisabledInDemo()
class IntegrationController {
  read() {}
}

class HandlerFlaggedController {
  @DisabledInDemo() trigger() {}
}

function contextFor(
  controller: new () => object,
  method: string,
  httpMethod: string,
): ExecutionContext {
  return {
    getHandler: () =>
      (controller.prototype as Record<string, () => void>)[method],
    getClass: () => controller,
    switchToHttp: () => ({ getRequest: () => ({ method: httpMethod }) }),
  } as unknown as ExecutionContext;
}

const guardFor = (demoMode: boolean) =>
  new DemoModeGuard(new Reflector(), { demoMode, allowedOrigins: [] });

describe('DemoModeGuard', () => {
  describe('outside demo mode', () => {
    const guard = guardFor(false);

    it('allows everything, because protection there is the network perimeter', () => {
      for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
        expect(
          guard.canActivate(contextFor(ReadsController, 'create', method)),
        ).toBe(true);
      }
      expect(
        guard.canActivate(contextFor(IntegrationController, 'read', 'GET')),
      ).toBe(true);
    });
  });

  describe('demo mode', () => {
    const guard = guardFor(true);

    it('lets anyone read', () => {
      for (const method of ['GET', 'HEAD']) {
        expect(
          guard.canActivate(contextFor(ReadsController, 'list', method)),
        ).toBe(true);
      }
    });

    it('refuses every write', () => {
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        expect(() =>
          guard.canActivate(contextFor(ReadsController, 'create', method)),
        ).toThrow(new ForbiddenException('This is a read-only public demo.'));
      }
    });

    it('refuses integration controllers, even for a read', () => {
      expect(() =>
        guard.canActivate(contextFor(IntegrationController, 'read', 'GET')),
      ).toThrow(
        new ForbiddenException('Integrations are disabled in the public demo.'),
      );
    });

    it('refuses a single flagged handler on an otherwise open controller', () => {
      expect(() =>
        guard.canActivate(
          contextFor(HandlerFlaggedController, 'trigger', 'GET'),
        ),
      ).toThrow(ForbiddenException);
    });
  });
});
