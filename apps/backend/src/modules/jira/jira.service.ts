import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { JiraConfig } from './entities/jira-config.entity';
import { JiraQuery } from './entities/jira-query.entity';
import { CreateJiraConfigDto } from './dto/create-jira-config.dto';
import { UpdateJiraConfigDto } from './dto/update-jira-config.dto';
import { CreateJiraQueryDto } from './dto/create-jira-query.dto';
import { UpdateJiraQueryDto } from './dto/update-jira-query.dto';

@Injectable()
export class JiraService {
  constructor(
    @InjectRepository(JiraConfig)
    private jiraConfigRepository: Repository<JiraConfig>,
    @InjectRepository(JiraQuery)
    private jiraQueryRepository: Repository<JiraQuery>,
  ) {}

  // Jira Configuration Methods
  async createJiraConfig(
    createJiraConfigDto: CreateJiraConfigDto,
  ): Promise<JiraConfig> {
    try {
      const existingConfig = await this.jiraConfigRepository.findOne({
        where: { apiToken: createJiraConfigDto.apiToken },
      });

      // If the apiToken exists, throw an error
      if (existingConfig) {
        throw new BadRequestException('API token already exists');
      }
      // Verify Jira credentials before saving
      await this.verifyJiraCredentials(
        createJiraConfigDto.baseUrl,
        createJiraConfigDto.email,
        createJiraConfigDto.apiToken,
      );

      const jiraConfig = this.jiraConfigRepository.create(createJiraConfigDto);

      return this.jiraConfigRepository.save(jiraConfig);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create Jira configuration: ${error.message}`,
      );
    }
  }

  async findAllJiraConfigs(): Promise<JiraConfig[]> {
    return this.jiraConfigRepository.find();
  }

  async findJiraConfigById(id: string): Promise<JiraConfig> {
    const jiraConfig = await this.jiraConfigRepository.findOne({
      where: { id },
    });
    if (!jiraConfig) {
      throw new NotFoundException(`Jira configuration with ID ${id} not found`);
    }
    return jiraConfig;
  }

  async updateJiraConfig(
    id: string,
    updateJiraConfigDto: UpdateJiraConfigDto,
  ): Promise<JiraConfig> {
    const jiraConfig = await this.findJiraConfigById(id);

    // If credentials are being updated, verify them
    if (
      updateJiraConfigDto.baseUrl ||
      updateJiraConfigDto.email ||
      updateJiraConfigDto.apiToken
    ) {
      await this.verifyJiraCredentials(
        updateJiraConfigDto.baseUrl || jiraConfig.baseUrl,
        updateJiraConfigDto.email || jiraConfig.email,
        updateJiraConfigDto.apiToken || jiraConfig.apiToken,
      );
    }

    // Update the configuration
    Object.assign(jiraConfig, updateJiraConfigDto);
    return this.jiraConfigRepository.save(jiraConfig);
  }

  async removeJiraConfig(id: string): Promise<void> {
    const jiraConfig = await this.findJiraConfigById(id);
    await this.jiraConfigRepository.remove(jiraConfig);
  }

  // Jira Query Methods
  async createJiraQuery(
    createJiraQueryDto: CreateJiraQueryDto,
  ): Promise<JiraQuery> {
    // Check if Jira config exists
    const jiraConfig = await this.findJiraConfigById(
      createJiraQueryDto.jiraConfigId,
    );

    // Verify if the JQL query is valid
    await this.verifyJqlQuery(
      jiraConfig.baseUrl,
      jiraConfig.email,
      jiraConfig.apiToken,
      createJiraQueryDto.jqlQuery,
    );

    const jiraQuery = this.jiraQueryRepository.create(createJiraQueryDto);
    return this.jiraQueryRepository.save(jiraQuery);
  }

  async findAllJiraQueries(): Promise<JiraQuery[]> {
    return this.jiraQueryRepository.find({ relations: ['jiraConfig'] });
  }

  async findJiraQueriesByConfigId(jiraConfigId: string): Promise<JiraQuery[]> {
    return this.jiraQueryRepository.find({
      where: { jiraConfigId },
      relations: ['jiraConfig'],
    });
  }

  async findJiraQueryById(id: string): Promise<JiraQuery> {
    const jiraQuery = await this.jiraQueryRepository.findOne({
      where: { id },
      relations: ['jiraConfig'],
    });
    if (!jiraQuery) {
      throw new NotFoundException(`Jira query with ID ${id} not found`);
    }
    return jiraQuery;
  }

  async updateJiraQuery(
    id: string,
    updateJiraQueryDto: UpdateJiraQueryDto,
  ): Promise<JiraQuery> {
    const jiraQuery = await this.findJiraQueryById(id);

    // If JQL query or Jira config is being updated, verify the query
    if (updateJiraQueryDto.jqlQuery || updateJiraQueryDto.jiraConfigId) {
      const jiraConfigId =
        updateJiraQueryDto.jiraConfigId || jiraQuery.jiraConfigId;
      const jiraConfig = await this.findJiraConfigById(jiraConfigId);
      const jqlQuery = updateJiraQueryDto.jqlQuery || jiraQuery.jqlQuery;

      await this.verifyJqlQuery(
        jiraConfig.baseUrl,
        jiraConfig.email,
        jiraConfig.apiToken,
        jqlQuery,
      );
    }

    // Update the query
    Object.assign(jiraQuery, updateJiraQueryDto);
    return this.jiraQueryRepository.save(jiraQuery);
  }

  async removeJiraQuery(id: string): Promise<void> {
    const jiraQuery = await this.findJiraQueryById(id);
    await this.jiraQueryRepository.remove(jiraQuery);
  }

  // Execute Jira Query to fetch issues
  async executeQuery(queryId: string): Promise<any> {
    const jiraQuery = await this.findJiraQueryById(queryId);
    const jiraConfig = await this.findJiraConfigById(jiraQuery.jiraConfigId);

    return this.searchJiraIssues(
      jiraConfig.baseUrl,
      jiraConfig.email,
      jiraConfig.apiToken,
      jiraQuery.jqlQuery,
    );
  }

  // Utility methods
  private async verifyJiraCredentials(
    baseUrl: string,
    email: string,
    apiToken: string,
  ): Promise<boolean> {
    try {
      const response = await axios.get(`${baseUrl}/rest/api/3/myself`, {
        auth: {
          username: email,
          password: apiToken,
        },
      });

      if (response.status === 200) {
        return true;
      }
      throw new BadRequestException('Invalid Jira credentials');
    } catch (error) {
      throw new BadRequestException(
        `Failed to verify Jira credentials: ${error.message}`,
      );
    }
  }

  private async verifyJqlQuery(
    baseUrl: string,
    email: string,
    apiToken: string,
    jqlQuery: string,
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${baseUrl}/rest/api/3/search/jql`,
        {
          jql: jqlQuery,
          maxResults: 1,
        },
        {
          auth: {
            username: email,
            password: apiToken,
          },
        },
      );

      if (response.status === 200) {
        return true;
      }
      throw new BadRequestException('Invalid JQL query');
    } catch (error) {
      throw new BadRequestException(
        `Failed to verify JQL query: ${error.message}`,
      );
    }
  }

  private async searchJiraIssues(
    baseUrl: string,
    email: string,
    apiToken: string,
    jqlQuery: string,
    maxResults = 50,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${baseUrl}/rest/api/3/search/jql`,
        {
          jql: jqlQuery,
          maxResults,
          fields: [
            'summary',
            'status',
            'assignee',
            'created',
            'updated',
            'priority',
            'issuetype',
          ],
        },
        {
          auth: {
            username: email,
            password: apiToken,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException(
        `Failed to search Jira issues: ${error.message}`,
      );
    }
  }
}
