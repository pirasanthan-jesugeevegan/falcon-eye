import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/products.module';
import { E2EResultsModule } from './modules/e2e-results/e2e-results.module';
import { UnitResultsModule } from './modules/unit-results/unit-results.module';
import { JiraModule } from './modules/jira/jira.module';
import { join } from 'path';
import { SonarCloudModule } from './modules/sonarcloud/sonarcloud.module';
import { Product } from './modules/products/entities/product.entity';
import { E2EResult } from './modules/e2e-results/entities/e2e-result.entity';
import { UnitResult } from './modules/unit-results/entities/unit-result.entity';
import { JiraConfig } from './modules/jira/entities/jira-config.entity';
import { JiraQuery } from './modules/jira/entities/jira-query.entity';
import { SonarCloudConfig } from './modules/sonarcloud/entities/sonarcloud-config.entity';
import { SonarCloudQuery } from './modules/sonarcloud/entities/sonarcloud-query.entity';
import { GithubModule } from './modules/github/github.module';
import { GithubConfig } from './modules/github/entities/github-config.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT'), 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          Product,
          E2EResult,
          UnitResult,
          JiraConfig,
          JiraQuery,
          SonarCloudConfig,
          SonarCloudQuery,
          GithubConfig,
        ],
        synchronize: true,
        migrations: [join(__dirname, 'database', 'migrations', '*.{ts,js}')],
        migrationsRun: true,
        ssl:
          configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    ProductsModule,
    E2EResultsModule,
    UnitResultsModule,
    JiraModule,
    SonarCloudModule,
    GithubModule,
  ],
})
export class AppModule {}
