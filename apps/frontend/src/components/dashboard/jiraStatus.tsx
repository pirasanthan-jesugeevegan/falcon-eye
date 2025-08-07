import { ActivityItem } from '@/components/ui/activity-item';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import * as HIcons from '@heroicons/react/24/solid';
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
            {issues?.results?.map((query, i) => (
              <ActivityItem
                key={i}
                icon={<HIcons.BugAntIcon className="h-5 w-5" />}
                title={query.queryName}
                description={`Number of issues: ${query.issues.length}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
