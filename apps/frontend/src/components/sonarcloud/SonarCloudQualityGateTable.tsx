import { Bug, Code2, Copy, ShieldAlert } from 'lucide-react';
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
    <TooltipProvider>
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
                // Get friendly metric name
                let metricName = '';
                let icon = null;

                switch (condition.metricKey) {
                  case 'new_reliability_rating':
                    metricName = 'Reliability Rating';
                    icon = <Bug className="h-4 w-4" />;
                    break;
                  case 'new_security_rating':
                    metricName = 'Security Rating';
                    icon = <ShieldAlert className="h-4 w-4" />;
                    break;
                  case 'new_maintainability_rating':
                    metricName = 'Maintainability Rating';
                    icon = <Code2 className="h-4 w-4" />;
                    break;
                  case 'new_duplicated_lines_density':
                    metricName = 'Duplicated Lines';
                    icon = <Copy className="h-4 w-4" />;
                    break;
                  case 'new_security_hotspots_reviewed':
                    metricName = 'Security Hotspots Reviewed';
                    icon = <ShieldAlert className="h-4 w-4" />;
                    break;
                  default:
                    metricName = condition.metricKey;
                }

                // For percentage-based metrics
                let progressValue = 0;
                let isRating = false;

                if (condition.metricKey === 'new_security_hotspots_reviewed') {
                  progressValue = parseFloat(condition.actualValue);
                } else if (
                  condition.metricKey === 'new_duplicated_lines_density'
                ) {
                  // Higher is worse for duplication
                  progressValue =
                    100 - Math.min(parseFloat(condition.actualValue), 100);
                } else if (condition.metricKey.includes('rating')) {
                  isRating = true;
                  // For ratings, 1 is best (A), 5 is worst (E)
                  progressValue =
                    100 - ((parseInt(condition.actualValue) - 1) / 4) * 100;
                }

                const ratingInfo = isRating
                  ? getRatingInfo(condition.actualValue)
                  : null;

                return (
                  <TableRow key={index}>
                    {/* Metric Name */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="text-muted-foreground">{icon}</div>
                        <span className="font-medium">{metricName}</span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        className="text-xs font-normal"
                        variant={
                          condition.status === 'OK' ? 'outline' : 'destructive'
                        }
                      >
                        {condition.status}
                      </Badge>
                    </TableCell>

                    {/* Actual Value */}
                    <TableCell>
                      {isRating ? (
                        <div className="flex items-center space-x-2">
                          <div
                            className={`${ratingInfo?.color} text-white font-medium w-6 h-6 flex items-center justify-center rounded`}
                          >
                            {ratingInfo?.text}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            (Score: {condition.actualValue})
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium">
                          {condition.metricKey ===
                            'new_duplicated_lines_density' ||
                          condition.metricKey ===
                            'new_security_hotspots_reviewed'
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
                        {isRating && condition.errorThreshold === '1'
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
                      {(condition.metricKey ===
                        'new_security_hotspots_reviewed' ||
                        condition.metricKey ===
                          'new_duplicated_lines_density' ||
                        isRating) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full">
                              <Progress
                                value={progressValue}
                                className="h-2 cursor-help"
                                style={{
                                  backgroundColor:
                                    condition.status === 'OK'
                                      ? 'bg-green-500 dark:bg-green-400'
                                      : condition.status === 'ERROR'
                                        ? 'bg-red-500 dark:bg-red-400'
                                        : 'bg-yellow-500 dark:bg-yellow-400',
                                }}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {condition.metricKey ===
                                'new_security_hotspots_reviewed' &&
                                `Security hotspots reviewed: ${parseFloat(condition.actualValue).toFixed(1)}%`}
                              {condition.metricKey ===
                                'new_duplicated_lines_density' &&
                                `Duplicated lines: ${parseFloat(condition.actualValue).toFixed(1)}% (threshold: ${condition.errorThreshold}%)`}
                              {isRating &&
                                `Rating: ${condition.actualValue} (${ratingInfo?.text}) - Target: ${condition.errorThreshold} (A)`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              },
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
