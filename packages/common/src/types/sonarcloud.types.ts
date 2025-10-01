export interface SonarCloudConfig {
  id?: string;
  instanceName: string;
  baseUrl: string;
  apiToken: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SonarCloudQuery {
  id?: string;
  sonarCloudConfigId: string;
  name: string;
  metric: ('pull_request' | 'project_status')[];
  project: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  sonarCloudConfig?: SonarCloudConfig;
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

export interface SonarCloudIssue {
  results: {
    queryName: string;
    project: string;
    pull_request: unknown;
    project_status: unknown;
  }[];
  queries: SonarCloudQuery[];
}
