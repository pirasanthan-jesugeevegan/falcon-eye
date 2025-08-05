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
            {new Date(row.getValue('date')).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
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
      accessorKey: 'function_coverage',
      header: 'Function Coverage',
      cell: ({ row }) => {
        const coverage = row.getValue('function_coverage') as number;
        let coverageColor = 'bg-red-500';

        if (coverage >= 80) {
          coverageColor = 'bg-green-500';
        } else if (coverage >= 60) {
          coverageColor = 'bg-amber-500';
        }

        return (
          <div className="flex items-center space-x-2 w-40">
            <Progress value={coverage} className={coverageColor} />
            <span className="text-xs font-medium">{coverage}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'line_coverage',
      header: 'Line Coverage',
      cell: ({ row }) => {
        const coverage = row.getValue('line_coverage') as number;
        let coverageColor = 'bg-red-500';

        if (coverage >= 80) {
          coverageColor = 'bg-green-500';
        } else if (coverage >= 60) {
          coverageColor = 'bg-amber-500';
        }

        return (
          <div className="flex items-center space-x-2 w-40">
            <Progress value={coverage} className={coverageColor} />
            <span className="text-xs font-medium">{coverage}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'statement_coverage',
      header: 'Statement Coverage',
      cell: ({ row }) => {
        const coverage = row.getValue('statement_coverage') as number;
        let coverageColor = 'bg-red-500';

        if (coverage >= 80) {
          coverageColor = 'bg-green-500';
        } else if (coverage >= 60) {
          coverageColor = 'bg-amber-500';
        }

        return (
          <div className="flex items-center space-x-2 w-40">
            <Progress value={coverage} className={coverageColor} />
            <span className="text-xs font-medium">{coverage}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'percentage',
      header: 'Overall Coverage',
      cell: ({ row }) => {
        const percentage = row.getValue('percentage') as number;
        let color = 'bg-red-500';

        if (percentage >= 80) {
          color = 'bg-green-500';
        } else if (percentage >= 60) {
          color = 'bg-amber-500';
        }

        return (
          <div className="flex items-center space-x-2 w-40">
            <Progress value={percentage} className={color} />
            <span className="text-xs font-medium">{percentage}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 mb-6">
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
                  className={`h-4 ${
                    Number(unitTestResults?.[0]?.result[0].percentage) >= 80
                      ? 'bg-green-500'
                      : Number(unitTestResults?.[0]?.result[0].percentage) >= 60
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                />
              </div>
              <div className="ml-4 text-2xl font-bold">
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
              // Get the latest unit test result (by date)
              (console.log(unitTestResults),
              (
                <div>
                  <div className="flex items-center">
                    <GitPullRequest className="h-4 w-4 mr-2" />
                    <span className="font-semibold">
                      {unitTestResults[0].pull_request}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <GitCommit className="h-4 w-4 mr-2" />
                    <span className="font-semibold">
                      {unitTestResults[0]?.result[0].commit}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span className="font-semibold">
                      {unitTestResults[0]?.result[0].author}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-semibold">
                      {new Date(
                        unitTestResults[0]?.result[0].date,
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
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
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center">
                        <GitPullRequest className="h-4 w-4 mr-2" />
                        <span className="font-semibold">{unitTest.id}</span>
                        <span className="ml-2 text-sm truncate">
                          {unitTest.pull_request}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">
                            {unitTest.result[0].author}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Progress
                            value={Number(unitTest.result[0].percentage)}
                            className={`w-20 ${
                              Number(unitTest.result[0].percentage) >= 80
                                ? 'bg-green-500'
                                : Number(unitTest.result[0].percentage) >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                            }`}
                          />
                          <span>{unitTest.result[0].percentage}%</span>
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
