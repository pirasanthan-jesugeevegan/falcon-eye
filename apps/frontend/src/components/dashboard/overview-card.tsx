import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OverviewCardProps {
  title: string;
  value: number | string;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  borderColor?: string;
  iconColor?: string;
  className?: string;
}

export function OverviewCard({
  title,
  value,
  description,
  icon,
  change,
  borderColor = 'border-l-blue-500',
  iconColor = 'text-blue-500',
  className,
}: OverviewCardProps) {
  return (
    <Card className={cn(`border-l-4 ${borderColor}`, className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {(description || change) && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                {change && (
                  <span
                    className={`mr-1 ${
                      change.type === 'increase'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {change.type === 'increase' ? '↑' : '↓'}{' '}
                    {Math.abs(change.value)}%
                  </span>
                )}
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div className={cn('flex items-center justify-center', iconColor)}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
