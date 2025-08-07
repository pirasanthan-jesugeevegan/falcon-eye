import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  GitPullRequest,
  Clock,
  TrendingUp,
  TestTube,
  Play,
} from 'lucide-react';
import type { Product, UnitTestResult, E2ETestResult } from '@/types';
import { dateFormat } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import LatestUnitTestResults from './LatestUnitTestResults';
import LatestE2EtestResults from './LatestE2EtestResults';
import ProductInfo from './ProductInfo';
import TestSummary from './TestSummary';

interface ProductOverviewProps {
  product: Product;
  unitTestResults?: UnitTestResult[];
  e2eTestResults?: E2ETestResult[];
}

export default function ProductOverview({
  product,
  unitTestResults = [],
  e2eTestResults = [],
}: ProductOverviewProps) {
  // Get latest unit test results - first item in the array
  const latestUnitTest = unitTestResults?.[0];
  const latestE2ETest = e2eTestResults?.[0];

  // Calculate unit test coverage from the latest result
  const unitTestCoverage = latestUnitTest?.result?.[0]?.percentage
    ? parseFloat(latestUnitTest.result[0].percentage)
    : 0;

  // Calculate E2E success rate from the actual E2E test results
  const totalE2ETests = e2eTestResults.length;
  const passedE2ETests = e2eTestResults.filter(
    test => test.status === 'passed',
  ).length;
  const e2eSuccessRate =
    totalE2ETests > 0 ? Math.round((passedE2ETests / totalE2ETests) * 100) : 0;

  // Calculate overall test success rate (unit coverage + E2E success rate)
  const overallTestSuccess = Math.round(
    (unitTestCoverage + e2eSuccessRate) / 2,
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Latest Unit Test Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unit Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unitTestCoverage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Latest coverage</p>
            {latestUnitTest && (
              <div className="mt-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {dateFormat(latestUnitTest.result[0].date)}
                </div>
                <div className="flex items-center mt-1">
                  <GitPullRequest className="h-3 w-3 mr-1" />
                  {latestUnitTest.pullRequest || 'N/A'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest E2E Test Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E2E Tests</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {passedE2ETests}/{totalE2ETests}
            </div>
            <p className="text-xs text-muted-foreground">
              {e2eSuccessRate}% success rate
            </p>
            {latestE2ETest && (
              <div className="mt-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {dateFormat(latestE2ETest.timestamp)}
                </div>
                <div className="flex items-center mt-1">
                  {latestE2ETest.status === 'passed' ? (
                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1 text-red-600" />
                  )}
                  {latestE2ETest.tag}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overall Test Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallTestSuccess}%</div>
            <p className="text-xs text-muted-foreground">
              Combined success rate
            </p>
            <div className="mt-2">
              <Badge
                variant={
                  unitTestCoverage >= 80 && e2eSuccessRate >= 80
                    ? 'default'
                    : unitTestCoverage >= 60 && e2eSuccessRate >= 60
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {unitTestCoverage >= 80 && e2eSuccessRate >= 80
                  ? 'Excellent'
                  : unitTestCoverage >= 60 && e2eSuccessRate >= 60
                    ? 'Good'
                    : 'Needs Attention'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Latest Test Run */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestE2ETest
                ? dateFormat(latestE2ETest.timestamp).split(' ')[0]
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Last test execution</p>
            {latestE2ETest && (
              <div className="mt-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <span>Duration: {latestE2ETest.duration}</span>
                </div>
                <div className="flex items-center mt-1">
                  <span>Environment: {latestE2ETest.environment}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Latest Unit Test Details */}
        <LatestUnitTestResults latestUnitTest={latestUnitTest} />
        {/* Latest E2E Test Details */}
        <LatestE2EtestResults latestE2ETest={latestE2ETest} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Product Information */}
        <ProductInfo product={product} />
        {/* Test Summary */}
        <TestSummary
          unitTestCoverage={unitTestCoverage}
          e2eSuccessRate={e2eSuccessRate}
        />
      </div>
    </>
  );
}
