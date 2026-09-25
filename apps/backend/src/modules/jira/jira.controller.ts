import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JiraService } from './jira.service';
import { CreateJiraConfigDto } from './dto/create-jira-config.dto';
import { UpdateJiraConfigDto } from './dto/update-jira-config.dto';
import { CreateJiraQueryDto } from './dto/create-jira-query.dto';
import { UpdateJiraQueryDto } from './dto/update-jira-query.dto';
import { JiraConfig } from './entities/jira-config.entity';
import { JiraQuery } from './entities/jira-query.entity';

@Controller('jira')
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  // Jira Configuration Endpoints
  @Post('config')
  @HttpCode(HttpStatus.CREATED)
  createJiraConfig(
    @Body() createJiraConfigDto: CreateJiraConfigDto,
  ): Promise<JiraConfig> {
    return this.jiraService.createJiraConfig(createJiraConfigDto);
  }

  @Get('config')
  @HttpCode(HttpStatus.OK)
  findAllJiraConfigs(): Promise<JiraConfig[]> {
    return this.jiraService.findAllJiraConfigs();
  }

  @Get('config/:id')
  @HttpCode(HttpStatus.OK)
  findJiraConfigById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JiraConfig> {
    return this.jiraService.findJiraConfigById(id);
  }

  @Patch('config/:id')
  @HttpCode(HttpStatus.OK)
  updateJiraConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJiraConfigDto: UpdateJiraConfigDto,
  ): Promise<JiraConfig> {
    return this.jiraService.updateJiraConfig(id, updateJiraConfigDto);
  }

  @Delete('config/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeJiraConfig(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.jiraService.removeJiraConfig(id);
  }

  // Jira Query Endpoints
  @Post('query')
  @HttpCode(HttpStatus.CREATED)
  createJiraQuery(
    @Body() createJiraQueryDto: CreateJiraQueryDto,
  ): Promise<JiraQuery> {
    return this.jiraService.createJiraQuery(createJiraQueryDto);
  }

  @Get('query')
  @HttpCode(HttpStatus.OK)
  findAllJiraQueries(): Promise<JiraQuery[]> {
    return this.jiraService.findAllJiraQueries();
  }

  @Get('config/:configId/query')
  @HttpCode(HttpStatus.OK)
  findJiraQueriesByConfigId(
    @Param('configId', ParseUUIDPipe) configId: string,
  ): Promise<JiraQuery[]> {
    return this.jiraService.findJiraQueriesByConfigId(configId);
  }

  @Get('query/:id')
  @HttpCode(HttpStatus.OK)
  findJiraQueryById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JiraQuery> {
    return this.jiraService.findJiraQueryById(id);
  }

  @Patch('query/:id')
  @HttpCode(HttpStatus.OK)
  updateJiraQuery(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJiraQueryDto: UpdateJiraQueryDto,
  ): Promise<JiraQuery> {
    return this.jiraService.updateJiraQuery(id, updateJiraQueryDto);
  }

  @Delete('query/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeJiraQuery(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.jiraService.removeJiraQuery(id);
  }

  // Execute Query Endpoint
  @Get('query/:id/execute')
  @HttpCode(HttpStatus.OK)
  executeJiraQuery(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return this.jiraService.executeQuery(id);
  }
}
