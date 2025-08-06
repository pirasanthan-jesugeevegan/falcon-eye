import { CheckCircle2, Bug, ShieldAlert, Code2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';

interface SonarCloudPullRequestsTableProps {
  pullRequests: any[];
}

export function SonarCloudPullRequestsTable({
  pullRequests,
}: SonarCloudPullRequestsTableProps) {
  const prColumns: ColumnDef<(typeof pullRequests)[0]>[] = [
    {
      accessorKey: 'key',
      header: 'PR',
      cell: ({ row }) => (
        <a
          href={row.original.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          #{row.original.key} {row.original.title}
        </a>
      ),
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Avatar className="w-6 h-6">
            <AvatarImage
              src={
                row.original.commit.author.avatar
                  ? `https://www.gravatar.com/avatar/${row.original.commit.author.avatar}?d=identicon`
                  : undefined
              }
              alt={row.original.commit.author.name}
            />
            <AvatarFallback>
              {row.original.commit.author.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{row.original.commit.author.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status.qualityGateStatus === 'OK'
              ? 'outline'
              : 'destructive'
          }
        >
          {row.original.status.qualityGateStatus}
        </Badge>
      ),
    },
    {
      accessorKey: 'analysisDate',
      header: 'Analysis Date',
      cell: ({ row }) =>
        new Date(row.original.analysisDate).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      id: 'issues',
      header: 'Issues',
      cell: ({ row }) => {
        const { bugs, vulnerabilities, codeSmells } = row.original.status;
        const hasIssues = bugs + vulnerabilities + codeSmells > 0;

        return hasIssues ? (
          <div className="flex gap-2">
            {bugs > 0 && (
              <Badge variant="outline" className="bg-red-50">
                <Bug className="h-3 w-3 mr-1" /> {bugs}
              </Badge>
            )}
            {vulnerabilities > 0 && (
              <Badge variant="outline" className="bg-orange-50">
                <ShieldAlert className="h-3 w-3 mr-1" /> {vulnerabilities}
              </Badge>
            )}
            {codeSmells > 0 && (
              <Badge variant="outline" className="bg-yellow-50">
                <Code2 className="h-3 w-3 mr-1" /> {codeSmells}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-green-500 flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Clean
          </span>
        );
      },
    },
  ];

  if (pullRequests.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No pull requests found.
      </div>
    );
  }

  return (
    <DataTable columns={prColumns} data={pullRequests} filterColumn="branch" />
  );
}
