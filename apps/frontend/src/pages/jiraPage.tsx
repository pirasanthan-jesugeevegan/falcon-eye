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
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { BarChart3 } from 'lucide-react';
import { JiraDistributionBar } from '@/components/dashboard/jira-distribution-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function JiraPage() {
  const { jiraId } = useParams({ from: '/jira/$jiraId' });

  const { data, isLoading, error } = useExecuteJiraQuery(jiraId);
  const { data: queryData } = useJiraQuery(jiraId);

  // Update the reshaped data type to match the actual data structure
  const reshaped = useMemo(() => {
    if (!data?.issues) return [];
    return data.issues.map((item: JiraIssue) => ({
      id: item.id,
      key: item.key,
      summary: item.fields.summary,
      status: item.fields.status?.name || 'Unknown',
      assignee: item.fields.assignee?.displayName || 'Unassigned',
      issueType: item.fields.issuetype?.name || 'Unknown',
      priority: item.fields.priority?.name || 'Unknown',
      created: item.fields.created,
      updated: item.fields.updated,
    }));
  }, [data]);

  // Extract unique statuses and assignees for faceted filters
  const statusOptions = useMemo(() => {
    const statuses = new Set(reshaped.map(item => item.status));
    return Array.from(statuses).map(status => ({
      label: status,
      value: status,
    }));
  }, [reshaped]);

  const assigneeOptions = useMemo(() => {
    const assignees = new Set(reshaped.map(item => item.assignee));
    return Array.from(assignees).map(assignee => ({
      label: assignee,
      value: assignee,
    }));
  }, [reshaped]);

  const issueTypeOptions = useMemo(() => {
    const types = new Set(reshaped.map(item => item.issueType));
    return Array.from(types).map(type => ({
      label: type,
      value: type,
    }));
  }, [reshaped]);

  const priorityOptions = useMemo(() => {
    const priorities = new Set(reshaped.map(item => item.priority));
    return Array.from(priorities).map(priority => ({
      label: priority,
      value: priority,
    }));
  }, [reshaped]);

  // Calculate summary metrics
  const stats = useMemo(() => {
    // Calculate Distribution data
    const statusSegments = [
      {
        label: 'Resolved',
        count: reshaped.filter(i =>
          ['Done', 'Closed', 'Resolved'].includes(i.status),
        ).length,
        color: 'bg-green-500',
      },
      {
        label: 'In Progress',
        count: reshaped.filter(i =>
          ['In Progress', 'In Review', 'In Testing'].includes(i.status),
        ).length,
        color: 'bg-blue-500',
      },
      {
        label: 'To Do',
        count: reshaped.filter(
          i =>
            ![
              'Done',
              'Closed',
              'Resolved',
              'In Progress',
              'In Review',
              'In Testing',
            ].includes(i.status),
        ).length,
        color: 'bg-slate-400',
      },
    ].filter(s => s.count > 0);

    const prioritySegments = [
      {
        label: 'Highest',
        count: reshaped.filter(i => i.priority === 'Highest').length,
        color: 'bg-red-700',
      },
      {
        label: 'High',
        count: reshaped.filter(i => i.priority === 'High').length,
        color: 'bg-red-500',
      },
      {
        label: 'Medium',
        count: reshaped.filter(i => i.priority === 'Medium').length,
        color: 'bg-yellow-500',
      },
      {
        label: 'Low',
        count: reshaped.filter(i => i.priority === 'Low').length,
        color: 'bg-green-500',
      },
      {
        label: 'Lowest/Other',
        count: reshaped.filter(
          i => !['Highest', 'High', 'Medium', 'Low'].includes(i.priority),
        ).length,
        color: 'bg-slate-400',
      },
    ].filter(s => s.count > 0);

    const typeSegments = [
      {
        label: 'Bug',
        count: reshaped.filter(i => i.issueType === 'Bug').length,
        color: 'bg-red-500',
      },
      {
        label: 'Task',
        count: reshaped.filter(i => i.issueType === 'Task').length,
        color: 'bg-blue-500',
      },
      {
        label: 'Story',
        count: reshaped.filter(i => i.issueType === 'Story').length,
        color: 'bg-green-500',
      },
      {
        label: 'Other',
        count: reshaped.filter(
          i => !['Bug', 'Task', 'Story'].includes(i.issueType),
        ).length,
        color: 'bg-slate-400',
      },
    ].filter(s => s.count > 0);

    const assigneeSegments = Array.from(new Set(reshaped.map(i => i.assignee)))
      .map(name => ({
        label: name,
        count: reshaped.filter(i => i.assignee === name).length,
        color: name === 'Unassigned' ? 'bg-slate-400' : 'bg-indigo-500',
      }))
      .sort((a, b) => b.count - a.count);

    return {
      statusSegments,
      prioritySegments,
      typeSegments,
      assigneeSegments,
    };
  }, [reshaped]);

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
    issueType: string;
    priority: string;
    created: string;
    updated: string;
  }>[] = [
    {
      accessorKey: 'key',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Jira Number" />
      ),
      cell: ({ row }) => (
        <a
          href={`${queryData?.jiraConfig?.baseUrl}/browse/${row.getValue('key')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline font-mono"
        >
          {row.getValue('key')}
        </a>
      ),
    },
    {
      id: 'summary',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Summary" />
      ),
      accessorFn: row => row.summary,
      cell: ({ row }) => (
        <div className="flex items-center max-w-[500px]">
          <a
            href={`${queryData?.jiraConfig?.baseUrl}/browse/${row.getValue('key')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-medium truncate"
            title={row.getValue('summary')}
          >
            {row.getValue('summary')}
          </a>
        </div>
      ),
    },
    {
      id: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      accessorFn: row => row.status,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      cell: ({ row }) => (
        <div className="flex items-center">
          <Badge
            variant="outline"
            className="capitalize flex items-center mr-auto h-fit w-fit px-2 py-0"
          >
            {row.getValue('status')}
          </Badge>
        </div>
      ),
    },
    {
      id: 'issueType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      accessorFn: row => row.issueType,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      cell: ({ row }) => (
        <Badge variant="secondary" className="px-2 py-0 text-[10px]">
          {row.getValue('issueType')}
        </Badge>
      ),
    },
    {
      id: 'priority',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      accessorFn: row => row.priority,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      cell: ({ row }) => {
        const priority = row.getValue('priority') as string;
        let colorClass = 'text-muted-foreground';
        if (priority === 'Highest' || priority === 'High')
          colorClass = 'text-red-500 font-bold';
        if (priority === 'Medium') colorClass = 'text-yellow-600';

        return <span className={`text-xs ${colorClass}`}>{priority}</span>;
      },
    },
    {
      id: 'assignee',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assignee" />
      ),
      accessorFn: row => row.assignee,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      cell: ({ row }) => {
        const name: string = row.getValue('assignee');
        return (
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${name}&background=random`}
                      alt={name}
                    />
                    <AvatarFallback className="text-[10px]">
                      {name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs truncate max-w-[120px]">{name}</span>
                </div>
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      accessorFn: row => row.created,
      cell: ({ row }) => (
        <div className="flex items-center text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue('created')).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
    },
    {
      id: 'updated',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Updated" />
      ),
      accessorFn: row => row.updated,
      cell: ({ row }) => (
        <div className="flex items-center text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue('updated')).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <Header
        title={queryData?.name || ''}
        description={queryData?.description || ''}
        icon="jira"
      />

      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Issue Distributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reshaped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-3 text-center">
              <div className="rounded-full bg-secondary p-3 mb-4">
                <BarChart3 className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                No issues found
              </h3>
              <p className="text-xs text-muted-foreground/60 max-w-[200px] mt-1">
                This query didn&apos;t return any results to display.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <JiraDistributionBar
                title="Priority"
                segments={stats.prioritySegments}
              />
              <JiraDistributionBar
                title="Status"
                segments={stats.statusSegments}
              />
              <JiraDistributionBar
                title="Issue Type"
                segments={stats.typeSegments}
              />
              <JiraDistributionBar
                title="Workload"
                segments={stats.assigneeSegments}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
        <DataTable
          columns={columns}
          data={reshaped}
          filterColumn="summary"
          facetedFilters={[
            {
              columnId: 'status',
              title: 'Status',
              options: statusOptions,
            },
            {
              columnId: 'assignee',
              title: 'Assignee',
              options: assigneeOptions,
            },
            {
              columnId: 'issueType',
              title: 'Issue Type',
              options: issueTypeOptions,
            },
            {
              columnId: 'priority',
              title: 'Priority',
              options: priorityOptions,
            },
          ]}
        />
      </div>
    </div>
  );
}
