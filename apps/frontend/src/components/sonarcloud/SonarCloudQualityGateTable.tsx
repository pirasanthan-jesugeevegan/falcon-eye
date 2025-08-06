import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { getRatingInfo } from '@/lib/utils';

// Helper function to convert metric keys to readable names
function getMetricDisplayName(metricKey: string): string {
  return metricKey
    .replace(/^new_/, '') // Remove 'new_' prefix
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (l: string) => l.toUpperCase()); // Capitalize each word
}

interface SonarCloudQualityGateTableProps {
  projectStatus: any;
  hasProjectStatus: boolean;
}

export function SonarCloudQualityGateTable({
  projectStatus,
  hasProjectStatus,
}: SonarCloudQualityGateTableProps) {
  if (!hasProjectStatus) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>No quality gate data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-primary/10">
          <TableRow>
            <TableHead className="w-[200px] font-medium">Metric</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Actual Value</TableHead>
            <TableHead className="font-medium">Threshold</TableHead>
            <TableHead className="w-1/4 font-medium">Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(projectStatus?.conditions || []).map(
            (condition: any, index: number) => {
              return (
                <TableRow key={index}>
                  {/* Metric Name */}
                  <TableCell>
                    <span className="font-medium">
                      {getMetricDisplayName(condition.metricKey)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      className="text-xs font-normal"
                      variant={
                        condition.status === 'OK' ? 'success' : 'destructive'
                      }
                    >
                      {condition.status}
                    </Badge>
                  </TableCell>

                  {/* Actual Value */}
                  <TableCell>
                    {condition.metricKey.includes('rating') ? (
                      <div className="flex items-center space-x-2">
                        <div
                          className={`${getRatingInfo(condition.actualValue)?.color} text-white font-medium w-6 h-6 flex items-center justify-center rounded`}
                        >
                          {getRatingInfo(condition.actualValue)?.text}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          (Score: {condition.actualValue})
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">
                        {condition.metricKey ===
                          'new_duplicated_lines_density' ||
                        condition.metricKey === 'new_security_hotspots_reviewed'
                          ? `${parseFloat(condition.actualValue).toFixed(1)}%`
                          : condition.actualValue}
                      </span>
                    )}
                  </TableCell>

                  {/* Threshold */}
                  <TableCell>
                    <span className="text-sm">
                      {condition.comparator === 'GT'
                        ? 'Should be ≤'
                        : 'Should be ≥'}{' '}
                      {condition.errorThreshold}
                      {condition.metricKey.includes('rating') &&
                      condition.errorThreshold === '1'
                        ? ' (A)'
                        : ''}
                      {(condition.metricKey ===
                        'new_duplicated_lines_density' ||
                        condition.metricKey ===
                          'new_security_hotspots_reviewed') &&
                        '%'}
                    </span>
                  </TableCell>

                  {/* Progress */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Progress
                            value={parseFloat(condition.actualValue)}
                            className="h-2"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {getMetricDisplayName(condition.metricKey)}:{' '}
                            {condition.actualValue}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
            },
          )}
        </TableBody>
      </Table>
    </div>
  );
}
