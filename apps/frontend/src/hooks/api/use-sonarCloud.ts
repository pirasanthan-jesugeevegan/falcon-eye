import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiClient, handleApiError } from '@/lib/api-client';
import type { SonarCloudConfig } from '@/types';
import { toast } from 'sonner';

// Define the SonarCloudQuery type that was missing
export interface SonarCloudQuery {
  id?: string;
  sonarCloudConfigId: string; // Reference to the SonarCloudConfig
  name: string;
  metric: ('pull_request' | 'project_status')[];
  project: string;
  description?: string;
  isActive: boolean;
}

// API functions
export const sonarCloudApi = {
  getConfig: (): Promise<SonarCloudConfig> =>
    apiClient.get('/sonarcloud/config/'),

  updateConfig: (config: SonarCloudConfig): Promise<SonarCloudConfig> =>
    apiClient.post('/sonarcloud/config/', config),

  patchConfig: (
    id: string,
    config: Partial<SonarCloudConfig>,
  ): Promise<SonarCloudConfig> =>
    apiClient.patch(`/sonarcloud/config/${id}`, config),

  deleteConfig: (id: string): Promise<void> =>
    apiClient.delete(`/sonarcloud/config/${id}`),

  // Query endpoints
  getQueries: (): Promise<SonarCloudQuery[]> =>
    apiClient.get('/sonarcloud/query'),

  getQuery: (id: string): Promise<SonarCloudQuery> =>
    apiClient.get(`/sonarcloud/query/${id}`),

  createQuery: (query: SonarCloudQuery): Promise<SonarCloudQuery> =>
    apiClient.post('/sonarcloud/query', query),

  updateQuery: (query: SonarCloudQuery): Promise<SonarCloudQuery> =>
    apiClient.put(`/sonarcloud/query/${query.id}`, query),

  patchQuery: (
    id: string,
    query: Partial<SonarCloudQuery>,
  ): Promise<SonarCloudQuery> =>
    apiClient.patch(`/sonarcloud/query/${id}`, query),

  deleteQuery: (id: string): Promise<void> =>
    apiClient.delete(`/sonarcloud/query/${id}`),

  getExecuteQuery: (
    id: string,
  ): Promise<{ project_status: unknown; pull_request: unknown }> =>
    apiClient.get(`/sonarcloud/query/${id}/execute`),
};

// Config Hooks
export const useSonarCloudConfig = () => {
  return useQuery({
    queryKey: queryKeys.sonarCloud.config(),
    queryFn: sonarCloudApi.getConfig,
    staleTime: 10 * 60 * 1000, // 10 minutes - config doesn't change often
  });
};

export const useUpdateSonarCloudConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sonarCloudApi.updateConfig,
    onSuccess: data => {
      // Update the config in cache
      queryClient.setQueryData(queryKeys.sonarCloud.config(), data);
      toast.success('SonarCloud configuration updated successfully');
    },
    onError: handleApiError,
  });
};

export const usePatchSonarCloudConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      query,
    }: {
      id: string;
      query: Partial<SonarCloudConfig>;
    }) => sonarCloudApi.patchConfig(id, query),
    onSuccess: data => {
      // Update the config in cache
      queryClient.setQueryData(queryKeys.sonarCloud.config(), data);
      toast.success('SonarCloud configuration updated successfully');
    },
    onError: handleApiError,
  });
};

export const useDeleteSonarCloudConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sonarCloudApi.deleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sonarCloud.config(),
      });
      toast.success('SonarCloud config deleted successfully');
    },
    onError: handleApiError,
  });
};

// Query Hooks
export const useSonarCloudQueries = () => {
  return useQuery({
    queryKey: queryKeys.sonarCloud.queries(),
    queryFn: sonarCloudApi.getQueries,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSonarCloudQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.sonarCloud.query(id),
    queryFn: () => sonarCloudApi.getQuery(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateSonarCloudQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sonarCloudApi.createQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sonarCloud.queries(),
      });
      toast.success('SonarCloud query created successfully');
    },
    onError: handleApiError,
  });
};

export const useUpdateSonarCloudQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sonarCloudApi.updateQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sonarCloud.queries(),
      });
      toast.success('SonarCloud query updated successfully');
    },
    onError: handleApiError,
  });
};

export const usePatchSonarCloudQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      query,
    }: {
      id: string;
      query: Partial<SonarCloudQuery>;
    }) => sonarCloudApi.patchQuery(id, query),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sonarCloud.queries(),
      });
      toast.success('SonarCloud query updated successfully');
    },
    onError: handleApiError,
  });
};

export const useDeleteSonarCloudQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sonarCloudApi.deleteQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sonarCloud.queries(),
      });
      toast.success('SonarCloud query deleted successfully');
    },
    onError: handleApiError,
  });
};

export const useExecuteSonarCloudQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.sonarCloud.executeQuery(id),
    queryFn: () => sonarCloudApi.getExecuteQuery(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllSonarCloudIssues = () => {
  return useQuery({
    queryKey: queryKeys.sonarCloud.all, // You can customize this key
    queryFn: async () => {
      const queries = await sonarCloudApi.getQueries();

      const results = await Promise.all(
        queries.map(async query => {
          const result = await sonarCloudApi.getExecuteQuery(query.id!);
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
