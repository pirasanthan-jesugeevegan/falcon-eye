// Product-related types
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
  pullRequest: string;
  result: CommitTestResult[];
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
  reportUrl: string;
  tag: string;
  environment: string;
}
