import { useParams } from '@tanstack/react-router';

export function JiraPage() {
  const { jiraId } = useParams({ from: '/jira/$jiraId' });
  return <div>Hello &quot;/$jiraId&quot;! {jiraId}</div>;
}
