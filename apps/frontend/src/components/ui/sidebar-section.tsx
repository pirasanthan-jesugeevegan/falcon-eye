import { Link } from '@tanstack/react-router';
import { Dot } from 'lucide-react';
import type { FileRoutesByFullPath } from '../../routeTree.gen';
import { Separator } from '@/components/ui/separator';

interface SidebarItem {
  id: string;
  name: string;
  isActive?: boolean;
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
  showActiveOnly = false,
}: SidebarSectionProps) => {
  const filteredItems = showActiveOnly
    ? items.filter(item => item.isActive !== false)
    : items;

  if (filteredItems.length === 0) return null;

  return (
    <div className="pt-2">
      <Separator className="my-2" />
      <div className="px-3 text-sm font-medium text-foreground">{title}</div>
      <div className="px-3 mb-2 text-xs text-muted-foreground">
        {description}
      </div>

      {filteredItems.map(item => (
        <Link
          key={item.id}
          to={(basePath + '/' + item.id) as RoutePath}
          className="flex items-center px-3 py-2 rounded-md text-sm transition-colors hover:bg-primary/20 hover:text-primary"
          activeProps={{
            className: 'bg-primary/20 text-primary',
          }}
        >
          <Dot />
          {item.name}
        </Link>
      ))}
    </div>
  );
};
