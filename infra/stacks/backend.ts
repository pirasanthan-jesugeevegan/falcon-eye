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
    // A traffic spike (or abuse) can't run up the bill: at most 20 concurrent runs.
    // The dashboard fires about 40 requests at once; 5 rejected most of them with 429.
    concurrency: { reserved: 20 },
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
      // Versions are read from infra/package.json (SST 3.x), where they are pinned to match
      // the backend's lockfile. Unlisted, npm installs the latest, and @nestjs/core 12 is
      // ESM-only, which fails to load from this CommonJS bundle.
      install: [
        '@nestjs/common',
        '@nestjs/core',
        '@nestjs/platform-express',
        '@nestjs/typeorm',
        '@nestjs/config',
        '@nestjs/throttler',
        'express',
        'helmet',
        'reflect-metadata',
        'rxjs',
        'typeorm',
        'pg',
        'class-validator',
        'class-transformer',
        'serverless-http',
        'axios',
        'uuid',
      ],
    },
  });

  return { api };
}
