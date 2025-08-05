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
    branch_coverage: string;
    commit: string;
    date: string;
    function_coverage: string;
    line_coverage: string;
    percentage: string;
    statement_coverage: string;
  }[];
}

export interface CommitTestResult {
  id: string;
  author: string;
  branch_coverage: string;
  commit: string;
  date: string;
  function_coverage: string;
  line_coverage: string;
  percentage: string;
  statement_coverage: string;
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
