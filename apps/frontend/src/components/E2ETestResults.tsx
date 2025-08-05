import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { E2ETestResult } from '@/types';
import {
  CheckCircle,
  XCircle,
  Laptop,
  Calendar,
  PauseCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface E2ETestResultsProps {
  e2eTestResults: E2ETestResult[];
  e2eStats: {
    passed: number;
    failed: number;
    total: number;
  };
}

export default function E2ETestResults({
  e2eTestResults,
  e2eStats,
}: E2ETestResultsProps) {
  // Define columns for E2E tests table
  const e2eTestColumns: ColumnDef<E2ETestResult>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Date',
      cell: ({ row }) => (
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="mr-1 h-3 w-3" />
          {new Date(row.getValue('timestamp')).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      ),
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }) => (
        <div className="flex items-center text-sm">
          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
          {row.getValue('duration')}
        </div>
      ),
    },
    {
      accessorKey: 'environment',
      header: 'Environment',
      cell: ({ row }) => (
        <div className="flex items-center text-sm">
          <Laptop className="mr-1 h-4 w-4 text-muted-foreground" />
          {row.getValue('environment')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let statusIcon;
        let badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary' =
          'default';

        if (status === 'passed') {
          statusIcon = <CheckCircle className="h-4 w-4 mr-1" />;
          badgeVariant = 'default';
        } else if (status === 'failed') {
          statusIcon = <XCircle className="h-4 w-4 mr-1" />;
          badgeVariant = 'destructive';
        } else {
          statusIcon = <AlertCircle className="h-4 w-4 mr-1" />;
          badgeVariant = 'secondary';
        }

        return (
          <Badge
            variant={badgeVariant}
            className="capitalize flex items-center"
          >
            {statusIcon}
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'pass',
      header: 'Pass',
      cell: ({ row }) => (
        <div className="flex items-center text-sm">
          <CheckCircle className="mr-1 h-4 w-4 text-muted-foreground" />
          {row.getValue('pass')}
        </div>
      ),
    },
    {
      accessorKey: 'fail',
      header: 'Failed',
      cell: ({ row }) => (
        <div className="flex items-center text-sm">
          <XCircle className="mr-1 h-4 w-4 text-muted-foreground" />
          {row.getValue('fail')}
        </div>
      ),
    },
    {
      accessorKey: 'skip',
      header: 'Skipped',
      cell: ({ row }) => (
        <div className="flex items-center text-sm">
          <PauseCircle className="mr-1 h-4 w-4 text-muted-foreground" />
          {row.getValue('skip')}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6 justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">
                  {e2eStats.passed}
                </div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-500">
                  {e2eStats.failed}
                </div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{e2eStats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-full">
                <Progress
                  value={
                    e2eStats.total
                      ? Math.round((e2eStats.passed / e2eStats.total) * 100)
                      : 0
                  }
                  className={`h-4 ${
                    e2eStats.total && e2eStats.passed / e2eStats.total >= 0.8
                      ? 'bg-green-500'
                      : e2eStats.total &&
                          e2eStats.passed / e2eStats.total >= 0.6
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                />
              </div>
              <div className="ml-4 text-2xl font-bold">
                {e2eStats.total
                  ? Math.round((e2eStats.passed / e2eStats.total) * 100)
                  : 0}
                %
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latest Run</CardTitle>
          </CardHeader>
          <CardContent>
            {e2eTestResults && e2eTestResults.length > 0 ? (
              <div>
                <div className="text-sm font-medium">
                  {e2eTestResults[0].name}
                </div>
                <div className="mt-1 flex items-center">
                  <Badge
                    variant={
                      e2eTestResults[0].status === 'passed'
                        ? 'default'
                        : 'destructive'
                    }
                    className="capitalize flex items-center"
                  >
                    {e2eTestResults[0].status === 'passed' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {e2eTestResults[0].status}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(e2eTestResults[0].timestamp).toLocaleString(
                    'en-US',
                    {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    },
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center py-1 text-muted-foreground">
                No E2E test results.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {e2eTestResults && e2eTestResults.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>E2E Tests</CardTitle>
            <CardDescription>
              Detailed results of end-to-end tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={e2eTestColumns}
              data={e2eTestResults}
              filterColumn="status"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No E2E test results available for this product.
          </CardContent>
        </Card>
      )}
    </>
  );
}
