import type { JiraAllIssuesResponse, JiraIssue } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { HelpCircle, Info } from 'lucide-react';

export function JiraPriorityStatus({
  result,
}: {
  result: JiraAllIssuesResponse | undefined;
}) {
  // Calculate issue priority distribution
  const issuePriorityDistribution =
    result?.results?.reduce(
      (acc, result) => {
        result.issues?.forEach((issue: JiraIssue) => {
          const priority = issue.fields?.priority?.name || 'Unassigned';
          acc[priority] = (acc[priority] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    ) ?? {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">
            Jira Issue Priority Distribution
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Breakdown of Jira issues by priority level. High priority issues
                require immediate attention.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(issuePriorityDistribution)
            .sort((a, b) => {
              const priorityOrder = {
                Highest: 1,
                High: 2,
                Medium: 3,
                Low: 4,
              };
              return (
                priorityOrder[a[0] as keyof typeof priorityOrder] -
                priorityOrder[b[0] as keyof typeof priorityOrder]
              );
            })
            .map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      priority === 'Highest'
                        ? 'bg-red-600'
                        : priority === 'High'
                          ? 'bg-red-400'
                          : priority === 'Medium'
                            ? 'bg-yellow-500'
                            : priority === 'Low'
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                    }`}
                  />
                  <span className="text-sm font-medium">{priority}</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        {priority === 'Highest' &&
                          'Critical issues requiring immediate attention'}
                        {priority === 'High' &&
                          'High priority issues requiring prompt attention'}
                        {priority === 'Medium' &&
                          'Important issues that should be addressed soon'}
                        {priority === 'Low' &&
                          'Minor issues that can be addressed later'}
                        {priority === 'Unassigned' &&
                          'Issues without priority assignment'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-muted-foreground">
                  {count} issues
                </span>
              </div>
            ))}
          {Object.keys(issuePriorityDistribution).length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No issues found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure Jira queries to see issue distribution
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
