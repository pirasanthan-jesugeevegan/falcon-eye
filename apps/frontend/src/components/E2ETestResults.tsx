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
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { dateFormat } from '@/lib/utils';
import { StatusBadge } from './ui/status-badge';

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
        <a
          href={row.original.reportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-xs text-muted-foreground"
        >
          <Calendar className="mr-1 h-3 w-3" />
          {dateFormat(row.getValue('timestamp'))}
        </a>
      ),
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }) => (
        <a
          href={row.original.reportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm"
        >
          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
          {row.getValue('duration')}
        </a>
      ),
    },
    {
      accessorKey: 'environment',
      header: 'Environment',
      cell: ({ row }) => (
        <a
          href={row.original.reportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm"
        >
          <Laptop className="mr-1 h-4 w-4 text-muted-foreground" />
          {row.getValue('environment')}
        </a>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return (
          <StatusBadge status={row.getValue('status')}>
            {row.getValue('status')}
          </StatusBadge>
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
                  <StatusBadge status={e2eTestResults[0].status}>
                    {e2eTestResults[0].status}
                  </StatusBadge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {dateFormat(e2eTestResults[0].timestamp)}
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
