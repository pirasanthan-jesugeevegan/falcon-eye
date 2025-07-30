import { createLazyFileRoute } from '@tanstack/react-router';
import { JiraPage } from '@/pages/jiraPage';

export const Route = createLazyFileRoute('/jira/$jiraId')({
  component: JiraPage,
});
