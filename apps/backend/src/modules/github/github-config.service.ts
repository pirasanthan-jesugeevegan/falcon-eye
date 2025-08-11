import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GithubConfig } from './entities/github-config.entity';
import { GithubService } from './github.service';
import { encrypt } from '../../crypto.util';
import { CreateGithubConfigDto } from './dto/create-github-config.dto';
import { TriggerWorkflowDto } from './dto/trigger-workflow.dto';

@Injectable()
export class GithubConfigService {
  constructor(
    @InjectRepository(GithubConfig)
    private readonly configRepo: Repository<GithubConfig>,
    private readonly githubService: GithubService,
  ) {}

  async createConfig(dto: CreateGithubConfigDto) {
    try {
      // Check for duplicate workflow and branch combination
      const existingConfig = await this.configRepo.findOne({
        where: {
          workflow: dto.workflow,
          defaultRef: dto.defaultRef || 'main',
          isActive: true,
        },
      });

      if (existingConfig) {
        return {
          success: false,
          message: `A configuration with workflow "${dto.workflow}" and branch "${dto.defaultRef || 'main'}" already exists. Please use a different workflow or branch.`,
        };
      }

      // First, validate the GitHub credentials by calling the API
      const encryptedPat = encrypt(dto.pat);
      const validation = await this.githubService.validateConfig(
        dto.owner,
        dto.repo,
        dto.workflow,
        encryptedPat,
      );

      // If validation fails, return the GitHub API response
      if (!validation.isValid) {
        return {
          success: false,
          message: 'GitHub configuration validation failed',
          githubApiResponse: validation.apiResponse,
        };
      }

      // If validation succeeds, save to database
      const config = this.configRepo.create({
        owner: dto.owner,
        repo: dto.repo,
        workflow: dto.workflow,
        encryptedPat,
        inputsSchema: dto.inputsSchema,
        defaultRef: dto.defaultRef || 'main',
        createdBy: dto.createdBy,
      });

      const savedConfig = await this.configRepo.save(config);

      return savedConfig;
    } catch (error) {
      throw new BadRequestException(
        `Failed to create GitHub config: ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      return await this.configRepo.find({
        where: { isActive: true },
        select: [
          'id',
          'owner',
          'repo',
          'workflow',
          'inputsSchema',
          'defaultRef',
          'createdAt',
          'updatedAt',
        ],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve configs: ${error.message}`,
      );
    }
  }

  async deleteConfig(id: string) {
    try {
      // First check if the config exists
      const config = await this.configRepo.findOne({
        where: { id, isActive: true },
      });

      if (!config) {
        throw new NotFoundException('GitHub config not found');
      }

      // Soft delete the config (set isActive to false)
      // The related workflows will be automatically deleted due to CASCADE
      await this.configRepo.update(id, { isActive: false });

      return {
        success: true,
        message:
          'GitHub configuration and related workflows deleted successfully',
        deletedConfig: {
          id: config.id,
          owner: config.owner,
          repo: config.repo,
          workflow: config.workflow,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete GitHub config: ${error.message}`,
      );
    }
  }

  async triggerWorkflow(configId: string, dto: TriggerWorkflowDto) {
    try {
      // Find the config
      const config = await this.configRepo.findOne({
        where: { id: configId, isActive: true },
      });

      if (!config) {
        throw new NotFoundException('GitHub config not found');
      }

      // Use the ref from DTO or default to 'main'
      const ref = dto.ref || 'main';

      // Convert inputs to string format for GitHub API
      const githubInputs: Record<string, string> = {};
      for (const [key, value] of Object.entries(dto.inputs)) {
        githubInputs[key] = String(value);
      }

      // Trigger the workflow using config credentials and inputs
      const status = await this.githubService.triggerWorkflow(
        config.owner,
        config.repo,
        config.workflow,
        ref,
        githubInputs,
        config.encryptedPat,
      );

      return {
        success: true,
        message: 'Workflow triggered successfully',
        status: 'queued',
        httpStatus: status,
        triggeredBy: dto.triggeredBy,
        usedInputs: dto.inputs,
        usedRef: ref,
        config: {
          id: config.id,
          owner: config.owner,
          repo: config.repo,
          workflow: config.workflow,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to trigger workflow: ${error.message}`,
      );
    }
  }

  async updateInputsSchema(id: string, inputsSchema: any[]) {
    try {
      // Find the config
      const config = await this.configRepo.findOne({
        where: { id, isActive: true },
      });

      if (!config) {
        throw new NotFoundException('GitHub config not found');
      }

      // Update only the inputsSchema
      await this.configRepo.update(id, { inputsSchema });

      return {
        success: true,
        message: 'Workflow inputs updated successfully',
        config: {
          id: config.id,
          owner: config.owner,
          repo: config.repo,
          workflow: config.workflow,
          inputsSchema,
          defaultRef: config.defaultRef,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update workflow inputs: ${error.message}`,
      );
    }
  }

  async getWorkflowRuns(configId: string) {
    try {
      // Find the config
      const config = await this.configRepo.findOne({
        where: { id: configId, isActive: true },
      });

      if (!config) {
        throw new NotFoundException('GitHub config not found');
      }

      // Get workflow runs using the GitHub service
      const runs = await this.githubService.getWorkflowRuns(
        config.owner,
        config.repo,
        config.workflow,
        config.encryptedPat,
        10, // per_page
      );

      return {
        success: true,
        runs: runs.workflow_runs || [],
        total_count: runs.total_count || 0,
        config: {
          id: config.id,
          owner: config.owner,
          repo: config.repo,
          workflow: config.workflow,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to get workflow runs: ${error.message}`,
      );
    }
  }

  async getWorkflowRunStatus(configId: string, runId: string) {
    try {
      // Find the config
      const config = await this.configRepo.findOne({
        where: { id: configId, isActive: true },
      });

      if (!config) {
        throw new NotFoundException('GitHub config not found');
      }

      // Get specific workflow run using the GitHub service
      const run = await this.githubService.getWorkflowRun(
        config.owner,
        config.repo,
        runId,
        config.encryptedPat,
      );

      return {
        success: true,
        run,
        config: {
          id: config.id,
          owner: config.owner,
          repo: config.repo,
          workflow: config.workflow,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to get workflow run status: ${error.message}`,
      );
    }
  }
}
