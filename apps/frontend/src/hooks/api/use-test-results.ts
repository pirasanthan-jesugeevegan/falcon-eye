import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiClient } from '@/lib/api-client';
import type { UnitTestResult, E2ETestResult } from '@/types';

// API functions
const testResultsApi = {
  getUnitResults: (productName: string): Promise<UnitTestResult[]> =>
    apiClient.get(`/unit-results?productName=${productName}`),

  getE2EResults: (productName: string): Promise<E2ETestResult[]> =>
    apiClient.get(`/e2e-results?productName=${productName}`),
};

// Hooks
export const useUnitTestResults = (productName: string) => {
  return useQuery({
    queryKey: queryKeys.testResults.unit.byProduct(productName),
    queryFn: () => testResultsApi.getUnitResults(productName),
    enabled: !!productName,
    staleTime: 2 * 60 * 1000, // 2 minutes - test results change frequently
  });
};

export const useE2ETestResults = (productName: string) => {
  return useQuery({
    queryKey: queryKeys.testResults.e2e.byProduct(productName),
    queryFn: () => testResultsApi.getE2EResults(productName),
    enabled: !!productName,
    staleTime: 2 * 60 * 1000, // 2 minutes - test results change frequently
  });
};

// Combined hook for both test types
export const useTestResults = (productName: string) => {
  const unitResults = useUnitTestResults(productName);
  const e2eResults = useE2ETestResults(productName);

  return {
    unitResults,
    e2eResults,
    isLoading: unitResults.isLoading || e2eResults.isLoading,
    isError: unitResults.isError || e2eResults.isError,
    error: unitResults.error || e2eResults.error,
  };
};
