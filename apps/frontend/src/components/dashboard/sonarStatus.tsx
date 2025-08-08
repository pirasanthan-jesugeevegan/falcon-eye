import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle, HelpCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Link } from '@tanstack/react-router';
import type { SonarCloudIssue } from '@/types';

export function SonarStatus({
  sonarCloudData,
}: {
  sonarCloudData: SonarCloudIssue | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Quality Gates Status</CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                SonarCloud quality gates ensure code meets quality standards. OK
                = passed, ERROR = failed.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sonarCloudData?.results?.map((project: any, index: number) => {
            // Try different possible data structures
            const status =
              project.project_status?.projectStatus?.status ||
              project.project_status?.status ||
              project.status ||
              'Unknown';

            const isOK = status === 'OK' || status === 'PASSED';

            // Find the corresponding query to get the ID for navigation
            const correspondingQuery = sonarCloudData?.queries?.find(
              query => query.name === project.queryName,
            );

            const rowContent = (
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-4 w-4 ${
                      isOK ? 'text-green-500' : 'text-red-500'
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {project.queryName}
                  </span>
                </div>
                <StatusBadge status={isOK ? 'healthy' : 'critical'}>
                  {status}
                </StatusBadge>
              </div>
            );

            return (
              <div key={index}>
                {correspondingQuery?.id ? (
                  <Link
                    to="/sonarcloud/$sonarCloudId"
                    params={{ sonarCloudId: correspondingQuery.id }}
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
          {(!sonarCloudData?.results ||
            sonarCloudData.results.length === 0) && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                No quality gates configured
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Set up SonarCloud queries to monitor code quality
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
