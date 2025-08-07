import { Link } from '@tanstack/react-router';
import { Dot } from 'lucide-react';
import type { FileRoutesByFullPath } from '../../routeTree.gen';
import { Separator } from '@/components/ui/separator';
import DynamicHeroIcon from '@/components/ui/dynamicIcon';
import * as HIcons from '@heroicons/react/24/solid';

interface SidebarItem {
  id: string;
  name: string;
  isActive?: boolean;
  icon?: string;
}

interface SidebarSectionProps {
  title: string;
  description: string;
  items: SidebarItem[];
  basePath: string;
  showActiveOnly?: boolean;
}

type RoutePath = keyof FileRoutesByFullPath & string;

export const SidebarSection = ({
  title,
  description,
  items,
  basePath,
}: SidebarSectionProps) => {
  return (
    <div className="pt-2">
      <Separator className="my-2" />
      <div className="px-3 text-sm font-medium text-foreground">{title}</div>
      <div className="px-3 mb-2 text-xs text-muted-foreground">
        {description}
      </div>

      {items.map(item => (
        <Link
          key={item.id}
          to={(basePath + '/' + item.id) as RoutePath}
          className="flex items-center px-3 py-3 mb-1 rounded-md text-sm transition-colors hover:bg-primary/20 hover:text-primary"
          activeProps={{
            className: 'bg-primary/20 text-primary',
          }}
        >
          {item.icon ? (
            <DynamicHeroIcon
              icon={item.icon as keyof typeof HIcons}
              className="mr-2 h-6 w-6"
            />
          ) : (
            <Dot />
          )}
          {item.name}
        </Link>
      ))}
    </div>
  );
};
