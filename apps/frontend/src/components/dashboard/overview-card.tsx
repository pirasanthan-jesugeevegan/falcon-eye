import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewCardProps {
  title: string;
  value: number;
  description?: string;
  icon?: React.ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

export function OverviewCard({
  title,
  value,
  description,
  icon,
  change,
}: OverviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || change) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {change && (
              <span
                className={`mr-1 ${
                  change.type === 'increase' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {change.type === 'increase' ? '↑' : '↓'}{' '}
                {Math.abs(change.value)}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
