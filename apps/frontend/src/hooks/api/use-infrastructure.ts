import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiClient, handleApiError } from '@/lib/api-client';
import type { Infrastructure } from '@/types';
import { toast } from 'sonner';

// API functions
const infrastructureApi = {
  getAll: (): Promise<Infrastructure[]> => apiClient.get('/infrastructure'),

  getById: (id: string): Promise<Infrastructure> =>
    apiClient.get(`/infrastructure/${id}`),

  create: (infrastructure: Infrastructure): Promise<Infrastructure> =>
    apiClient.post('/infrastructure', infrastructure),

  update: (
    id: string,
    infrastructure: Partial<Infrastructure>,
  ): Promise<Infrastructure> =>
    apiClient.patch(`/infrastructure/${id}`, infrastructure),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/infrastructure/${id}`),
};

// Hooks
export const useInfrastructure = () => {
  return useQuery<Infrastructure[]>({
    queryKey: queryKeys.infrastructure.lists(),
    queryFn: infrastructureApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInfrastructureById = (id: string) =>
  useQuery<Infrastructure>({
    queryKey: queryKeys.infrastructure.detail(id),
    queryFn: () => infrastructureApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useCreateInfrastructure = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Infrastructure,
    Error,
    Omit<Infrastructure, 'id' | 'createdAt' | 'updatedAt'>
  >({
    mutationFn: infrastructureApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.infrastructure.lists(),
      });
      toast.success('Infrastructure dashboard created successfully');
    },
    onError: handleApiError,
  });
};

export const useUpdateInfrastructure = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Infrastructure,
    Error,
    { id: string; infrastructure: Partial<Infrastructure> }
  >({
    mutationFn: ({ id, infrastructure }) =>
      infrastructureApi.update(id, infrastructure),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.infrastructure.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.infrastructure.detail(variables.id),
      });
      toast.success('Infrastructure dashboard updated successfully');
    },
    onError: handleApiError,
  });
};

export const useDeleteInfrastructure = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: infrastructureApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.infrastructure.lists(),
      });
      toast.success('Infrastructure dashboard deleted successfully');
    },
    onError: handleApiError,
  });
};
