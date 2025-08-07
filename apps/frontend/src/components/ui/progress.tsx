import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  // Determine color based on value
  const getColorClass = (val: number) => {
    if (val >= 80) return 'bg-green-500';
    if (val >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const colorClass = getColorClass(value || 0);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'bg-primary relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn('h-full w-full flex-1 transition-all', colorClass)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
