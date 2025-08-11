import { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useGithubConfig,
  useTriggerWorkflow,
  useWorkflowRuns,
  useWorkflowRunStatus,
  type GithubConfig,
} from '@/hooks/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Play,
  GitBranch,
  Activity,
  TrendingUp,
  AlertTriangle,
  Settings,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import type { WorkflowInputSchema, WorkflowRun } from '@/types';
import { OverviewCard } from '@/components/dashboard/overview-card';

// Status badge for workflow runs
const StatusBadge = ({
  status,
  conclusion,
}: {
  status: string;
  conclusion?: string | null;
}) => {
  let color = 'bg-gray-400';
  let Icon = Clock;
  let text = status.replace('_', ' ');

  if (status === 'completed') {
    if (conclusion === 'success') {
      color = 'bg-green-500';
      Icon = CheckCircle2;
      text = 'Success';
    } else if (conclusion === 'failure') {
      color = 'bg-red-500';
      Icon = XCircle;
      text = 'Failed';
    } else {
      color = 'bg-yellow-500';
      Icon = AlertCircle;
      text = 'Completed';
    }
  } else if (status === 'in_progress') {
    color = 'bg-blue-500';
    Icon = Loader2;
    text = 'In Progress';
  } else if (status === 'queued' || status === 'waiting') {
    color = 'bg-yellow-500';
    Icon = AlertCircle;
    text = 'Queued';
  } else if (status === 'cancelled') {
    color = 'bg-gray-500';
    Icon = XCircle;
    text = 'Cancelled';
  }

  return (
    <Badge variant="outline" className={`${color} text-white border-0`}>
      <Icon className="mr-1 h-3 w-3" />
      {text}
    </Badge>
  );
};

// Overview stats component
const WorkflowStats = ({ runs }: { runs: WorkflowRun[] }) => {
  const totalRuns = runs.length;
  const successfulRuns = runs.filter(
    run => run.status === 'completed' && run.conclusion === 'success',
  ).length;
  const failedRuns = runs.filter(
    run => run.status === 'completed' && run.conclusion === 'failure',
  ).length;
  const inProgressRuns = runs.filter(
    run => run.status === 'in_progress' || run.status === 'queued',
  ).length;
  const successRate =
    totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <OverviewCard
        title="Total Runs"
        value={totalRuns}
        icon={<Activity className="h-8 w-8" />}
        borderColor="border-l-blue-500"
        iconColor="text-blue-500"
      />
      <OverviewCard
        title="Success Rate"
        value={`${successRate}%`}
        icon={<TrendingUp className="h-8 w-8" />}
        borderColor="border-l-green-500"
        iconColor="text-green-500"
      />
      <OverviewCard
        title="In Progress"
        value={inProgressRuns}
        icon={<Loader2 className="h-8 w-8 animate-spin" />}
        borderColor="border-l-yellow-500"
        iconColor="text-yellow-500"
      />
      <OverviewCard
        title="Failed"
        value={failedRuns}
        icon={<AlertTriangle className="h-8 w-8" />}
        borderColor="border-l-red-500"
        iconColor="text-red-500"
      />
    </div>
  );
};

// Dynamic form generation based on inputsSchema
const generateFormSchema = (inputsSchema: WorkflowInputSchema[]) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  inputsSchema.forEach(input => {
    switch (input.type) {
      case 'string':
        schemaFields[input.name] = z
          .string()
          .min(1, { message: `${input.name} is required` });
        break;
      case 'number':
        schemaFields[input.name] = z
          .string()
          .min(1, { message: `${input.name} is required` });
        break;
      case 'boolean':
        schemaFields[input.name] = z.boolean().optional();
        break;
      case 'select':
        schemaFields[input.name] = z
          .string()
          .min(1, { message: `${input.name} is required` });
        break;
      default:
        schemaFields[input.name] = z
          .string()
          .min(1, { message: `${input.name} is required` });
    }
  });

  return z.object(schemaFields);
};

// Dynamic form field component
const DynamicFormField = ({
  input,
  control,
  name,
}: {
  input: WorkflowInputSchema;
  control: any;
  name: string;
}) => {
  switch (input.type) {
    case 'select':
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{input.name}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || input.defaultValue}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${input.name}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {input.options?.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case 'boolean':
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{input.name}</FormLabel>
              </div>
            </FormItem>
          )}
        />
      );

    case 'number':
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{input.name}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={input.placeholder || input.name}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    default: // string
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{input.name}</FormLabel>
              <FormControl>
                <Input
                  placeholder={input.placeholder || input.name}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
  }
};

export function WorkflowTrigger() {
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [selectedConfig, setSelectedConfig] = useState<GithubConfig | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<string>('trigger');
  const [recentRuns, setRecentRuns] = useState<WorkflowRun[]>([]);
  const [triggeredRunId, setTriggeredRunId] = useState<string | null>(null);

  const { data: configs = [] } = useGithubConfig();
  const { data: workflowRunsData, isLoading: isLoadingRuns } =
    useWorkflowRuns(selectedConfigId);
  const { data: triggeredRunData } = useWorkflowRunStatus(
    selectedConfigId,
    triggeredRunId || '',
    !!triggeredRunId,
  );
  const { mutate: triggerWorkflow, isPending: isTriggering } =
    useTriggerWorkflow();
  const queryClient = useQueryClient();

  // Update selected config when configId changes
  useEffect(() => {
    if (selectedConfigId && configs.length > 0) {
      const config = configs.find(c => c.id === selectedConfigId);
      setSelectedConfig(config || null);
    } else {
      setSelectedConfig(null);
    }
    // Clear triggered run ID when config changes
    setTriggeredRunId(null);
  }, [selectedConfigId, configs]);

  // Update recent runs when workflow runs data changes
  useEffect(() => {
    if (workflowRunsData?.runs) {
      setRecentRuns(workflowRunsData.runs);

      // check if there's a recent run that might be our triggered one
      if (!triggeredRunId && workflowRunsData.runs.length > 0) {
        const mostRecentRun = workflowRunsData.runs[0];
        const runAge =
          Date.now() - new Date(mostRecentRun.created_at).getTime();

        // If the most recent run is less than 30 seconds old
        if (runAge < 30000) {
          setTriggeredRunId(mostRecentRun.id.toString());
        }
      }
    }
  }, [workflowRunsData]);

  // Detect active workflows when returning to the page
  useEffect(() => {
    if (workflowRunsData?.runs && !triggeredRunId) {
      // Look for any active workflows (not completed, failed, or cancelled)
      const activeRun = workflowRunsData.runs.find((run: any) => {
        const finalStatuses = ['completed', 'failure', 'cancelled'];
        return !finalStatuses.includes(run.status);
      });

      if (activeRun) {
        setTriggeredRunId(activeRun.id.toString());
      }
    }
  }, [workflowRunsData]);

  // Update the triggered run in the runs list when status changes
  useEffect(() => {
    if (triggeredRunData?.run) {
      // Update the recentRuns with the latest status from polling
      setRecentRuns(prevRuns => {
        return prevRuns.map(run =>
          run.id === triggeredRunData.run.id
            ? {
                ...run,
                status: triggeredRunData.run.status,
                conclusion: triggeredRunData.run.conclusion,
              }
            : run,
        );
      });

      // Clear triggeredRunId if the workflow is in a final state
      if (
        triggeredRunData.run.status === 'completed' ||
        triggeredRunData.run.status === 'failure' ||
        triggeredRunData.run.status === 'cancelled'
      ) {
        setTriggeredRunId(null);
      }
    }
  }, [triggeredRunData]);

  // Generate dynamic form schema based on selected config
  const formSchema = selectedConfig?.inputsSchema
    ? generateFormSchema(selectedConfig.inputsSchema)
    : z.object({});

  const form = useForm({
    resolver: zodResolver(formSchema) as any,
    defaultValues:
      selectedConfig?.inputsSchema?.reduce(
        (acc, input) => {
          acc[input.name] = input.defaultValue || '';
          return acc;
        },
        {} as Record<string, string>,
      ) || {},
  });

  // Reset form when config changes
  useEffect(() => {
    if (selectedConfig?.inputsSchema) {
      const defaultValues = selectedConfig.inputsSchema.reduce(
        (acc, input) => {
          acc[input.name] = input.defaultValue || '';
          return acc;
        },
        {} as Record<string, any>,
      );
      form.reset(defaultValues);
    }
  }, [selectedConfig]);

  // Handle form submission
  const onSubmit = useCallback(
    async (data: Record<string, any>) => {
      if (!selectedConfig?.id) {
        toast.error('Please select a GitHub configuration');
        return;
      }

      try {
        triggerWorkflow(
          {
            configId: selectedConfig.id,
            data: {
              inputs: data,
              ref: selectedConfig.defaultRef || 'main',
              triggeredBy: 'user',
            },
          },
          {
            onSuccess: () => {
              // Switch to runs tab to show the new run
              setActiveTab('runs');

              // Clear any previous triggered run ID
              setTriggeredRunId(null);

              // Wait a moment for GitHub to process the trigger, then fetch runs
              setTimeout(() => {
                if (selectedConfig?.id) {
                  queryClient.invalidateQueries({
                    queryKey: queryKeys.github.workflowRuns(selectedConfig.id),
                  });
                }
              }, 2000);
            },
            onError: () => {
              toast.error('Failed to trigger workflow');
            },
          },
        );
      } catch {
        toast.error('Failed to trigger workflow');
      }
    },
    [selectedConfig, triggerWorkflow, queryClient],
  );

  // Define columns for the workflow runs table
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'run_number',
      header: 'Run #',
      cell: ({ row }) => (
        <div className="font-mono text-sm font-semibold">
          #{row.getValue('run_number')}
        </div>
      ),
    },
    {
      accessorKey: 'display_title',
      header: 'Workflow',
      cell: ({ row }) => (
        <div className="max-w-[250px]">
          <div className="font-medium text-sm truncate">
            {row.getValue('display_title')}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.path}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge
          status={row.getValue('status')}
          conclusion={row.original.conclusion}
        />
      ),
    },
    {
      accessorKey: 'actor',
      header: 'Triggered By',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <User className="h-3 w-3" />
          </div>
          <span className="text-sm font-medium">
            {row.original.actor?.login || 'Unknown'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">
            {new Date(row.getValue('created_at')).toLocaleDateString()}
          </div>
          <div className="text-muted-foreground">
            {new Date(row.getValue('created_at')).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'head_branch',
      header: 'Branch',
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <GitBranch className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-mono">
            {row.getValue('head_branch')}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={e => {
            e.stopPropagation();
            if (row.original.html_url) {
              window.open(row.original.html_url, '_blank');
            }
          }}
          className="h-8 w-8 p-0"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            GitHub Workflows
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage and monitor your GitHub Actions workflows
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
            <SelectTrigger className="w-full sm:w-auto min-w-[160px] max-w-[240px] bg-white text-sm">
              <SelectValue placeholder="Select a GitHub configuration" />
            </SelectTrigger>
            <SelectContent>
              {configs.map(config => (
                <SelectItem key={config.id} value={config.id!} className="py-2">
                  <div className="flex flex-col space-y-0">
                    <span className="font-medium text-xs -1">
                      {config.owner}/{config.repo}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {config.workflow} • {config.defaultRef || 'main'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link to="/settings" search={{ tab: 'github' }}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Manage Configs
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      {selectedConfig && !isLoadingRuns && recentRuns.length > 0 && (
        <WorkflowStats runs={recentRuns} />
      )}

      {selectedConfig && isLoadingRuns && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-l-4 border-l-gray-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      {selectedConfig && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="trigger"
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Trigger Workflow</span>
            </TabsTrigger>
            <TabsTrigger value="runs" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Recent Runs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trigger" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Trigger New Workflow</span>
                </CardTitle>
                <CardDescription>
                  Start a new workflow run with custom parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Dynamic form fields based on inputsSchema */}
                    {selectedConfig.inputsSchema &&
                    selectedConfig.inputsSchema.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedConfig.inputsSchema.map(input => (
                          <DynamicFormField
                            key={input.name}
                            input={input}
                            control={form.control}
                            name={input.name}
                          />
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>No inputs configured</AlertTitle>
                        <AlertDescription>
                          This workflow doesn&apos;t have any input parameters
                          configured.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800">
                        Workflow Information
                      </AlertTitle>
                      <AlertDescription className="text-blue-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm">
                          <div>
                            <strong>Repository:</strong> {selectedConfig.owner}/
                            {selectedConfig.repo}
                          </div>
                          <div>
                            <strong>Workflow:</strong> {selectedConfig.workflow}
                          </div>
                          <div>
                            <strong>Branch:</strong>{' '}
                            {selectedConfig.defaultRef || 'main'}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <Button
                      type="submit"
                      className="w-full md:w-auto"
                      disabled={
                        isTriggering || !selectedConfig.inputsSchema?.length
                      }
                      size="lg"
                    >
                      {isTriggering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Triggering Workflow...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Trigger Workflow
                        </>
                      )}
                    </Button>

                    {isTriggering && (
                      <div className="text-sm text-muted-foreground text-center">
                        Creating workflow run... This may take a few seconds.
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="runs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Recent Workflow Runs</span>
                      {triggeredRunId && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Monitoring
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Monitor the status and progress of your workflow runs
                      {triggeredRunId && (
                        <span className="text-green-600 font-medium">
                          {' '}
                          • Live updates active
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      queryClient.invalidateQueries({
                        queryKey:
                          queryKeys.github.workflowRuns(selectedConfigId),
                      });
                    }}
                    disabled={isLoadingRuns || !!triggeredRunId}
                  >
                    <Loader2
                      className={`h-4 w-4 mr-2 ${isLoadingRuns ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingRuns ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : recentRuns.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No workflow runs found
                    </h3>
                    <p className="text-muted-foreground">
                      Trigger your first workflow to see it appear here
                    </p>
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={recentRuns}
                    filterColumn="display_title"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!selectedConfig && configs.length > 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Select a configuration
            </h3>
            <p className="text-muted-foreground">
              Choose a GitHub configuration above to start triggering workflows
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
