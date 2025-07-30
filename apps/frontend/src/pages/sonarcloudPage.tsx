import { useParams } from '@tanstack/react-router';

export function SonarcloudPage() {
  const { sonarCloudId } = useParams({
    from: '/sonarCloud/$sonarCloudId',
  });
  return <div>Hello &quot;/$sonarCloudId&quot;! {sonarCloudId}</div>;
}
