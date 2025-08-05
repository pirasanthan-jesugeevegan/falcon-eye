export function createBackendStack(db: sst.aws.Postgres, vpc: sst.aws.Vpc) {
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
      ALLOWED_ORIGINS: '*',
      DB_HOST: db.host,
      DB_PORT: db.port.toString(),
      DB_USERNAME: db.username,
      DB_PASSWORD: db.password,
      DB_NAME: db.database,
    },
    url: {
      cors: {
        allowCredentials: true,
        allowHeaders: ['*'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowOrigins: ['*'],
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
    url: api.url,
  };
}
