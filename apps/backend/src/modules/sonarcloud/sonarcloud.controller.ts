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
import { SonarCloudService } from './sonarcloud.service';
import { CreateSonarCloudConfigDto } from './dto/create-sonarcloud-config.dto';
import { UpdateSonarCloudConfigDto } from './dto/update-sonarcloud-config.dto';
import { CreateSonarCloudQueryDto } from './dto/create-sonarcloud-query.dto';
import { UpdateSonarCloudQueryDto } from './dto/update-sonarcloud-query.dto';
import { SonarCloudConfig } from './entities/sonarcloud-config.entity';
import { SonarCloudQuery } from './entities/sonarcloud-query.entity';

@Controller('sonarcloud')
export class SonarCloudController {
  constructor(private readonly sonarCloudService: SonarCloudService) {}

  // Jira Configuration Endpoints
  @Post('config')
  @HttpCode(HttpStatus.CREATED)
  createSonarCloudConfig(
    @Body() createSonarCloudConfigDto: CreateSonarCloudConfigDto,
  ): Promise<SonarCloudConfig> {
    return this.sonarCloudService.createSonarCloudConfig(
      createSonarCloudConfigDto,
    );
  }

  @Get('config')
  @HttpCode(HttpStatus.OK)
  findAllSonarCloudConfigs(): Promise<SonarCloudConfig[]> {
    return this.sonarCloudService.findAllSonarCloudConfigs();
  }

  @Get('config/:id')
  @HttpCode(HttpStatus.OK)
  findSonarCloudConfigById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SonarCloudConfig> {
    return this.sonarCloudService.findSonarCloudConfigById(id);
  }

  @Patch('config/:id')
  @HttpCode(HttpStatus.OK)
  updateJiraConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSonarCloudConfigDto: UpdateSonarCloudConfigDto,
  ): Promise<SonarCloudConfig> {
    return this.sonarCloudService.updateSonarCloudConfig(
      id,
      updateSonarCloudConfigDto,
    );
  }

  @Delete('config/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeJiraConfig(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.sonarCloudService.removeSonarCloudConfig(id);
  }

  // Jira Query Endpoints
  @Post('query')
  @HttpCode(HttpStatus.CREATED)
  createSonarCloudQuery(
    @Body() createSonarCloudQueryDto: CreateSonarCloudQueryDto,
  ): Promise<SonarCloudQuery> {
    return this.sonarCloudService.createSonarCloudQuery(
      createSonarCloudQueryDto,
    );
  }

  @Get('query')
  @HttpCode(HttpStatus.OK)
  findAllSonarCloudQueries(): Promise<SonarCloudQuery[]> {
    return this.sonarCloudService.findAllSonarCloudQueries();
  }

  @Get('config/:configId/query')
  @HttpCode(HttpStatus.OK)
  findJiraQueriesByConfigId(
    @Param('configId', ParseUUIDPipe) configId: string,
  ): Promise<SonarCloudQuery[]> {
    return this.sonarCloudService.findSonarCloudQueriesByConfigId(configId);
  }

  @Get('query/:id')
  @HttpCode(HttpStatus.OK)
  findSonarCloudQueryById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SonarCloudQuery> {
    return this.sonarCloudService.findSonarCloudQueryById(id);
  }

  @Patch('query/:id')
  @HttpCode(HttpStatus.OK)
  updateJiraQuery(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSonarCloudQueryDto: UpdateSonarCloudQueryDto,
  ): Promise<SonarCloudQuery> {
    return this.sonarCloudService.updateSonarCloudQuery(
      id,
      updateSonarCloudQueryDto,
    );
  }

  @Delete('query/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeJiraQuery(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.sonarCloudService.removeSonarCloudQuery(id);
  }

  // Execute Query Endpoint
  @Get('query/:id/execute')
  @HttpCode(HttpStatus.OK)
  executeSonarCloudQuery(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return this.sonarCloudService.executeQuery(id);
  }
}
