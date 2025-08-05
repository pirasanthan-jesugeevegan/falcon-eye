import { useParams } from '@tanstack/react-router';
import { useProduct, useTestResults } from '@/hooks/api';
import type { E2ETestResult } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductOverview from '@/components/ProductOverview';
import UnitTestResults from '@/components/UnitTestResults';
import E2ETestResults from '@/components/E2ETestResults';
import DynamicHeroIcon from '@/components/ui/dynamicIcon';
import * as HIcons from '@heroicons/react/24/solid';

// Calculate overall E2E test stats (helper function)
function calculateE2EStats(e2eTests: E2ETestResult[] | undefined) {
  if (!e2eTests || e2eTests.length === 0) {
    return { passed: 0, failed: 0, skipped: 0, total: 0 };
  }

  const passed = e2eTests.filter(test => test.status === 'passed').length;
  const failed = e2eTests.filter(test => test.status === 'failed').length;
  const total = e2eTests.length;

  return { passed, failed, total };
}

export function ProductsPage() {
  const { productId } = useParams({ from: '/products/$productId' });
  const {
    data: product,
    isLoading: productLoading,
    error,
  } = useProduct(productId);

  const {
    unitResults,
    e2eResults,
    isLoading: testResultsLoading,
  } = useTestResults(product?.productName || '');

  // Handling loading states
  if (productLoading || testResultsLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handling errors
  if (error || !product) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <p>
            {error
              ? typeof error === 'string'
                ? error
                : error.message
              : 'Product not found'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate E2E stats
  const e2eStats = calculateE2EStats(e2eResults.data);

  return (
    <div className="container mx-auto md:p-6 space-y-6">
      <div className="bg-purple-700 text-white p-4">
        <div className="flex items-center mb-2">
          {product.icon && (
            <DynamicHeroIcon
              icon={product.icon as keyof typeof HIcons}
              className="h-8 w-8 mr-2"
            />
          )}
          <h1 className="text-3xl font-bold">{product.productName}</h1>
        </div>
        <p className="text-white">Product details and quality metrics</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 md:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="unit-tests">Unit Tests</TabsTrigger>
          <TabsTrigger value="e2e-tests">E2E Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <ProductOverview product={product} e2eStats={e2eStats} />
        </TabsContent>
        <TabsContent value="unit-tests" className="mt-6 space-y-6">
          <UnitTestResults unitTestResults={unitResults.data || []} />
        </TabsContent>
        <TabsContent value="e2e-tests" className="mt-6 space-y-6">
          <E2ETestResults
            e2eTestResults={e2eResults.data || []}
            e2eStats={e2eStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
