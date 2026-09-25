// Read from the deploy environment (GitHub Actions secrets / variables).
const need = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name}`);
  return value;
};

export function createBackendStack(router: sst.aws.Router) {
  // Create the Lambda function for the NestJS API
  const api = new sst.aws.Function('NestJSAPI', {
    handler: '../apps/backend/dist/src/lambda.handler',
    runtime: 'nodejs20.x',
    timeout: '30 seconds',
    memory: '512 MB',
    // A traffic spike (or abuse) can't run up the bill: at most 5 concurrent runs.
    concurrency: { reserved: 5 },
    environment: {
      NODE_ENV: 'production',
      DEMO_MODE: 'true',
      LOG_LEVEL: 'info',
      // Same-origin behind the router, so no browser origin needs allowing. The
      // config still demands one in production; pin one that can't be reached.
      ALLOWED_ORIGINS: 'https://same-origin.invalid',
      DB_HOST: need('DB_HOST'),
      DB_PORT: process.env.DB_PORT || '5432',
      DB_USERNAME: need('DB_USERNAME'),
      DB_PASSWORD: need('DB_PASSWORD'),
      DB_NAME: need('DB_NAME'),
      // Neon requires TLS.
      DB_SSL: 'true',
      ENCRYPTION_KEY: need('ENCRYPTION_KEY'),
    },
    // Served at /api by the router; the path is kept, matching the app's global prefix.
    url: { router: { instance: router, path: '/api' } },
    nodejs: {
      format: 'cjs',
      // Pinned to the versions the backend is built and tested with (pnpm-lock.yaml).
      // Unpinned names resolve to npm's latest, and @nestjs/core 12 is ESM-only, which
      // fails to load from this CommonJS bundle.
      install: {
        '@nestjs/common': '10.4.20',
        '@nestjs/core': '10.4.20',
        '@nestjs/platform-express': '10.4.20',
        '@nestjs/typeorm': '9.0.1',
        '@nestjs/config': '2.3.4',
        '@nestjs/throttler': '6.7.1',
        express: '4.21.2',
        helmet: '8.3.0',
        'reflect-metadata': '0.2.2',
        rxjs: '7.8.2',
        typeorm: '0.3.25',
        pg: '8.16.3',
        'class-validator': '0.14.2',
        'class-transformer': '0.5.1',
        'serverless-http': '3.2.0',
        axios: '1.11.0',
        uuid: '9.0.1',
      },
    },
  });

  return { api };
}
