import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams } from '@tanstack/react-router';
import { useExecuteSonarCloudQuery } from '@/hooks/api';
import type { SonarCloudData } from '@/types';
import { dateFormat } from '@/lib/utils';
import {
  SonarCloudOverviewCards,
  SonarCloudQualityGateTable,
  SonarCloudPullRequestsTable,
} from '@/components/sonarcloud';
import { Header } from '@/components/ui/headers';

export function SonarcloudPage() {
  const { sonarCloudId } = useParams({
    from: '/sonarCloud/$sonarCloudId',
  });
  const { data, isLoading } = useExecuteSonarCloudQuery(sonarCloudId);

  // Handling loading states
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Safety check for data structure
  const sonarData: SonarCloudData = data as SonarCloudData;
  const projectStatus = sonarData.project_status?.projectStatus;
  const pullRequests = sonarData.pull_request?.pullRequests || [];

  // Handle missing project status data
  const hasProjectStatus = Boolean(
    projectStatus &&
      projectStatus.conditions &&
      projectStatus.conditions.length > 0,
  );

  // Count metrics for summary only if project status data exists
  const countIssues = hasProjectStatus
    ? {
        errors: (projectStatus?.conditions || []).filter(
          c => c.status === 'ERROR',
        ).length,
        ok: (projectStatus?.conditions || []).filter(c => c.status === 'OK')
          .length,
        total: (projectStatus?.conditions || []).length,
      }
    : { errors: 0, ok: 0, total: 0 };

  // Count PRs by status
  const prCountsByStatus = {
    ok: pullRequests.filter(pr => pr.status.qualityGateStatus === 'OK').length,
    error: pullRequests.filter(pr => pr.status.qualityGateStatus === 'ERROR')
      .length,
    total: pullRequests.length,
  };

  // Find security hotspots review value if it exists
  const securityHotspotsReviewed = hasProjectStatus
    ? projectStatus?.conditions?.find(
        c => c.metricKey === 'new_security_hotspots_reviewed',
      )?.actualValue
    : undefined;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Header
        title="SonarCloud Analysis"
        description="Project quality status and metrics from SonarCloud."
        icon="sonarcloud"
      />

      <SonarCloudOverviewCards
        hasProjectStatus={hasProjectStatus}
        projectStatus={projectStatus}
        countIssues={countIssues}
        prCountsByStatus={prCountsByStatus}
        securityHotspotsReviewed={securityHotspotsReviewed}
      />

      <Tabs defaultValue={hasProjectStatus ? 'quality-gate' : 'pull-requests'}>
        <TabsList>
          <TabsTrigger value="quality-gate" disabled={!hasProjectStatus}>
            Quality Gate
          </TabsTrigger>
          <TabsTrigger value="pull-requests">Pull Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="quality-gate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Gate Conditions</CardTitle>
              <CardDescription>
                Detailed metrics from the latest analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <SonarCloudQualityGateTable
                  projectStatus={projectStatus}
                  hasProjectStatus={hasProjectStatus}
                />

                {projectStatus?.periods && projectStatus.periods.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-4">
                    <p>
                      Analysis date: {dateFormat(projectStatus.periods[0].date)}
                    </p>
                    <p>Compared to: {projectStatus.periods[0].mode}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pull-requests">
          <Card>
            <CardHeader>
              <CardTitle>Recent Pull Requests</CardTitle>
              <CardDescription>
                SonarCloud analysis of recent pull requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SonarCloudPullRequestsTable pullRequests={pullRequests} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
