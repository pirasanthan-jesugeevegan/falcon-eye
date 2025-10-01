// Query key factory for consistent and type-safe query keys
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  // Infrastructure
  infrastructure: {
    all: ['infrastructure'] as const,
    lists: () => [...queryKeys.infrastructure.all, 'list'] as const,
    details: () => [...queryKeys.infrastructure.all, 'detail'] as const,
    detail: (id: string) =>
      [...queryKeys.infrastructure.details(), id] as const,
  },

  // Test Results
  testResults: {
    all: ['testResults'] as const,
    unit: {
      all: () => [...queryKeys.testResults.all, 'unit'] as const,
      byProduct: (productName: string) =>
        [...queryKeys.testResults.unit.all(), productName] as const,
    },
    e2e: {
      all: () => [...queryKeys.testResults.all, 'e2e'] as const,
      byProduct: (productName: string) =>
        [...queryKeys.testResults.e2e.all(), productName] as const,
    },
  },

  // Jira Configuration
  jira: {
    all: ['jira'] as const,
    config: () => [...queryKeys.jira.all, 'config'] as const,
    queries: () => [...queryKeys.jira.all, 'queries'] as const,
    query: (id: string) => [...queryKeys.jira.queries(), id] as const,
    executeQuery: (id: string) =>
      [...queryKeys.jira.all, 'execute', id] as const,
  },

  // SonarCloud Configuration
  sonarCloud: {
    all: ['sonarCloud'] as const,
    config: () => [...queryKeys.sonarCloud.all, 'config'] as const,
    queries: () => [...queryKeys.sonarCloud.all, 'queries'] as const,
    query: (id: string) => [...queryKeys.sonarCloud.queries(), id] as const,
    executeQuery: (id: string) =>
      [...queryKeys.sonarCloud.all, 'execute', id] as const,
  },

  // GitHub Workflow
  github: {
    all: ['github'] as const,
    config: () => [...queryKeys.github.all, 'config'] as const,
    workflowRuns: (configId: string) =>
      [...queryKeys.github.all, 'workflowRuns', configId] as const,
    workflowRunStatus: (configId: string, runId: string) =>
      [...queryKeys.github.all, 'workflowRunStatus', configId, runId] as const,
  },
} as const;

// Helper function to invalidate related queries
export const getInvalidationKeys = {
  products: () => [queryKeys.products.all],
  infrastructure: () => [queryKeys.infrastructure.all],
  testResults: () => [queryKeys.testResults.all],
  jira: () => [queryKeys.jira.all],
  sonarCloud: () => [queryKeys.sonarCloud.all],
};
