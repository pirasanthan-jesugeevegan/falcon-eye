import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import type { AppConfig } from '../config/app-config';
import { APP_CONFIG } from '../security/security.constants';

/**
 * The single place the HTTP layer is configured. `main.ts`, the Lambda handler
 * and the tests all call this, so what the tests exercise is what gets deployed.
 * (They used to diverge: the Lambda handler switched `skipMissingProperties` on,
 * which let requests with required fields missing through.)
 */
export function configureApp(
  app: INestApplication,
  options: { globalPrefix?: string } = {},
): void {
  const config = app.get<AppConfig>(APP_CONFIG);

  // Behind a function URL / proxy the client address is in X-Forwarded-For.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(helmet());
  app.enableCors({
    origin: config.allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['content-type'],
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Honours @Exclude(): encrypted tokens never leave the API.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  if (options.globalPrefix) app.setGlobalPrefix(options.globalPrefix);
}
