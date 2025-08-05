import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { CheckCircle, XCircle, GitPullRequest } from 'lucide-react';
import type { Product } from '@/types';

interface ProductOverviewProps {
  product: Product;
  e2eStats: { failed: number; passed: number; total: number };
}

export default function ProductOverview({
  product,
  e2eStats,
}: ProductOverviewProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product.jiraResults?.filter(issue => issue.status === 'Open')
                .length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Issues that need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" />
              <path d="M8 12h8" />
              <path d="m12 16 4-4-4-4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product.jiraResults?.filter(
                issue => issue.status === 'In Progress',
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Issues being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Coverage</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="m9 11-6 6v3h9l3-3" />
              <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product.unitTestResults?.[0]?.result?.[0]?.percentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average code coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E2E Tests</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {e2eStats.passed}/{e2eStats.total}
            </div>
            <p className="text-xs text-muted-foreground">Passing E2E tests</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Details about this product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="text-muted-foreground">Product ID</div>
                <div className="font-medium">{product.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="text-muted-foreground">Created At</div>
                <div className="font-medium">
                  {new Date(product.created_at!).toLocaleDateString()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="text-muted-foreground">Updated At</div>
                <div className="font-medium">
                  {new Date(product.updated_at!).toLocaleDateString()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="text-muted-foreground">Path</div>
                <div className="font-medium">{product.productName}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Activities</CardTitle>
            <CardDescription>Recent events for this product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {product.unitTestResults &&
                product.unitTestResults.length > 0 && (
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <GitPullRequest className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New Pull Request</p>
                      <p className="text-xs text-muted-foreground">
                        {product.unitTestResults[0].pull_request}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          product.unitTestResults[0].result[0].date,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

              {product.e2eTestResults && product.e2eTestResults.length > 0 && (
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    {product.e2eTestResults[0].status === 'passed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      E2E Test{' '}
                      {product.e2eTestResults[0].status === 'passed'
                        ? 'Passed'
                        : 'Failed'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.e2eTestResults[0].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        product.e2eTestResults[0].timestamp,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
