import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DistributionSegment {
  label: string;
  count: number;
  color: string;
}

interface JiraDistributionBarProps {
  title: string;
  segments: DistributionSegment[];
}

export function JiraDistributionBar({
  title,
  segments,
}: JiraDistributionBarProps) {
  const total = segments.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>
      <div className="h-2 w-full flex rounded-full overflow-hidden bg-secondary">
        {total === 0 ? (
          <div className="h-full w-full bg-slate-200/50" />
        ) : (
          segments.map((segment, index) => {
            const percentage = (segment.count / total) * 100;
            if (percentage === 0) return null;

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`${segment.color} h-full transition-all hover:opacity-80 cursor-default`}
                    style={{ width: `${percentage}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="font-semibold">{segment.label}</span>
                    <span>
                      {segment.count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })
        )}
      </div>
      <div className="flex flex-wrap gap-3 mt-1 min-h-[16px]">
        {total === 0 ? (
          <span className="text-[10px] text-muted-foreground italic">
            No data available
          </span>
        ) : (
          segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${segment.color}`} />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {segment.label} ({segment.count})
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
