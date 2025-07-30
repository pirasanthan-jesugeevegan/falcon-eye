import { createLazyFileRoute } from '@tanstack/react-router';
import { SonarcloudPage } from '@/pages/sonarcloudPage';

export const Route = createLazyFileRoute('/sonarCloud/$sonarCloudId')({
  component: SonarcloudPage,
});
