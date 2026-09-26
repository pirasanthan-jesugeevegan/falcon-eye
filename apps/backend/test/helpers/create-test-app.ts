import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { configureApp } from '../../src/bootstrap/configure-app';
import type { AppConfig } from '../../src/config/app-config';
import { HealthModule } from '../../src/health/health.module';
import { SecurityModule } from '../../src/security/security.module';
import { E2EResultsModule } from '../../src/modules/e2e-results/e2e-results.module';
import { E2EResult } from '../../src/modules/e2e-results/entities/e2e-result.entity';
import { GithubConfig } from '../../src/modules/github/entities/github-config.entity';
import { GithubModule } from '../../src/modules/github/github.module';
import { Infrastructure } from '../../src/modules/infrastructure/entities/infrastructure.entity';
import { InfrastructureModule } from '../../src/modules/infrastructure/infrastructure.module';
import { JiraConfig } from '../../src/modules/jira/entities/jira-config.entity';
import { JiraQuery } from '../../src/modules/jira/entities/jira-query.entity';
import { JiraModule } from '../../src/modules/jira/jira.module';
import { Product } from '../../src/modules/products/entities/product.entity';
import { ProductsModule } from '../../src/modules/products/products.module';
import { SonarCloudConfig } from '../../src/modules/sonarcloud/entities/sonarcloud-config.entity';
import { SonarCloudQuery } from '../../src/modules/sonarcloud/entities/sonarcloud-query.entity';
import { SonarCloudModule } from '../../src/modules/sonarcloud/sonarcloud.module';
import { UnitResult } from '../../src/modules/unit-results/entities/unit-result.entity';
import { UnitResultsModule } from '../../src/modules/unit-results/unit-results.module';

export const ALLOWED_ORIGIN = 'https://falcon-eye.example';

const ENTITIES = [
  Product,
  E2EResult,
  UnitResult,
  Infrastructure,
  JiraConfig,
  JiraQuery,
  SonarCloudConfig,
  SonarCloudQuery,
  GithubConfig,
];

export type FakeRepository = Record<
  'find' | 'findOne' | 'create' | 'save' | 'delete',
  jest.Mock
>;

const fakeRepository = (): FakeRepository => ({
  find: jest.fn(async () => []),
  findOne: jest.fn(async () => null),
  create: jest.fn((entity) => entity),
  save: jest.fn(async (entity) => ({
    id: '3f1d5c1e-8c1b-4f7e-9a53-2d0a8f1b7c11',
    ...entity,
  })),
  delete: jest.fn(async () => ({ affected: 1 })),
});

/**
 * The whole app, with repositories faked so no database is needed, and the HTTP
 * layer configured by the same `configureApp` that main.ts and the Lambda use.
 */
export async function createTestApp(overrides: Partial<AppConfig> = {}) {
  const config: AppConfig = {
    allowedOrigins: [ALLOWED_ORIGIN],
    ...overrides,
  };
  const repositories = new Map<unknown, FakeRepository>(
    ENTITIES.map((entity) => [entity, fakeRepository()]),
  );

  let builder = Test.createTestingModule({
    imports: [
      SecurityModule.register(config),
      HealthModule,
      ProductsModule,
      E2EResultsModule,
      UnitResultsModule,
      InfrastructureModule,
      JiraModule,
      SonarCloudModule,
      GithubModule,
    ],
  });
  for (const [entity, repository] of repositories) {
    builder = builder
      .overrideProvider(getRepositoryToken(entity as never))
      .useValue(repository);
  }

  const app: INestApplication = (
    await builder.compile()
  ).createNestApplication();
  configureApp(app);
  await app.init();

  return {
    app,
    repo: (entity: unknown) => repositories.get(entity) as FakeRepository,
  };
}
