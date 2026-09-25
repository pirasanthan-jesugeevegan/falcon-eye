import type { Repository } from 'typeorm';
import { encrypt } from '../../crypto.util';
import {
  DEMO_GITHUB_WORKFLOWS,
  DEMO_JIRA_CONFIG,
  DEMO_JIRA_QUERIES,
  DEMO_SONAR_CONFIG,
  DEMO_SONAR_QUERIES,
} from '../../demo/demo-integrations';
import { GithubConfig } from '../../modules/github/entities/github-config.entity';
import { JiraConfig } from '../../modules/jira/entities/jira-config.entity';
import { JiraQuery } from '../../modules/jira/entities/jira-query.entity';
import { SonarCloudConfig } from '../../modules/sonarcloud/entities/sonarcloud-config.entity';
import { SonarCloudQuery } from '../../modules/sonarcloud/entities/sonarcloud-query.entity';

export interface IntegrationRepositories {
  jiraConfig: Repository<JiraConfig>;
  jiraQuery: Repository<JiraQuery>;
  sonarConfig: Repository<SonarCloudConfig>;
  sonarQuery: Repository<SonarCloudQuery>;
  github: Repository<GithubConfig>;
}

/**
 * Inserts the Jira, SonarCloud and GitHub configs and queries that the demo's
 * sample data (demo/demo-integrations.ts) answers for. The tokens are encrypted
 * placeholders: in demo mode nothing decrypts them or calls out with them.
 */
export async function seedIntegrations(repos: IntegrationRepositories) {
  const token = () => encrypt('demo-placeholder-not-a-real-token');

  const jira = await repos.jiraConfig.save({
    ...DEMO_JIRA_CONFIG,
    encryptedApiToken: token(),
    isActive: true,
  });
  for (const query of DEMO_JIRA_QUERIES) {
    await repos.jiraQuery.save({
      ...query,
      jiraConfigId: jira.id,
      isActive: true,
    });
  }

  const sonar = await repos.sonarConfig.save({
    ...DEMO_SONAR_CONFIG,
    encryptedApiToken: token(),
    isActive: true,
  });
  for (const query of DEMO_SONAR_QUERIES) {
    await repos.sonarQuery.save({
      ...query,
      sonarCloudConfigId: sonar.id,
      isActive: true,
    });
  }

  for (const {
    owner,
    repo,
    workflow,
    inputsSchema,
    defaultRef,
  } of DEMO_GITHUB_WORKFLOWS) {
    await repos.github.save({
      owner,
      repo,
      workflow,
      inputsSchema,
      defaultRef,
      encryptedPat: token(),
      isActive: true,
      createdBy: 'demo-seed',
    });
  }
}
