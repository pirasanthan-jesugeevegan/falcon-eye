export interface JiraConfig {
  id?: string;
  instanceName: string;
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JiraQuery {
  id?: string;
  jiraConfigId: string;
  name: string;
  jqlQuery: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  jiraConfig?: JiraConfig;
}

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

export interface JiraAllIssuesResponse {
  results: JiraQueryResult[];
  queries: JiraQuery[];
}

export interface JiraResult {
  summary: string;
  status: string;
  assignee: string;
}
