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

export interface UnitTestResult {
  id: string;
  pullRequest: string;
  result: CommitTestResult[];
}

export interface E2ETestResult {
  id: string;
  name?: string;
  timestamp: string;
  status: 'passed' | 'failed' | 'skipped';
  pass: number;
  fail: number;
  skip: number;
  duration: string;
  reportUrl: string;
  tag: string;
  environment: string;
}
