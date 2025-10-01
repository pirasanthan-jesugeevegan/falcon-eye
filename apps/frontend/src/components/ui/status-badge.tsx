import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical' | 'passed' | 'failed' | 'skipped';
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  if (status === 'passed') {
    return (
      <Badge variant="success">
        <CheckCircle className="h-3 w-3 mr-1" />
        {children}
      </Badge>
    );
  }
  if (status === 'failed') {
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        {children}
      </Badge>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400':
            status === 'healthy',
          'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400':
            status === 'warning',
          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400':
            status === 'skipped',
          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400':
            status === 'critical',
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
