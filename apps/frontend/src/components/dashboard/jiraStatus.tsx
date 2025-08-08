import { ActivityItem } from '@/components/ui/activity-item';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import * as HIcons from '@heroicons/react/24/solid';
import { Link } from '@tanstack/react-router';
import type { JiraAllIssuesResponse } from '@/types';

export function JiraStatus({
  issues,
}: {
  issues: JiraAllIssuesResponse | undefined;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold">Jira Status</h2>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              Shows active Jira queries and the number of issues found by each
              query.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
        <div className="p-6">
          <div className="space-y-4">
            {issues?.results?.map((query, i) => {
              // Find the corresponding query to get the ID for navigation
              const correspondingQuery = issues?.queries?.find(
                q => q.name === query.queryName,
              );

              const rowContent = (
                <div className="hover:bg-muted/50 transition-colors rounded-lg p-2 cursor-pointer">
                  <ActivityItem
                    icon={<HIcons.BugAntIcon className="h-5 w-5" />}
                    title={query.queryName}
                    description={`Number of issues: ${query.issues.length}`}
                  />
                </div>
              );

              return (
                <div key={i}>
                  {correspondingQuery?.id ? (
                    <Link
                      to="/jira/$jiraId"
                      params={{ jiraId: correspondingQuery.id }}
                      className="block"
                    >
                      {rowContent}
                    </Link>
                  ) : (
                    rowContent
                  )}
                </div>
              );
            })}
            {issues?.results?.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No issues found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure Jira queries to see issue distribution
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
