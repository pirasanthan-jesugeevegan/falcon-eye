import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JiraController } from './jira.controller';
import { JiraService } from './jira.service';
import { JiraConfig } from './entities/jira-config.entity';
import { JiraQuery } from './entities/jira-query.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JiraConfig, JiraQuery])],
  controllers: [JiraController],
  providers: [JiraService],
  exports: [JiraService],
})
export class JiraModule {}
