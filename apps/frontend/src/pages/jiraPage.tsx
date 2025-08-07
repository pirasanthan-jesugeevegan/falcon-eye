import { useParams } from '@tanstack/react-router';
import { useExecuteJiraQuery, useJiraQuery } from '@/hooks/api';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMemo } from 'react';
import { Header } from '@/components/ui/headers';
import type { JiraIssue } from '@/types';

export function JiraPage() {
  const { jiraId } = useParams({ from: '/jira/$jiraId' });

  const { data, isLoading, error } = useExecuteJiraQuery(jiraId);
  const { data: queryData } = useJiraQuery(jiraId);
  console.log(data);

  // Update the reshaped data type to match the actual data structure
  const reshaped = useMemo(() => {
    if (!data?.issues) return [];
    return data.issues.map((item: JiraIssue) => ({
      id: item.id,
      key: item.key,
      summary: item.fields.summary,
      status: item.fields.status?.name || 'Unknown',
      assignee: item.fields.assignee?.displayName || 'Unassigned',
      created: item.fields.created,
      updated: item.fields.updated,
    }));
  }, [data]);

  // Handling loading states
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handling errors
  if (error || !data) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <p>
            {error
              ? typeof error === 'string'
                ? error
                : error.message
              : 'Jira query not found'}
          </p>
        </div>
      </div>
    );
  }

  // Update the column type definition to match the reshaped data
  const columns: ColumnDef<{
    id: string;
    key: string;
    summary: string;
    status: string;
    assignee: string;
    created: string;
    updated: string;
  }>[] = [
    {
      accessorKey: 'key',
      header: 'Jira Number',
      cell: ({ row }) => (
        <div className="flex items-center">{row.getValue('key')}</div>
      ),
    },
    {
      id: 'summary',
      header: 'Summary',
      accessorFn: row => row.summary,
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="font-medium">{row.getValue('summary')}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: row => row.status,
      cell: ({ row }) => (
        <div className="flex items-center">
          <Badge
            variant="default"
            className="capitalize flex items-center mr-auto h-fit w-fit"
          >
            {row.getValue('status')}
          </Badge>
        </div>
      ),
    },
    {
      id: 'assignee',
      header: 'Assignee',
      accessorFn: row => row.assignee,
      cell: ({ row }) => {
        const name: string = row.getValue('assignee');
        return (
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${name}&background=random`}
                    alt={name}
                  />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                {name}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
    {
      id: 'created',
      header: 'Created At',
      accessorFn: row => row.created,
      cell: ({ row }) => (
        <div className="flex items-center">
          {new Date(row.getValue('created')).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      ),
    },
    {
      id: 'updated',
      header: 'Last Updated',
      accessorFn: row => row.updated,
      cell: ({ row }) => (
        <div className="flex items-center">
          {new Date(row.getValue('updated')).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Header
        title={queryData?.name || ''}
        description={queryData?.description || ''}
        icon="jira"
      />
      <div className="container mx-auto p-6 space-y-6 bg-background">
        <DataTable columns={columns} data={reshaped} filterColumn="summary" />
      </div>
    </div>
  );
}
