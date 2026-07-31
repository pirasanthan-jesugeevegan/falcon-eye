export function createBackendStack(db: sst.aws.Postgres, vpc: sst.aws.Vpc) {
  const encryptionKey = new sst.Secret('EncryptionKey');
  const allowedOrigins = new sst.Secret('AllowedOrigins');

  // Create the Lambda function for the NestJS API
  const api = new sst.aws.Function('NestJSAPI', {
    handler: '../apps/backend/dist/src/lambda.handler',
    runtime: 'nodejs20.x',
    timeout: '60 seconds',
    memory: '1024 MB',
    vpc,
    environment: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
      ALLOWED_ORIGINS: allowedOrigins.value,
      DB_HOST: db.host,
      DB_PORT: db.port.toString(),
      DB_USERNAME: db.username,
      DB_PASSWORD: db.password,
      DB_NAME: db.database,
      // RDS requires TLS. Local/dev uses DB_SSL from .env instead.
      DB_SSL: 'true',
      ENCRYPTION_KEY: encryptionKey.value,
    },
    url: {
      cors: {
        allowCredentials: false,
        allowHeaders: ['*'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        // Secret may be a single origin or a comma-separated list.
        allowOrigins: allowedOrigins.value.apply(value =>
          value
            .split(',')
            .map(origin => origin.trim())
            .filter(Boolean),
        ),
      },
    },
    nodejs: {
      format: 'cjs',
      install: [
        '@nestjs/common',
        '@nestjs/core',
        '@nestjs/platform-express',
        '@nestjs/typeorm',
        '@nestjs/config',
        'express',
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

  return {
    api,
    url: api.url.apply(url => `${url.replace(/\/$/, '')}/api`),
  };
}
