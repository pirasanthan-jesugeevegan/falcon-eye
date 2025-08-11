import { createLazyFileRoute } from '@tanstack/react-router';
import { WorkflowTrigger } from '@/pages/GithubWorkflowPage';

export const Route = createLazyFileRoute('/githubWorkflow')({
  component: WorkflowTrigger,
});
