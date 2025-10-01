import { createLazyFileRoute } from '@tanstack/react-router';
import { InfraPage } from '@/pages/infraPage';

export const Route = createLazyFileRoute('/infra/$infraId')({
  component: InfraPage,
});
