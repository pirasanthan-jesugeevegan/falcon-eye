import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/products.module';
import { E2EResultsModule } from './modules/e2e-results/e2e-results.module';
import { UnitResultsModule } from './modules/unit-results/unit-results.module';
import { JiraModule } from './modules/jira/jira.module';
import { join } from 'path';
import { SonarCloudModule } from './modules/sonarcloud/sonarcloud.module';

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
        url: configService.get<string>('DATABASE_URL'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
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
  ],
})
export class AppModule {}
