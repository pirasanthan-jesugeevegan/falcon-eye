import {
  AlertCircle,
  CheckCircle2,
  GitPullRequest,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { OverviewCard } from '@/components/dashboard/overview-card';

interface SonarCloudOverviewCardsProps {
  hasProjectStatus: boolean;
  projectStatus: any;
  countIssues: { errors: number; total: number };
  prCountsByStatus: { ok: number; error: number; total: number };
  securityHotspotsReviewed?: string;
}

export function SonarCloudOverviewCards({
  hasProjectStatus,
  projectStatus,
  countIssues,
  prCountsByStatus,
  securityHotspotsReviewed,
}: SonarCloudOverviewCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <OverviewCard
        title="Quality Gate Status"
        value={!hasProjectStatus ? 0 : projectStatus?.status ? 1 : 0}
        icon={
          !hasProjectStatus ? (
            <HelpCircle className="text-gray-400" />
          ) : projectStatus?.status === 'ERROR' ? (
            <AlertCircle className="text-red-500" />
          ) : (
            <CheckCircle2 className="text-green-500" />
          )
        }
      />
      <OverviewCard
        title="Failing Conditions"
        value={hasProjectStatus ? countIssues.errors : 0}
        description={
          hasProjectStatus
            ? `of ${countIssues.total} conditions`
            : 'No quality gate data'
        }
        icon={
          <AlertCircle
            className={hasProjectStatus ? 'text-red-500' : 'text-gray-400'}
          />
        }
      />
      <OverviewCard
        title="Pull Requests"
        value={prCountsByStatus.total}
        description="recent PRs analyzed"
        icon={<GitPullRequest />}
      />
      <OverviewCard
        title="Security Review Status"
        value={securityHotspotsReviewed ? Number(securityHotspotsReviewed) : 0}
        description="hotspots reviewed"
        icon={
          <ShieldAlert
            className={securityHotspotsReviewed ? '' : 'text-gray-400'}
          />
        }
      />
    </div>
  );
}
