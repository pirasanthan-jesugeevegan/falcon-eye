import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SonarCloudController } from './sonarcloud.controller';
import { SonarCloudService } from './sonarcloud.service';
import { SonarCloudConfig } from './entities/sonarcloud-config.entity';
import { SonarCloudQuery } from './entities/sonarcloud-query.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SonarCloudConfig, SonarCloudQuery])],
  controllers: [SonarCloudController],
  providers: [SonarCloudService],
  exports: [SonarCloudService],
})
export class SonarCloudModule {}
