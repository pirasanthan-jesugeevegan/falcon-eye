export class JiraIssueResponseDto {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
      statusCategory: {
        key: string;
        name: string;
        colorName: string;
      };
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
      avatarUrls: Record<string, string>;
    };
    created: string;
    updated: string;
    priority?: {
      name: string;
      iconUrl: string;
    };
    issuetype: {
      name: string;
      iconUrl: string;
    };
  };
}

export class JiraSearchResponseDto {
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssueResponseDto[];
}

export class JiraErrorResponseDto {
  statusCode: number;
  message: string;
  error?: string;
}
