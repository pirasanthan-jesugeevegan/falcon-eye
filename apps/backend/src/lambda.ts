import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap/configure-app';
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

  // Same HTTP setup as main.ts (CORS, headers, strict validation, serialization).
  configureApp(app, { globalPrefix: 'api' });

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();

  // Configure serverless-http with proper body parsing
  return serverless(expressApp, {
    request: (request: any, event: any, context: any) => {
      // Ensure body is properly parsed as JSON
      if (event.body && typeof event.body === 'string') {
        try {
          request.body = JSON.parse(event.body);
        } catch (e) {
          // If parsing fails, keep as string
          request.body = event.body;
        }
      }
    },
  });
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
