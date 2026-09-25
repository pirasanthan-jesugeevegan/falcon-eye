import { randomBytes } from 'crypto';
import { decrypt } from '../../crypto.util';
import {
  DEMO_GITHUB_WORKFLOWS,
  DEMO_JIRA_QUERIES,
  DEMO_SONAR_QUERIES,
} from '../../demo/demo-integrations';
import { seedIntegrations } from './seed-integrations';

// A repository that records what is saved and hands back ids, like the real one.
const fakeRepository = (prefix: string) => {
  const saved: any[] = [];
  return {
    saved,
    save: jest.fn(async (entity: any) => {
      const row = { id: `${prefix}-${saved.length + 1}`, ...entity };
      saved.push(row);
      return row;
    }),
  };
};

describe('seedIntegrations', () => {
  const originalKey = process.env.ENCRYPTION_KEY;
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = randomBytes(32).toString('base64');
  });
  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalKey;
  });

  const seed = async () => {
    const repos = {
      jiraConfig: fakeRepository('jc'),
      jiraQuery: fakeRepository('jq'),
      sonarConfig: fakeRepository('sc'),
      sonarQuery: fakeRepository('sq'),
      github: fakeRepository('gh'),
    };
    await seedIntegrations(repos as never);
    return repos;
  };

  it('creates one Jira config with every demo query attached to it', async () => {
    const { jiraConfig, jiraQuery } = await seed();

    expect(jiraConfig.saved).toHaveLength(1);
    expect(jiraQuery.saved.map((q) => q.name)).toEqual(
      DEMO_JIRA_QUERIES.map((q) => q.name),
    );
    for (const query of jiraQuery.saved) {
      expect(query.jiraConfigId).toBe(jiraConfig.saved[0].id);
      expect(query.isActive).toBe(true);
    }
  });

  it('creates one SonarCloud config with a query per demo project', async () => {
    const { sonarConfig, sonarQuery } = await seed();

    expect(sonarConfig.saved).toHaveLength(1);
    expect(sonarQuery.saved.map((q) => q.project)).toEqual(
      DEMO_SONAR_QUERIES.map((q) => q.project),
    );
    for (const query of sonarQuery.saved) {
      expect(query.sonarCloudConfigId).toBe(sonarConfig.saved[0].id);
      expect(query.metric).toEqual(['project_status', 'pull_request']);
    }
  });

  it('creates a GitHub config for every demo workflow', async () => {
    const { github } = await seed();

    expect(
      github.saved.map((c) => `${c.owner}/${c.repo}/${c.workflow}`),
    ).toEqual(
      DEMO_GITHUB_WORKFLOWS.map((w) => `${w.owner}/${w.repo}/${w.workflow}`),
    );
    expect(github.saved[0].inputsSchema.length).toBeGreaterThan(0);
  });

  it('stores only encrypted placeholder tokens, never a usable secret', async () => {
    const { jiraConfig, sonarConfig, github } = await seed();

    const tokens = [
      jiraConfig.saved[0].encryptedApiToken,
      sonarConfig.saved[0].encryptedApiToken,
      github.saved[0].encryptedPat,
    ];
    for (const token of tokens) {
      expect(token).toBeTruthy();
      expect(token).not.toBe('demo-placeholder-not-a-real-token');
      expect(decrypt(token)).toBe('demo-placeholder-not-a-real-token');
    }
  });
});
