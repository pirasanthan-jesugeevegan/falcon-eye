import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/pages/dashboardPage';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});
