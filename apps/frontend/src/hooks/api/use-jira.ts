import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiClient, handleApiError } from '@/lib/api-client';
import type { JiraConfig } from '@/types';
import { toast } from 'sonner';

// Define the JiraQuery type that was missing
export interface JiraQuery {
  id?: string;
  jiraConfigId: string; // Reference to the JiraConfig
  name: string;
  jqlQuery: string;
  description?: string;
  isActive: boolean;
}

// API functions
export const jiraApi = {
  getConfig: (): Promise<JiraConfig> => apiClient.get('/jira/config/'),

  updateConfig: (config: JiraConfig): Promise<JiraConfig> =>
    apiClient.post('/jira/config/', config),

  patchConfig: (id: string, config: Partial<JiraConfig>): Promise<JiraConfig> =>
    apiClient.patch(`/jira/config/${id}`, config),

  deleteConfig: (id: string): Promise<void> =>
    apiClient.delete(`/jira/config/${id}`),

  // Query endpoints
  getQueries: (): Promise<JiraQuery[]> => apiClient.get('/jira/query'),

  getQuery: (id: string): Promise<JiraQuery> =>
    apiClient.get(`/jira/query/${id}`),

  createQuery: (query: JiraQuery): Promise<JiraQuery> =>
    apiClient.post('/jira/query', query),

  updateQuery: (query: JiraQuery): Promise<JiraQuery> =>
    apiClient.put(`/jira/query/${query.id}`, query),

  patchQuery: (id: string, query: Partial<JiraQuery>): Promise<JiraQuery> =>
    apiClient.patch(`/jira/query/${id}`, query),

  deleteQuery: (id: string): Promise<void> =>
    apiClient.delete(`/jira/query/${id}`),

  getExecuteQuery: (id: string): Promise<{ issues: unknown[] }> =>
    apiClient.get(`/jira/query/${id}/execute`),
};

// Config Hooks
export const useJiraConfig = () => {
  return useQuery({
    queryKey: queryKeys.jira.config(),
    queryFn: jiraApi.getConfig,
    staleTime: 10 * 60 * 1000, // 10 minutes - config doesn't change often
  });
};

export const useUpdateJiraConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jiraApi.updateConfig,
    onSuccess: data => {
      // Update the config in cache
      queryClient.setQueryData(queryKeys.jira.config(), data);
      toast.success('Jira configuration updated successfully');
    },
    onError: handleApiError,
  });
};

export const usePatchJiraConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, query }: { id: string; query: Partial<JiraConfig> }) =>
      jiraApi.patchConfig(id, query),
    onSuccess: data => {
      // Update the config in cache
      queryClient.setQueryData(queryKeys.jira.config(), data);
      toast.success('Jira configuration updated successfully');
    },
    onError: handleApiError,
  });
};

export const useDeleteJiraConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jiraApi.deleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jira.config() });
      toast.success('JIRA config deleted successfully');
    },
    onError: handleApiError,
  });
};

// Query Hooks
export const useJiraQueries = () => {
  return useQuery({
    queryKey: queryKeys.jira.queries(),
    queryFn: jiraApi.getQueries,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useJiraQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.jira.query(id),
    queryFn: () => jiraApi.getQuery(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateJiraQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jiraApi.createQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jira.queries() });
      toast.success('JIRA query created successfully');
    },
    onError: handleApiError,
  });
};

export const useUpdateJiraQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jiraApi.updateQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jira.queries() });
      toast.success('JIRA query updated successfully');
    },
    onError: handleApiError,
  });
};

export const usePatchJiraQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, query }: { id: string; query: Partial<JiraQuery> }) =>
      jiraApi.patchQuery(id, query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jira.queries() });
      toast.success('JIRA query updated successfully');
    },
    onError: handleApiError,
  });
};

export const useDeleteJiraQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jiraApi.deleteQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jira.queries() });
      toast.success('JIRA query deleted successfully');
    },
    onError: handleApiError,
  });
};

export const useExecuteJiraQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.jira.executeQuery(id),
    queryFn: () => jiraApi.getExecuteQuery(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllJiraIssues = () => {
  return useQuery({
    queryKey: queryKeys.jira.all, // You can customize this key
    queryFn: async () => {
      const queries = await jiraApi.getQueries();

      const results = await Promise.all(
        queries.map(async query => {
          const result = await jiraApi.getExecuteQuery(query.id!);
          return {
            issues: result.issues,
            queryName: query.name,
          };
        }),
      );

      return { results: results.flat(), queries: queries };
    },
    staleTime: 5 * 60 * 1000, // optional: cache for 5 minutes
  });
};
