import type { ReactNode } from 'react';

interface ActivityItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  timestamp?: string;
}

export function ActivityItem({
  icon,
  title,
  description,
  timestamp,
}: ActivityItemProps) {
  return (
    <div className="flex items-start">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  );
}
