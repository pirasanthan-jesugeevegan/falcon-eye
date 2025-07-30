import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/layout/main-layout';
import NotFoundPage from '@/pages/404Page';

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster position="top-right" />
        <MainLayout>
          <Outlet />
        </MainLayout>
        <TanStackRouterDevtools />
      </TooltipProvider>
    </ThemeProvider>
  ),
  notFoundComponent: () => <NotFoundPage />,
});
