import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GithubService } from './github.service';
import { GithubConfig } from './entities/github-config.entity';
import { GithubConfigController } from './github-config.controller';
import { GithubConfigService } from './github-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([GithubConfig])],
  controllers: [GithubConfigController],
  providers: [GithubService, GithubConfigService],
  exports: [GithubService, GithubConfigService],
})
export class GithubModule {}
