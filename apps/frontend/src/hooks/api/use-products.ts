import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, getInvalidationKeys } from '@/lib/query-keys';
import { apiClient, handleApiError } from '@/lib/api-client';
import type { Product } from '@/types';
import { toast } from 'sonner';

// API functions
const productsApi = {
  getAll: (): Promise<Product[]> => apiClient.get('/products'),

  getById: (id: string): Promise<Product> => apiClient.get(`/products/${id}`),

  create: (product: Product): Promise<{ product: Product }> =>
    apiClient.post('/products', product),

  update: (id: string, product: Partial<Product>): Promise<Product> =>
    apiClient.put(`/products/${id}`, product),

  delete: (id: string): Promise<void> => apiClient.delete(`/products/${id}`),
};

// Hooks
export const useProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.lists(),
    queryFn: productsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({
        queryKey: getInvalidationKeys.products(),
      });
      toast.success('Product created successfully');
    },
    onError: handleApiError,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<Product> }) =>
      productsApi.update(id, product),
    onSuccess: (data, variables) => {
      // Update the specific product in cache
      queryClient.setQueryData(queryKeys.products.detail(variables.id), data);
      // Invalidate products list
      queryClient.invalidateQueries({
        queryKey: getInvalidationKeys.products(),
      });
      toast.success('Product updated successfully');
    },
    onError: handleApiError,
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getInvalidationKeys.products(),
      });
      toast.success('Product deleted successfully');
    },
    onError: handleApiError,
  });
};
