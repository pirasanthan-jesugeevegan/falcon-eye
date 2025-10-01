import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiClient, handleApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import type { GithubConfig, GithubConfigResponse } from '@/types';

// API functions
export const githubApi = {
  getConfig: (): Promise<GithubConfig[]> => apiClient.get('/github/config/'),

  createConfig: (config: GithubConfig): Promise<GithubConfig> =>
    apiClient.post('/github/config/', config),

  patchConfig: (
    id: string,
    config: Partial<GithubConfig>,
  ): Promise<GithubConfigResponse> =>
    apiClient.patch(`/github/config/${id}`, config),

  deleteConfig: (id: string): Promise<void> =>
    apiClient.delete(`/github/config/${id}`),

  // Workflow run endpoints
  getWorkflowRuns: (configId: string): Promise<any> =>
    apiClient.get(`/github/config/${configId}/runs`),

  getWorkflowRunStatus: (configId: string, runId: string): Promise<any> =>
    apiClient.get(`/github/config/${configId}/runs/${runId}`),

  triggerWorkflow: (configId: string, data: any): Promise<any> =>
    apiClient.post(`/github/config/${configId}/trigger`, data),
};

// Config Hooks
export const useGithubConfig = () => {
  return useQuery<GithubConfig[]>({
    queryKey: queryKeys.github.config(),
    queryFn: githubApi.getConfig,
    staleTime: 10 * 60 * 1000, // 10 minutes - config doesn't change often
  });
};

export const useCreateGithubConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: githubApi.createConfig,
    onSuccess: (data: GithubConfig) => {
      // Update the cache by adding the new config to the existing array
      queryClient.setQueryData<GithubConfig[]>(
        queryKeys.github.config(),
        oldData => {
          if (!oldData) return [data];
          return [data, ...oldData]; // Add new config at the beginning
        },
      );
      toast.success('Github configuration created successfully');
    },
    onError: handleApiError,
  });
};

export const usePatchGithubConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, query }: { id: string; query: Partial<GithubConfig> }) =>
      githubApi.patchConfig(id, query),
    onSuccess: (response: GithubConfigResponse) => {
      // Update the cache by replacing the updated config in the array
      queryClient.setQueryData<GithubConfig[]>(
        queryKeys.github.config(),
        oldData => {
          if (!oldData) return [response.config];
          return oldData.map(config =>
            config.id === response.config.id ? response.config : config,
          );
        },
      );
      toast.success('Github configuration updated successfully');
    },
    onError: handleApiError,
  });
};

export const useDeleteGithubConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: githubApi.deleteConfig,
    onSuccess: (_, deletedId) => {
      // Update the cache by removing the deleted config from the array
      queryClient.setQueryData<GithubConfig[]>(
        queryKeys.github.config(),
        oldData => {
          if (!oldData) return [];
          return oldData.filter(config => config.id !== deletedId);
        },
      );
      toast.success('Github config deleted successfully');
    },
    onError: handleApiError,
  });
};

// Workflow run hooks
export const useWorkflowRuns = (configId: string) => {
  return useQuery({
    queryKey: queryKeys.github.workflowRuns(configId),
    queryFn: () => githubApi.getWorkflowRuns(configId),
    enabled: !!configId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useWorkflowRunStatus = (
  configId: string,
  runId: string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: queryKeys.github.workflowRunStatus(configId, runId),
    queryFn: () => githubApi.getWorkflowRunStatus(configId, runId),
    enabled: enabled && !!configId && !!runId,
    refetchInterval: (queryInfo: any) => {
      const data = queryInfo?.state?.data;

      if (
        data?.run?.status === 'completed' ||
        data?.run?.status === 'failure' ||
        data?.run?.status === 'cancelled'
      ) {
        return false;
      }
      return 5000;
    },
    staleTime: 0, // Always fetch fresh data
  });
};

export const useTriggerWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ configId, data }: { configId: string; data: any }) =>
      githubApi.triggerWorkflow(configId, data),
    onSuccess: ({ configId }) => {
      // Invalidate workflow runs to refresh the list
      queryClient.invalidateQueries({
        queryKey: queryKeys.github.workflowRuns(configId),
      });

      // Also invalidate after a delay to ensure the new run is included
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.github.workflowRuns(configId),
        });
      }, 3000);

      toast.success('Workflow triggered successfully!');
    },
    onError: handleApiError,
  });
};
