import type {
  JiraExecuteQueryResponse,
  JiraIssue,
  SonarCloudData,
  WorkflowInputSchema,
  WorkflowRun,
} from '@falcon-eye/common';

/**
 * Sample Jira, SonarCloud and GitHub data for the public demo. In demo mode the
 * integration services answer from here instead of calling those services, so the
 * dashboard has something to show and the server never fetches a stored URL.
 * The seed script inserts the same configs and queries, so names line up.
 *
 * Deterministic on purpose: same content every time, dates relative to `now`.
 */

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (now: Date, days: number, hour = 9) => {
  const d = new Date(now.getTime() - days * DAY);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
};

// ---------------------------------------------------------------- Jira

export const DEMO_JIRA_CONFIG = {
  instanceName: 'Northwind Jira',
  baseUrl: 'https://northwind.atlassian.net',
  email: 'qa-bot@northwind.example',
  projectKey: 'NW',
};

const PEOPLE = ['Priya Nair', 'Marcus Webb', 'Sofia Reyes', 'Tom Okafor'];

type IssueSpec = {
  key: string;
  summary: string;
  type: 'Bug' | 'Task' | 'Story';
  priority: 'Highest' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'In Review' | 'Ready for QA';
  assignee: string | null;
  age: number;
};

const CATEGORY = {
  'To Do': { id: 2, key: 'new', colorName: 'blue-gray', name: 'To Do' },
  'In Progress': {
    id: 4,
    key: 'indeterminate',
    colorName: 'yellow',
    name: 'In Progress',
  },
  'In Review': {
    id: 4,
    key: 'indeterminate',
    colorName: 'yellow',
    name: 'In Progress',
  },
  'Ready for QA': {
    id: 4,
    key: 'indeterminate',
    colorName: 'yellow',
    name: 'In Progress',
  },
} as const;

const PRIORITY_ID = { Highest: '1', High: '2', Medium: '3', Low: '4' } as const;
const TYPE_ID = { Bug: '10004', Task: '10002', Story: '10001' } as const;

const BASE = DEMO_JIRA_CONFIG.baseUrl;

const toIssue = (spec: IssueSpec, index: number, now: Date): JiraIssue => {
  const created = daysAgo(now, spec.age);
  return {
    expand: 'operations,versionedRepresentations',
    id: String(10000 + index),
    self: `${BASE}/rest/api/3/issue/${10000 + index}`,
    key: spec.key,
    fields: {
      summary: spec.summary,
      issuetype: {
        self: `${BASE}/rest/api/3/issuetype/${TYPE_ID[spec.type]}`,
        id: TYPE_ID[spec.type],
        description: spec.type,
        iconUrl: `${BASE}/rest/api/2/universal_avatar/view/type/issuetype/avatar/${TYPE_ID[spec.type]}`,
        name: spec.type,
        subtask: false,
        avatarId: Number(TYPE_ID[spec.type]),
        hierarchyLevel: 0,
      },
      created,
      updated: daysAgo(now, Math.max(spec.age - 1, 0), 15),
      assignee: spec.assignee
        ? {
            self: `${BASE}/rest/api/3/user?accountId=${spec.assignee}`,
            accountId: spec.assignee.toLowerCase().replace(/\s+/g, '-'),
            avatarUrls: {},
            displayName: spec.assignee,
            active: true,
            timeZone: 'Europe/London',
            accountType: 'atlassian',
          }
        : null,
      priority: {
        self: `${BASE}/rest/api/3/priority/${PRIORITY_ID[spec.priority]}`,
        iconUrl: '',
        name: spec.priority,
        id: PRIORITY_ID[spec.priority],
      },
      status: {
        self: `${BASE}/rest/api/3/status/${spec.status}`,
        description: '',
        iconUrl: '',
        name: spec.status,
        id: spec.status.toLowerCase().replace(/\s+/g, '-'),
        statusCategory: {
          self: `${BASE}/rest/api/3/statuscategory/${CATEGORY[spec.status].id}`,
          ...CATEGORY[spec.status],
        },
      },
    },
  };
};

const bug = (
  n: number,
  summary: string,
  priority: IssueSpec['priority'],
  status: IssueSpec['status'],
  assignee: number | null,
  age: number,
): IssueSpec => ({
  key: `NW-${n}`,
  summary,
  type: 'Bug',
  priority,
  status,
  assignee: assignee === null ? null : PEOPLE[assignee],
  age,
});

const DEMO_JIRA_ISSUES: Record<string, IssueSpec[]> = {
  'Open bugs': [
    bug(
      412,
      'Checkout: promo code applied twice on retry',
      'Highest',
      'In Progress',
      0,
      2,
    ),
    bug(
      418,
      'Basket total wrong when quantity edited quickly',
      'High',
      'In Review',
      1,
      4,
    ),
    bug(
      421,
      'Order confirmation email missing VAT line',
      'Medium',
      'To Do',
      2,
      6,
    ),
    bug(425, 'Search suggestions flash stale results', 'Low', 'To Do', null, 9),
    bug(
      431,
      'Mobile: address autocomplete covers Pay button',
      'High',
      'In Progress',
      3,
      3,
    ),
    bug(
      433,
      'Refund webhook retried after 200 response',
      'Highest',
      'In Review',
      0,
      1,
    ),
    bug(
      437,
      'Product images lazy-load out of order on Safari',
      'Low',
      'To Do',
      1,
      12,
    ),
    bug(
      440,
      'Saved cards list not refreshed after removal',
      'Medium',
      'In Progress',
      2,
      5,
    ),
    bug(
      444,
      'Stock count off by one after cancelled order',
      'High',
      'To Do',
      3,
      7,
    ),
    bug(
      448,
      'Wishlist share link expires immediately',
      'Medium',
      'To Do',
      null,
      10,
    ),
    bug(
      451,
      'Delivery slot picker ignores bank holidays',
      'Medium',
      'In Review',
      1,
      8,
    ),
    bug(
      455,
      'Admin export truncates long product names',
      'Low',
      'To Do',
      2,
      15,
    ),
  ],
  'Critical & blockers': [
    bug(
      412,
      'Checkout: promo code applied twice on retry',
      'Highest',
      'In Progress',
      0,
      2,
    ),
    bug(
      433,
      'Refund webhook retried after 200 response',
      'Highest',
      'In Review',
      0,
      1,
    ),
    bug(
      418,
      'Basket total wrong when quantity edited quickly',
      'High',
      'In Review',
      1,
      4,
    ),
    bug(
      431,
      'Mobile: address autocomplete covers Pay button',
      'High',
      'In Progress',
      3,
      3,
    ),
    bug(
      444,
      'Stock count off by one after cancelled order',
      'High',
      'To Do',
      3,
      7,
    ),
    bug(
      462,
      'Payment intent left pending after 3DS timeout',
      'High',
      'To Do',
      0,
      1,
    ),
  ],
  'Ready for QA': [
    bug(
      398,
      'Coupon field accepts trailing whitespace',
      'Medium',
      'Ready for QA',
      1,
      3,
    ),
    bug(
      401,
      'Currency symbol missing on order history',
      'Low',
      'Ready for QA',
      2,
      5,
    ),
    bug(405, 'Login rate limit message unclear', 'Low', 'Ready for QA', 3, 6),
    bug(
      409,
      'Invoice PDF cuts off the last line item',
      'Medium',
      'Ready for QA',
      0,
      4,
    ),
    bug(
      415,
      'Returns portal loses selected reason on back',
      'Medium',
      'Ready for QA',
      1,
      2,
    ),
    bug(
      419,
      'Postcode lookup fails for Northern Ireland',
      'High',
      'Ready for QA',
      2,
      2,
    ),
    bug(
      423,
      'Cart badge not cleared after checkout',
      'Low',
      'Ready for QA',
      3,
      1,
    ),
  ],
  'Flaky test tickets': [
    bug(
      371,
      'e2e: checkout spec flakes on slow CI runners',
      'Medium',
      'In Progress',
      1,
      11,
    ),
    bug(
      376,
      'e2e: search spec depends on seed ordering',
      'Low',
      'To Do',
      null,
      14,
    ),
    bug(
      380,
      'unit: date helper fails around DST change',
      'Medium',
      'In Review',
      2,
      9,
    ),
    bug(
      384,
      'e2e: mobile login spec times out on cold start',
      'High',
      'To Do',
      0,
      6,
    ),
    bug(
      388,
      'unit: currency rounding test uses real clock',
      'Low',
      'To Do',
      3,
      13,
    ),
  ],
};

export const DEMO_JIRA_QUERIES = [
  {
    name: 'Open bugs',
    jqlQuery: 'project = NW AND issuetype = Bug AND statusCategory != Done',
    description: 'Every open bug in the Northwind project',
  },
  {
    name: 'Critical & blockers',
    jqlQuery:
      'project = NW AND priority in (Highest, High) AND statusCategory != Done',
    description: 'High and highest priority work that is not done',
  },
  {
    name: 'Ready for QA',
    jqlQuery: 'project = NW AND status = "Ready for QA"',
    description: 'Fixes waiting for a tester',
  },
  {
    name: 'Flaky test tickets',
    jqlQuery: 'project = NW AND labels = flaky-test AND statusCategory != Done',
    description: 'Known unstable tests',
  },
];

export function demoJiraResult(
  queryName: string,
  now: Date = new Date(),
): JiraExecuteQueryResponse {
  const issues = (DEMO_JIRA_ISSUES[queryName] ?? []).map((spec, index) =>
    toIssue(spec, index, now),
  );
  return {
    issues,
    expand: 'names,schema',
    startAt: 0,
    maxResults: 50,
    total: issues.length,
  };
}

// ---------------------------------------------------------- SonarCloud

export const DEMO_SONAR_CONFIG = {
  instanceName: 'Northwind SonarCloud',
  baseUrl: 'https://sonarcloud.io',
};

type SonarSpec = {
  gate: 'OK' | 'ERROR';
  coverage: string;
  duplication: string;
  pullRequests: Array<{
    id: string;
    title: string;
    branch: string;
    author: string;
    gate: 'OK' | 'ERROR';
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    age: number;
  }>;
};

const DEMO_SONAR: Record<string, SonarSpec> = {
  'northwind_storefront-web': {
    gate: 'OK',
    coverage: '84.2',
    duplication: '2.1',
    pullRequests: [
      {
        id: '1502',
        title: 'Upgrade Next.js to 14.2 and fix image loader config',
        branch: 'chore/next-14-2',
        author: 'Priya Nair',
        gate: 'OK',
        bugs: 0,
        vulnerabilities: 0,
        codeSmells: 3,
        age: 2,
      },
      {
        id: '1498',
        title: 'Add promo banner component',
        branch: 'feat/promo-banner',
        author: 'Marcus Webb',
        gate: 'OK',
        bugs: 0,
        vulnerabilities: 0,
        codeSmells: 1,
        age: 4,
      },
      {
        id: '1491',
        title: 'Refactor basket reducer',
        branch: 'refactor/basket',
        author: 'Sofia Reyes',
        gate: 'ERROR',
        bugs: 1,
        vulnerabilities: 0,
        codeSmells: 6,
        age: 7,
      },
    ],
  },
  'northwind_payments-api': {
    gate: 'ERROR',
    coverage: '71.4',
    duplication: '4.8',
    pullRequests: [
      {
        id: '884',
        title: 'Handle 3DS timeout for pending intents',
        branch: 'fix/3ds-timeout',
        author: 'Tom Okafor',
        gate: 'ERROR',
        bugs: 2,
        vulnerabilities: 1,
        codeSmells: 5,
        age: 1,
      },
      {
        id: '879',
        title: 'Idempotency keys for refund webhook',
        branch: 'feat/refund-idempotency',
        author: 'Priya Nair',
        gate: 'OK',
        bugs: 0,
        vulnerabilities: 0,
        codeSmells: 2,
        age: 3,
      },
    ],
  },
  'northwind_order-fulfilment': {
    gate: 'OK',
    coverage: '88.9',
    duplication: '1.4',
    pullRequests: [
      {
        id: '311',
        title: 'Batch label printing',
        branch: 'feat/batch-labels',
        author: 'Marcus Webb',
        gate: 'OK',
        bugs: 0,
        vulnerabilities: 0,
        codeSmells: 0,
        age: 5,
      },
      {
        id: '306',
        title: 'Fix carrier rate cache invalidation',
        branch: 'fix/rate-cache',
        author: 'Sofia Reyes',
        gate: 'OK',
        bugs: 0,
        vulnerabilities: 0,
        codeSmells: 2,
        age: 8,
      },
    ],
  },
  'northwind_customer-mobile': {
    gate: 'OK',
    coverage: '79.6',
    duplication: '3.2',
    pullRequests: [
      {
        id: '652',
        title: 'Biometric login prompt',
        branch: 'feat/biometric-login',
        author: 'Tom Okafor',
        gate: 'OK',
        bugs: 0,
        vulnerabilities: 0,
        codeSmells: 4,
        age: 2,
      },
      {
        id: '647',
        title: 'Fix address autocomplete overlay',
        branch: 'fix/address-overlay',
        author: 'Priya Nair',
        gate: 'ERROR',
        bugs: 1,
        vulnerabilities: 0,
        codeSmells: 2,
        age: 3,
      },
    ],
  },
};

export const DEMO_SONAR_QUERIES = [
  { name: 'Storefront Web', project: 'northwind_storefront-web' },
  { name: 'Payments API', project: 'northwind_payments-api' },
  { name: 'Order Fulfilment', project: 'northwind_order-fulfilment' },
  { name: 'Customer Mobile App', project: 'northwind_customer-mobile' },
].map((query) => ({
  ...query,
  metric: ['project_status', 'pull_request'] as string[],
  description: `Quality gate and pull requests for ${query.name}`,
}));

export function demoSonarResult(
  project: string,
  metrics: string[],
  now: Date = new Date(),
): SonarCloudData {
  const spec = DEMO_SONAR[project];
  const result: SonarCloudData = {};
  if (!spec) return result;

  if (metrics.includes('project_status')) {
    result.project_status = {
      projectStatus: {
        status: spec.gate,
        conditions: [
          {
            status: Number(spec.coverage) >= 80 ? 'OK' : 'ERROR',
            metricKey: 'new_coverage',
            comparator: 'LT',
            errorThreshold: '80',
            actualValue: spec.coverage,
          },
          {
            status: Number(spec.duplication) <= 3 ? 'OK' : 'ERROR',
            metricKey: 'new_duplicated_lines_density',
            comparator: 'GT',
            errorThreshold: '3',
            actualValue: spec.duplication,
          },
        ],
        periods: [
          { index: 1, mode: 'PREVIOUS_VERSION', date: daysAgo(now, 14) },
        ],
      },
    };
  }

  if (metrics.includes('pull_request')) {
    result.pull_request = {
      pullRequests: spec.pullRequests.map((pr) => ({
        key: pr.branch,
        title: pr.title,
        branch: pr.branch,
        base: 'main',
        target: 'main',
        url: `https://github.com/northwind/${project.split('_')[1]}/pull/${pr.id}`,
        analysisDate: daysAgo(now, pr.age),
        pullRequestId: pr.id,
        status: {
          qualityGateStatus: pr.gate,
          bugs: pr.bugs,
          vulnerabilities: pr.vulnerabilities,
          codeSmells: pr.codeSmells,
        },
        commit: {
          sha: `${pr.id}a1b2c3d`.slice(0, 7),
          author: {
            name: pr.author,
            login: pr.author.toLowerCase().replace(/\s+/g, '.'),
            avatar: '',
          },
          date: daysAgo(now, pr.age),
          message: pr.title,
        },
      })),
    };
  }
  return result;
}

// -------------------------------------------------------------- GitHub

const RUN_INPUTS: WorkflowInputSchema[] = [
  {
    name: 'environment',
    type: 'select',
    required: true,
    defaultValue: 'staging',
    options: [
      { value: 'staging', label: 'Staging' },
      { value: 'production', label: 'Production' },
    ],
  },
  { name: 'tag', type: 'string', placeholder: '@smoke' },
];

export const DEMO_GITHUB_WORKFLOWS = [
  {
    owner: 'northwind',
    repo: 'storefront-web',
    workflow: 'e2e-nightly.yml',
    inputsSchema: RUN_INPUTS,
    defaultRef: 'main',
    outcomes: [
      'success',
      'success',
      'failure',
      'success',
      'success',
      'success',
      'failure',
      'success',
      'success',
      'success',
    ],
  },
  {
    owner: 'northwind',
    repo: 'payments-api',
    workflow: 'contract-tests.yml',
    inputsSchema: RUN_INPUTS,
    defaultRef: 'main',
    outcomes: [
      'failure',
      'success',
      'success',
      'success',
      'failure',
      'success',
      'success',
      'success',
      'success',
      'success',
    ],
  },
];

const RUN_ACTORS = ['priya-nair', 'marcus-webb', 'sofia-reyes', 'ci-bot'];

export function demoWorkflowRuns(
  owner: string,
  repo: string,
  workflow: string,
  now: Date = new Date(),
): { total_count: number; workflow_runs: WorkflowRun[] } {
  const spec = DEMO_GITHUB_WORKFLOWS.find(
    (w) => w.owner === owner && w.repo === repo && w.workflow === workflow,
  );
  if (!spec) return { total_count: 0, workflow_runs: [] };

  const base = spec.repo.length * 1_000_000;
  const workflow_runs = spec.outcomes.map((conclusion, index) => {
    const id = base + (spec.outcomes.length - index);
    const at = daysAgo(now, index, 2);
    return {
      id,
      run_number: 200 - index,
      status: 'completed',
      conclusion,
      created_at: at,
      updated_at: at,
      display_title: `${workflow.replace('.yml', '')} on ${spec.defaultRef}`,
      path: `.github/workflows/${workflow}`,
      actor: { login: RUN_ACTORS[index % RUN_ACTORS.length] },
      head_branch: spec.defaultRef,
      html_url: `https://github.com/${owner}/${repo}/actions/runs/${id}`,
    };
  });
  return { total_count: 187, workflow_runs };
}

export function demoWorkflowRun(
  owner: string,
  repo: string,
  workflow: string,
  runId: string,
  now: Date = new Date(),
): WorkflowRun | null {
  return (
    demoWorkflowRuns(owner, repo, workflow, now).workflow_runs.find(
      (run) => String(run.id) === runId,
    ) ?? null
  );
}
