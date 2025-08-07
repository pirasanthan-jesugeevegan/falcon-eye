import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { SonarCloudConfig } from './entities/sonarcloud-config.entity';
import { SonarCloudQuery } from './entities/sonarcloud-query.entity';
import { CreateSonarCloudConfigDto } from './dto/create-sonarcloud-config.dto';
import { UpdateSonarCloudConfigDto } from './dto/update-sonarcloud-config.dto';
import { CreateSonarCloudQueryDto } from './dto/create-sonarcloud-query.dto';
import { UpdateSonarCloudQueryDto } from './dto/update-sonarcloud-query.dto';

@Injectable()
export class SonarCloudService {
  constructor(
    @InjectRepository(SonarCloudConfig)
    private sonarCloudConfigRepository: Repository<SonarCloudConfig>,
    @InjectRepository(SonarCloudQuery)
    private sonarCloudQueryRepository: Repository<SonarCloudQuery>,
  ) {}

  // SonarCloud Configuration Methods
  async createSonarCloudConfig(
    createSonarCloudConfigDto: CreateSonarCloudConfigDto,
  ): Promise<SonarCloudConfig> {
    try {
      const existingConfig = await this.sonarCloudConfigRepository.findOne({
        where: { apiToken: createSonarCloudConfigDto.apiToken },
      });

      // If the apiToken exists, throw an error
      if (existingConfig) {
        throw new BadRequestException('API token already exists');
      }
      // Verify SonarCloud credentials before saving
      await this.verifySonarCloudCredentials(
        createSonarCloudConfigDto.baseUrl,
        createSonarCloudConfigDto.apiToken,
      );

      const sonarCloudConfig = this.sonarCloudConfigRepository.create(
        createSonarCloudConfigDto,
      );

      return this.sonarCloudConfigRepository.save(sonarCloudConfig);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create SonarCloud configuration: ${error.message}`,
      );
    }
  }

  async findAllSonarCloudConfigs(): Promise<SonarCloudConfig[]> {
    return this.sonarCloudConfigRepository.find();
  }

  async findSonarCloudConfigById(id: string): Promise<SonarCloudConfig> {
    const sonarCloudConfig = await this.sonarCloudConfigRepository.findOne({
      where: { id },
    });
    if (!sonarCloudConfig) {
      throw new NotFoundException(
        `SonarCloud configuration with ID ${id} not found`,
      );
    }
    return sonarCloudConfig;
  }

  async updateSonarCloudConfig(
    id: string,
    updateSonarCloudConfigDto: UpdateSonarCloudConfigDto,
  ): Promise<SonarCloudConfig> {
    const sonarCloudConfig = await this.findSonarCloudConfigById(id);

    // If credentials are being updated, verify them
    if (
      updateSonarCloudConfigDto.baseUrl ||
      updateSonarCloudConfigDto.apiToken
    ) {
      await this.verifySonarCloudCredentials(
        updateSonarCloudConfigDto.baseUrl || sonarCloudConfig.baseUrl,
        updateSonarCloudConfigDto.apiToken || sonarCloudConfig.apiToken,
      );
    }

    // Update the configuration
    Object.assign(sonarCloudConfig, updateSonarCloudConfigDto);
    return this.sonarCloudConfigRepository.save(sonarCloudConfig);
  }

  async removeSonarCloudConfig(id: string): Promise<void> {
    const sonarCloudConfig = await this.findSonarCloudConfigById(id);
    await this.sonarCloudConfigRepository.remove(sonarCloudConfig);
  }

  // Jira Query Methods
  async createSonarCloudQuery(
    createSonarCloudQueryDto: CreateSonarCloudQueryDto,
  ): Promise<SonarCloudQuery> {
    // Check if Jira config exists
    const sonarCloudConfig = await this.findSonarCloudConfigById(
      createSonarCloudQueryDto.sonarCloudConfigId,
    );

    if (createSonarCloudQueryDto.metric.includes('pull_request')) {
      // Verify if the JQL query is valid

      await this.getSonarCloudMetric(
        sonarCloudConfig.baseUrl,
        sonarCloudConfig.apiToken,
        createSonarCloudQueryDto.project,
        'pull_request',
      );
    }

    if (createSonarCloudQueryDto.metric.includes('project_status')) {
      // Verify if the JQL query is valid
      await this.getSonarCloudMetric(
        sonarCloudConfig.baseUrl,
        sonarCloudConfig.apiToken,
        createSonarCloudQueryDto.project,
        'project_status',
      );
    }

    const sonarCloudQuery = this.sonarCloudQueryRepository.create(
      createSonarCloudQueryDto,
    );
    return this.sonarCloudQueryRepository.save(sonarCloudQuery);
  }

  async findAllSonarCloudQueries(): Promise<SonarCloudQuery[]> {
    return this.sonarCloudQueryRepository.find({
      relations: ['sonarCloudConfig'],
    });
  }

  async findSonarCloudQueriesByConfigId(
    sonarCloudConfigId: string,
  ): Promise<SonarCloudQuery[]> {
    return this.sonarCloudQueryRepository.find({
      where: { sonarCloudConfigId },
      relations: ['sonarCloudConfig'],
    });
  }

  async findSonarCloudQueryById(id: string): Promise<SonarCloudQuery> {
    const sonarCloudQuery = await this.sonarCloudQueryRepository.findOne({
      where: { id },
      relations: ['sonarCloudConfig'],
    });
    if (!sonarCloudQuery) {
      throw new NotFoundException(`SonarCloud query with ID ${id} not found`);
    }
    return sonarCloudQuery;
  }

  async updateSonarCloudQuery(
    id: string,
    updateSonarCloudQueryDto: UpdateSonarCloudQueryDto,
  ): Promise<SonarCloudQuery> {
    const sonarCloudQuery = await this.findSonarCloudQueryById(id);

    // If JQL query or Jira config is being updated, verify the query
    if (
      updateSonarCloudQueryDto.project ||
      updateSonarCloudQueryDto.sonarCloudConfigId
    ) {
      const sonarCloudConfigId =
        updateSonarCloudQueryDto.sonarCloudConfigId ||
        sonarCloudQuery.sonarCloudConfigId;
      const sonarCloudConfig =
        await this.findSonarCloudConfigById(sonarCloudConfigId);
      const project =
        updateSonarCloudQueryDto.project || sonarCloudQuery.project;

      if (updateSonarCloudQueryDto.metric.includes('pull_request')) {
        await this.getSonarCloudMetric(
          sonarCloudConfig.baseUrl,
          sonarCloudConfig.apiToken,
          project,
          'pull_request',
        );
      }

      if (updateSonarCloudQueryDto.metric.includes('project_status')) {
        await this.getSonarCloudMetric(
          sonarCloudConfig.baseUrl,
          sonarCloudConfig.apiToken,
          project,
          'project_status',
        );
      }
    }

    // Update the query
    Object.assign(sonarCloudQuery, updateSonarCloudQueryDto);
    return this.sonarCloudQueryRepository.save(sonarCloudQuery);
  }

  async removeSonarCloudQuery(id: string): Promise<void> {
    const sonarCloudQuery = await this.findSonarCloudQueryById(id);
    await this.sonarCloudQueryRepository.remove(sonarCloudQuery);
  }

  // Execute Jira Query to fetch issues
  async executeQuery(queryId: string): Promise<any> {
    const sonarCloudQuery = await this.findSonarCloudQueryById(queryId);
    const sonarCloudConfig = await this.findSonarCloudConfigById(
      sonarCloudQuery.sonarCloudConfigId,
    );
    const result: Record<string, any> = {};

    await Promise.all(
      sonarCloudQuery.metric.map(async (metric) => {
        const data = await this.getSonarCloudMetric(
          sonarCloudConfig.baseUrl,
          sonarCloudConfig.apiToken,
          sonarCloudQuery.project,
          metric as 'pull_request' | 'project_status',
        );
        result[metric] = data;
      }),
    );

    return result;
  }

  // Utility methods
  private async verifySonarCloudCredentials(
    baseUrl: string,
    apiToken: string,
  ): Promise<boolean> {
    try {
      const response = await axios.get(`${baseUrl}/api/languages/list`, {
        headers: {
          Authorization: 'Bearer ' + apiToken,
        },
      });

      if (response.status === 200) {
        return true;
      }
      throw new BadRequestException('Invalid SonarCloud credentials');
    } catch (error) {
      throw new BadRequestException(
        `Failed to verify SonarCloud credentials: ${error.message}`,
      );
    }
  }

  private async getSonarCloudMetric(
    baseUrl: string,
    apiToken: string,
    project: string,
    metric: 'pull_request' | 'project_status',
  ): Promise<boolean> {
    try {
      const response = await axios.get(
        `${baseUrl}/${
          metric === 'pull_request'
            ? 'api/project_pull_requests/list?project='
            : 'api/qualitygates/project_status?projectKey='
        }${project}`,
        {
          headers: {
            Authorization: 'Bearer ' + apiToken,
          },
          params: {
            component: project,
            metricKeys: metric,
          },
        },
      );

      if (response.status === 200) {
        return response.data;
      }
      throw new BadRequestException('Invalid JQL query');
    } catch (error) {
      throw new BadRequestException(
        `Failed to verify JQL query: ${error.message}`,
      );
    }
  }
}
