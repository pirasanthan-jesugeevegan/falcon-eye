import { useState, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlignJustify, LayoutDashboard, X } from 'lucide-react';
import { SidebarSection } from '@/components/ui/sidebar-section';
import { useJiraQueries, useProducts, useSonarCloudQueries } from '@/hooks/api';

export function Sidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { data: products = [], isLoading } = useProducts();
  const { data: jira = [], isLoading: isJiraLoading } = useJiraQueries();
  const { data: sonarCloud = [], isLoading: isSonarCloudLoading } =
    useSonarCloudQueries();

  useEffect(() => {
    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (
        isMobile &&
        isOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMobile, isOpen]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={toggleSidebar}
        >
          {isOpen ? <X /> : <AlignJustify />}
        </Button>
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={cn(
          'top-0 left-0 z-40 h-full w-64 bg-background transition-all duration-300 ease-in-out',
          isMobile ? 'fixed' : 'relative',
          isMobile
            ? isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : 'translate-x-0',
        )}
      >
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold mb-6 px-3">Falcon Eye</h1>
          {isLoading || isJiraLoading || isSonarCloudLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="space-y-1">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-primary/20 hover:text-primary"
                  activeProps={{
                    className: 'bg-primary/20 text-primary',
                  }}
                >
                  <LayoutDashboard />
                  Dashboard
                </Link>

                {/* Products */}
                {products.length > 0 && (
                  <SidebarSection
                    title="Products / Services"
                    description="List of products / services"
                    items={products
                      .filter(product => product.isActive === true)
                      .map(product => ({
                        id: product.id!.toString(),
                        name: product.productName,
                        icon: product.icon,
                      }))}
                    basePath="/products"
                  />
                )}

                {/* Jira Queries */}
                {jira.length > 0 &&
                  jira.filter(query => query.isActive).length > 0 && (
                    <SidebarSection
                      title="Jira"
                      description="List of Jira queries"
                      items={jira
                        .filter(query => query.isActive)
                        .map(query => ({
                          id: query.id!.toString(),
                          name: query.name,
                          isActive: query.isActive,
                        }))}
                      basePath="/jira"
                      showActiveOnly={true}
                    />
                  )}

                {/* SonarCloud Queries */}
                {sonarCloud.length > 0 &&
                  sonarCloud.filter(query => query.isActive).length > 0 && (
                    <SidebarSection
                      title="SonarCloud"
                      description="List of SonarCloud queries"
                      items={sonarCloud.map(query => ({
                        id: query.id!.toString(),
                        name: query.name,
                        isActive: query.isActive,
                      }))}
                      basePath="/sonarcloud"
                      showActiveOnly={true}
                    />
                  )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </>
  );
}
