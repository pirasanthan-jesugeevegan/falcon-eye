export interface Product {
  id?: string;
  productName: string;
  icon?: string;
  path?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  jiraResults?: JiraResult[];
  unitTestResults?: UnitTestResult[];
  e2eTestResults?: E2ETestResult[];
}

export interface JiraResult {
  summary: string;
  status: string;
  assignee: string;
}

export interface UnitTestResult {
  id: string;
  pull_request: string;
  result: {
    id: string;
    author: string;
    branchCoverage: string;
    commit: string;
    date: string;
    functionCoverage: string;
    lineCoverage: string;
    percentage: string;
    statementCoverage: string;
  }[];
}

export interface CommitTestResult {
  id: string;
  author: string;
  branchCoverage: string;
  commit: string;
  date: string;
  functionCoverage: string;
  lineCoverage: string;
  percentage: string;
  statementCoverage: string;
}

export interface E2ETestResult {
  id: string;
  name: string;
  timestamp: string;
  status: 'passed' | 'failed';
  pass: number;
  fail: number;
  skip: number;
  duration: string;
  report_url: string;
  tag: string;
  environment: string;
}

export interface ApiResponse {
  message?: string;
  [key: string]: unknown;
}

export interface JiraConfig {
  id?: string;
  instanceName: string;
  baseUrl: string;
  email: string;
  apiToken: string;
}

export interface SonarCloudConfig {
  id?: string;
  instanceName: string;
  baseUrl: string;
  apiToken: string;
}

export interface SonarCloudData {
  project_status?: {
    projectStatus?: {
      status?: string;
      conditions?: Array<{
        status: string;
        metricKey: string;
        comparator: string;
        errorThreshold: string;
        actualValue: string;
      }>;
      periods?: Array<{
        index: number;
        mode: string;
        date: string;
      }>;
    };
  };
  pull_request?: {
    pullRequests?: Array<{
      key: string;
      title: string;
      branch: string;
      base: string;
      target: string;
      url: string;
      analysisDate: string;
      pullRequestId: string;
      status: {
        qualityGateStatus: string;
        bugs: number;
        vulnerabilities: number;
        codeSmells: number;
      };
      commit: {
        sha: string;
        author: {
          name: string;
          login: string;
          avatar: string;
        };
        date: string;
        message: string;
      };
    }>;
  };
}

export interface SonarCloudQuery {
  id?: string;
  sonarCloudConfigId: string;
  name: string;
  metric: ('pull_request' | 'project_status')[];
  project: string;
  description?: string;
  isActive: boolean;
}

export interface SonarCloudIssue {
  results: {
    queryName: string;
    project: string;
    pull_request: unknown;
    project_status: unknown;
  }[];
  queries: SonarCloudQuery[];
}

// Add these new interfaces for Jira data

export interface JiraIssue {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: {
    summary: string;
    issuetype: {
      self: string;
      id: string;
      description: string;
      iconUrl: string;
      name: string;
      subtask: boolean;
      avatarId: number;
      hierarchyLevel: number;
    };
    created: string;
    assignee: {
      self: string;
      accountId: string;
      avatarUrls: Record<string, string>;
      displayName: string;
      active: boolean;
      timeZone: string;
      accountType: string;
      emailAddress?: string;
    } | null;
    priority: {
      self: string;
      iconUrl: string;
      name: string;
      id: string;
    };
    updated: string;
    status: {
      self: string;
      description: string;
      iconUrl: string;
      name: string;
      id: string;
      statusCategory: {
        self: string;
        id: number;
        key: string;
        colorName: string;
        name: string;
      };
    };
  };
}
export interface JiraExecuteQueryResponse {
  issues: JiraIssue[];
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
}

export interface JiraQueryResult {
  issues: JiraIssue[];
  queryName: string;
}

export interface JiraQuery {
  id: string;
  name: string;
  jqlQuery: string;
  description: string;
  jiraConfigId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jiraConfig: {
    id: string;
    instanceName: string;
    baseUrl: string;
    email: string;
    apiToken: string;
    projectKey: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface JiraAllIssuesResponse {
  results: JiraQueryResult[];
  queries: JiraQuery[];
}
