import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { GithubConfigService } from './github-config.service';
import { CreateGithubConfigDto } from './dto/create-github-config.dto';
import { TriggerWorkflowDto } from './dto/trigger-workflow.dto';

@Controller('github')
export class GithubConfigController {
  constructor(private readonly githubConfigService: GithubConfigService) {}

  // POST /github/config - Validate & save GitHub credentials
  @Post('config')
  async createConfig(@Body() dto: CreateGithubConfigDto) {
    const result = await this.githubConfigService.createConfig(dto);

    // Check if the operation was successful
    if (
      result &&
      typeof result === 'object' &&
      'success' in result &&
      !result.success
    ) {
      // Check if it's an authentication error (401)
      if (result.githubApiResponse?.status === 401) {
        throw new UnauthorizedException({
          success: false,
          message: result.message,
          githubApiResponse: result.githubApiResponse,
        });
      }

      // For other validation errors, throw BadRequestException
      throw new BadRequestException({
        success: false,
        message: result.message,
        githubApiResponse: result.githubApiResponse,
      });
    }

    return result;
  }

  // GET /github/config - Get all configs
  @Get('config')
  async getAllConfigs() {
    return this.githubConfigService.findAll();
  }

  // PATCH /github/config/:id - Update only inputsSchema
  @Patch('config/:id')
  async updateConfig(
    @Param('id') id: string,
    @Body() body: { inputsSchema: any[] },
  ) {
    return this.githubConfigService.updateInputsSchema(id, body.inputsSchema);
  }

  // DELETE /github/config/:id - Delete config and related workflows
  @Delete('config/:id')
  async deleteConfig(@Param('id') id: string) {
    return this.githubConfigService.deleteConfig(id);
  }

  // POST /github/config/:id/trigger - Trigger workflow for a specific config
  @Post('config/:id/trigger')
  async triggerWorkflow(
    @Param('id') configId: string,
    @Body() dto: TriggerWorkflowDto,
  ) {
    return this.githubConfigService.triggerWorkflow(configId, dto);
  }

  // GET /github/config/:id/runs - Get workflow runs for a config
  @Get('config/:id/runs')
  async getWorkflowRuns(@Param('id') id: string) {
    return this.githubConfigService.getWorkflowRuns(id);
  }

  // GET /github/config/:id/runs/:runId - Get specific workflow run status
  @Get('config/:id/runs/:runId')
  async getWorkflowRunStatus(
    @Param('id') configId: string,
    @Param('runId') runId: string,
  ) {
    return this.githubConfigService.getWorkflowRunStatus(configId, runId);
  }
}
