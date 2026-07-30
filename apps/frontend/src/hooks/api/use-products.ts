import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiClient, handleApiError } from '@/lib/api-client';
import type { Product } from '@/types';
import { toast } from 'sonner';

// API functions
const productsApi = {
  getAll: (): Promise<Product[]> => apiClient.get('/products'),

  getById: (id: string): Promise<Product> => apiClient.get(`/products/${id}`),

  create: (product: Product): Promise<Product> =>
    apiClient.post('/products', product),

  update: (id: string, product: Partial<Product>): Promise<Product> =>
    apiClient.patch(`/products/${id}`, product),

  delete: (id: string): Promise<void> => apiClient.delete(`/products/${id}`),
};

// Hooks
export const useProducts = () => {
  return useQuery<Product[]>({
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
    onSuccess: data => {
      // Add the new product to cache instead of refetching
      queryClient.setQueryData<Product[]>(
        queryKeys.products.lists(),
        oldData => {
          if (!oldData) return [data];
          return [...oldData, data];
        },
      );
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.testResults.all });
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
      // Update the product in the list cache instead of refetching
      queryClient.setQueryData<Product[]>(
        queryKeys.products.lists(),
        oldData => {
          if (!oldData) return [data];
          return oldData.map(product =>
            product.id === data.id ? data : product,
          );
        },
      );
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.testResults.all });
    },
    onError: handleApiError,
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.delete,
    onSuccess: (_, deletedId) => {
      // Remove the deleted product from cache instead of refetching
      queryClient.setQueryData<Product[]>(
        queryKeys.products.lists(),
        oldData => {
          if (!oldData) return [];
          return oldData.filter(product => product.id !== deletedId);
        },
      );
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.testResults.all });
    },
    onError: handleApiError,
  });
};
