import {
  DEMO_GITHUB_WORKFLOWS,
  DEMO_JIRA_QUERIES,
  DEMO_SONAR_QUERIES,
  demoJiraResult,
  demoSonarResult,
  demoWorkflowRun,
  demoWorkflowRuns,
} from './demo-integrations';

const NOW = new Date('2026-09-25T12:00:00.000Z');

describe('demo Jira data', () => {
  it('gives every seeded query issues, so no dashboard card is empty', () => {
    expect(DEMO_JIRA_QUERIES.length).toBeGreaterThanOrEqual(3);
    for (const query of DEMO_JIRA_QUERIES) {
      const result = demoJiraResult(query.name, NOW);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.total).toBe(result.issues.length);
    }
  });

  it('spans every priority the dashboard breaks issues down by', () => {
    const priorities = new Set(
      DEMO_JIRA_QUERIES.flatMap((query) =>
        demoJiraResult(query.name, NOW).issues.map(
          (issue) => issue.fields.priority.name,
        ),
      ),
    );
    expect([...priorities].sort()).toEqual(
      ['High', 'Highest', 'Low', 'Medium'].sort(),
    );
  });

  it('gives issues the fields the UI reads, dated in the past', () => {
    const [issue] = demoJiraResult(DEMO_JIRA_QUERIES[0].name, NOW).issues;
    expect(issue.key).toMatch(/^[A-Z]+-\d+$/);
    expect(issue.fields.summary).toBeTruthy();
    expect(issue.fields.status.name).toBeTruthy();
    expect(issue.fields.issuetype.name).toBeTruthy();
    expect(new Date(issue.fields.created).getTime()).toBeLessThan(
      NOW.getTime(),
    );
  });

  it('returns nothing for a query it does not know', () => {
    expect(demoJiraResult('no such query', NOW)).toMatchObject({
      issues: [],
      total: 0,
    });
  });

  it('is deterministic', () => {
    const name = DEMO_JIRA_QUERIES[0].name;
    expect(demoJiraResult(name, NOW)).toEqual(demoJiraResult(name, NOW));
  });
});

describe('demo SonarCloud data', () => {
  it('reports a quality gate and pull requests for every seeded query', () => {
    expect(DEMO_SONAR_QUERIES.length).toBeGreaterThanOrEqual(3);
    for (const query of DEMO_SONAR_QUERIES) {
      const result = demoSonarResult(query.project, query.metric, NOW);
      expect(['OK', 'ERROR']).toContain(
        result.project_status?.projectStatus?.status,
      );
      expect(result.pull_request?.pullRequests?.length).toBeGreaterThan(0);
    }
  });

  it('shows both a passing and a failing quality gate', () => {
    const statuses = DEMO_SONAR_QUERIES.map(
      (query) =>
        demoSonarResult(query.project, query.metric, NOW).project_status
          ?.projectStatus?.status,
    );
    expect(statuses).toContain('OK');
    expect(statuses).toContain('ERROR');
  });

  it('returns only the metrics the query asked for', () => {
    const result = demoSonarResult(
      DEMO_SONAR_QUERIES[0].project,
      ['project_status'],
      NOW,
    );
    expect(result).toHaveProperty('project_status');
    expect(result).not.toHaveProperty('pull_request');
  });
});

describe('demo GitHub workflow runs', () => {
  const [{ owner, repo, workflow }] = DEMO_GITHUB_WORKFLOWS;

  it('lists recent runs with a mix of outcomes', () => {
    const { workflow_runs, total_count } = demoWorkflowRuns(
      owner,
      repo,
      workflow,
      NOW,
    );
    expect(workflow_runs).toHaveLength(10);
    expect(total_count).toBeGreaterThanOrEqual(workflow_runs.length);
    const conclusions = new Set(workflow_runs.map((run) => run.conclusion));
    expect(conclusions).toContain('success');
    expect(conclusions).toContain('failure');
  });

  it('returns runs newest first, none in the future', () => {
    const { workflow_runs } = demoWorkflowRuns(owner, repo, workflow, NOW);
    const times = workflow_runs.map((run) =>
      new Date(run.created_at).getTime(),
    );
    expect(times).toEqual([...times].sort((a, b) => b - a));
    expect(times[0]).toBeLessThanOrEqual(NOW.getTime());
  });

  it('finds a single run by id, as a status poll would', () => {
    const [first] = demoWorkflowRuns(owner, repo, workflow, NOW).workflow_runs;
    expect(
      demoWorkflowRun(owner, repo, workflow, String(first.id), NOW),
    ).toEqual(first);
  });

  it('has no run for an unknown id', () => {
    expect(demoWorkflowRun(owner, repo, workflow, '1', NOW)).toBeNull();
  });
});
