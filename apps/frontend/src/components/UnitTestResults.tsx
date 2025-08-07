import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { UnitTestResult, CommitTestResult } from '@/types';
import { Clock, GitCommit, GitPullRequest, User } from 'lucide-react';
import { Progress } from './ui/progress';
import { dateFormat } from '@/lib/utils';

interface UnitTestResultsProps {
  unitTestResults: UnitTestResult[];
}

export default function UnitTestResults({
  unitTestResults,
}: UnitTestResultsProps) {
  // Define columns for commit test results
  const commitColumns: ColumnDef<CommitTestResult>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="font-mono text-xs">
            {dateFormat(row.getValue('date'))}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => (
        <div className="flex items-center">
          <User className="h-3 w-3 mr-1" />
          <div className="font-medium">{row.getValue('author')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'commit',
      header: 'Commit',
      cell: ({ row }) => (
        <div className="flex items-center">
          <GitCommit className="mr-2 h-4 w-4 text-muted-foreground" />
          <div className="font-medium">{row.getValue('commit')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'functionCoverage',
      header: 'Function Coverage',
      cell: ({ row }) => {
        const coverage = row.getValue('functionCoverage') as number;

        return (
          <div className="flex items-center space-x-2 w-24 sm:w-40">
            <Progress value={row.getValue('functionCoverage')} />
            <span className="text-xs font-medium">{coverage}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'lineCoverage',
      header: 'Line Coverage',
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2 w-24 sm:w-40">
            <Progress value={row.getValue('lineCoverage')} />
            <span className="text-xs font-medium">
              {row.getValue('lineCoverage')}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'statementCoverage',
      header: 'Statement Coverage',
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2 w-24 sm:w-40">
            <Progress value={row.getValue('statementCoverage')} />
            <span className="text-xs font-medium">
              {row.getValue('statementCoverage')}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'percentage',
      header: 'Overall Coverage',
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2 w-40">
            <Progress value={row.getValue('percentage')} />
            <span className="text-xs font-medium">
              {row.getValue('percentage')}%
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mb-6">
        {/* Overall Coverage Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-full">
                {/* Calculate the average coverage */}
                <Progress
                  value={Number(unitTestResults?.[0]?.result[0].percentage)}
                />
              </div>
              <div className="ml-4 text-xl sm:text-2xl font-bold">
                {Number(unitTestResults?.[0]?.result[0].percentage)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest PR Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latest PR</CardTitle>
          </CardHeader>
          <CardContent>
            {unitTestResults && unitTestResults.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <GitPullRequest className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="font-semibold text-sm truncate">
                    {unitTestResults[0].pull_request}
                  </span>
                </div>
                <div className="flex items-center">
                  <GitCommit className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="font-semibold text-sm truncate">
                    {unitTestResults[0]?.result[0].commit}
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="font-semibold text-sm truncate">
                    {unitTestResults[0]?.result[0].author}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="font-semibold text-sm">
                    {dateFormat(unitTestResults[0]?.result[0].date)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center py-1 text-muted-foreground">
                No pull requests found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {unitTestResults && unitTestResults.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Unit Tests by Pull Request</CardTitle>
            <CardDescription>
              Details of unit tests across pull requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {unitTestResults.map((unitTest, index) => (
                <AccordionItem value={`pr-${index}`} key={unitTest.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-4 gap-2">
                      <div className="flex items-center min-w-0">
                        <GitPullRequest className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="font-semibold text-sm sm:text-base">
                          {unitTest.id}
                        </span>
                        <span className="ml-2 text-xs sm:text-sm truncate">
                          {unitTest.pull_request}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate">
                            {unitTest.result[0].author}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={Number(unitTest.result[0].percentage)}
                            className={`w-16 sm:w-20`}
                          />
                          <span className="text-xs sm:text-sm">
                            {unitTest.result[0].percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4">
                      <div className="rounded-md border">
                        <div className="py-2 px-4 bg-muted">
                          <h3 className="text-sm font-semibold">Commits</h3>
                        </div>
                        <div className="p-4">
                          <DataTable
                            columns={commitColumns}
                            data={unitTest.result}
                            filterColumn="commit"
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No unit test results available for this product.
          </CardContent>
        </Card>
      )}
    </>
  );
}
