import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LogLevel } from '@nestjs/common';
import type { Handler } from 'serverless-http';

// Import serverless-http with proper CommonJS handling
const serverlessHttp = require('serverless-http');
const serverless = serverlessHttp.default || serverlessHttp;

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const isDev: boolean = Boolean(process.env.IS_OFFLINE);
  const logLevels: LogLevel[] = isDev
    ? ['error', 'warn', 'log', 'verbose', 'debug']
    : ['error', 'warn', 'log'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Change this to false
      skipMissingProperties: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverless(expressApp);
}

export const handler: Handler = async (event, context) => {
  try {
    server = server ?? (await bootstrap());
    return server(event, context);
  } catch (error) {
    console.error('Lambda handler error:', error);
    throw error;
  }
};
