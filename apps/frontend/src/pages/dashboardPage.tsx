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
import {
  calculateAverageLineCoverage,
  calculateAverageUnitPassRate,
  summariseLatestE2E,
} from '@/lib/utils';

export function DashboardPage() {
  const {
    data: rawIssues,
    isLoading: issuesLoading,
    error: issuesError,
  } = useAllJiraIssues();

  const issues = rawIssues
    ? {
        ...rawIssues,
        queries: rawIssues.queries?.filter(q => q.isActive !== false),
        results: rawIssues.results?.filter(
          r =>
            rawIssues.queries?.find(q => q.name === r.queryName)?.isActive !==
            false,
        ),
      }
    : undefined;

  const {
    data: allProducts,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts();
  const products = allProducts?.filter(p => p.isActive !== false);

  const { data: rawSonarCloudData, isLoading: sonarCloudLoading } =
    useAllSonarCloudIssues();

  const sonarCloudData = rawSonarCloudData
    ? {
        ...rawSonarCloudData,
        queries: rawSonarCloudData.queries?.filter(q => q.isActive !== false),
        results: rawSonarCloudData.results?.filter(
          r =>
            rawSonarCloudData.queries?.find(q => q.name === r.queryName)
              ?.isActive !== false,
        ),
      }
    : undefined;

  // Integration queries that failed; the rest of the dashboard still renders.
  const failedQueries = [
    ...(rawIssues?.failedQueries ?? []).map(f => ({ ...f, source: 'Jira' })),
    ...(rawSonarCloudData?.failedQueries ?? []).map(f => ({
      ...f,
      source: 'SonarCloud',
    })),
  ];

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

  // Products whose most recent E2E run failed, out of products with any E2E run
  const { failing: failedE2EProducts, total: e2eProductCount } =
    summariseLatestE2E(allE2EResults.data ?? []);

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

        {failedQueries.length > 0 && (
          <div
            role="alert"
            className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm space-y-1"
          >
            <p className="font-medium">
              {failedQueries.length} integration{' '}
              {failedQueries.length === 1 ? 'query' : 'queries'} failed to load.
              Figures from them are missing below.
            </p>
            <ul className="list-disc pl-5">
              {failedQueries.map(f => (
                <li key={`${f.source}-${f.name}`}>
                  {f.source} &ldquo;{f.name}&rdquo;: {f.message}
                </li>
              ))}
            </ul>
          </div>
        )}

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
            title="Unit Test Pass Rate"
            value={`${Math.round(
              calculateAverageUnitPassRate(allUnitResults.data || []),
            )}%`}
            description={`Average latest unit test pass rate across ${new Set((allUnitResults.data || []).map(r => r.product?.id ?? r.id)).size} products`}
            icon={<HIcons.ChartBarIcon className="h-8 w-8" />}
            borderColor="border-l-green-500"
            iconColor="text-green-500"
          />
          <OverviewCard
            title="Failing E2E Products"
            value={failedE2EProducts}
            description={`Latest E2E run failed, of ${e2eProductCount} products with E2E results`}
            icon={<XCircle className="h-8 w-8" />}
            borderColor="border-l-red-500"
            iconColor="text-red-500"
          />
          <OverviewCard
            title="Code Coverage"
            value={`${Math.round(
              calculateAverageLineCoverage(allUnitResults.data || []),
            )}%`}
            description="Average latest line coverage across products"
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
