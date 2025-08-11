import { OverviewCard } from '@/components/dashboard/overview-card';
import {
  useAllJiraIssues,
  useProducts,
  useAllSonarCloudIssues,
  useAllTestResults,
} from '@/hooks/api';
import * as HIcons from '@heroicons/react/24/solid';
import { XCircle, Activity } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SonarStatus } from '@/components/dashboard/sonarStatus';
import { ProductTestResultsStatus } from '@/components/dashboard/productTestResultsStatus';
import { JiraStatus } from '@/components/dashboard/jiraStatus';
import { JiraPriorityStatus } from '@/components/dashboard/JiraPriorityStatus';
import { calculateAverageTestCoverage } from '@/lib/utils';

export function DashboardPage() {
  const {
    data: issues,
    isLoading: issuesLoading,
    error: issuesError,
  } = useAllJiraIssues();

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts();

  const { data: sonarCloudData, isLoading: sonarCloudLoading } =
    useAllSonarCloudIssues();

  const {
    allUnitResults,
    allE2EResults,
    isLoading: testResultsLoading,
  } = useAllTestResults();

  // Calculate metrics
  const totalIssues =
    issues?.results?.reduce(
      (total, result) => total + (result.issues?.length || 0),
      0,
    ) ?? 0;

  // Calculate real failed E2E tests from E2E test results
  const failedE2ETests = (() => {
    if (!allE2EResults.data || allE2EResults.data.length === 0) return 0;

    return allE2EResults.data.filter(e2eResult => e2eResult.status === 'failed')
      .length;
  })();

  // Calculate total E2E tests for percentage
  const totalE2ETests = allE2EResults.data?.length ?? 0;
  const failedE2EPercentage =
    totalE2ETests > 0 ? (failedE2ETests / totalE2ETests) * 100 : 0;

  // Handling loading states
  if (
    issuesLoading ||
    productsLoading ||
    sonarCloudLoading ||
    testResultsLoading
  ) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handling errors
  if (issuesError || productsError) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <p>
            {issuesError
              ? typeof issuesError === 'string'
                ? issuesError
                : issuesError.message
              : productsError
                ? typeof productsError === 'string'
                  ? productsError
                  : productsError.message
                : 'Failed to load dashboard data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto md:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Overview</h1>
          <p className="text-muted-foreground">
            Welcome to the Falcon Eye. Monitor and manage quality metrics across
            all your products.
          </p>
        </div>

        {/* Enhanced Overview Cards with Real Data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            title="Open Issues"
            value={totalIssues}
            description="Total Jira issues across all queries"
            icon={<HIcons.BugAntIcon className="h-8 w-8" />}
            borderColor="border-l-blue-500"
            iconColor="text-blue-500"
          />
          <OverviewCard
            title="Test Coverage"
            value={Math.round(
              calculateAverageTestCoverage(allUnitResults.data || []),
            )}
            description={`Average unit test coverage across ${allUnitResults.data?.length || 0} products`}
            icon={<HIcons.ChartBarIcon className="h-8 w-8" />}
            borderColor="border-l-green-500"
            iconColor="text-green-500"
          />
          <OverviewCard
            title="Failed E2E Tests"
            value={failedE2ETests}
            description={`${failedE2EPercentage.toFixed(0)}% of ${totalE2ETests} total E2E tests`}
            change={{
              value: Number(failedE2EPercentage.toFixed(0)),
              type: failedE2EPercentage > 10 ? 'increase' : 'decrease',
            }}
            icon={<XCircle className="h-8 w-8" />}
            borderColor="border-l-red-500"
            iconColor="text-red-500"
          />
          <OverviewCard
            title="Recent Activity"
            value={products?.length ?? 0}
            description="Products with recent updates"
            icon={<Activity className="h-8 w-8" />}
            borderColor="border-l-yellow-500"
            iconColor="text-yellow-500"
          />
        </div>

        {/* Issue Priority Distribution with Help */}
        <div className="grid gap-4 md:grid-cols-2">
          <JiraPriorityStatus result={issues || undefined} />
          {/* Quality Gates Status with Help */}
          <SonarStatus sonarCloudData={sonarCloudData || undefined} />
        </div>

        {/* Existing Jira Status and Product Status with Help */}
        <div className="grid gap-4 md:grid-cols-2">
          <JiraStatus issues={issues || undefined} />
          <ProductTestResultsStatus products={products || []} />
        </div>
      </div>
    </TooltipProvider>
  );
}
