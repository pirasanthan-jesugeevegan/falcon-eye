import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  usePatchSonarCloudQuery,
  useCreateSonarCloudQuery,
  useSonarCloudConfig,
  type SonarCloudQuery,
} from '@/hooks/api';

const metricOptions = ['pull_request', 'project_status'] as const; //!!TODO: add this to global types

const sonarCloudQuerySchema = z.object({
  name: z.string().min(1, { message: 'Query name is required.' }),
  project: z.string().min(1, { message: 'Project is required.' }),
  metric: z
    .array(z.enum(metricOptions))
    .min(1, { message: 'Select at least one metric.' }),
  description: z.string().optional(),
  isActive: z.boolean(),
  sonarCloudConfigId: z.string().optional(),
});

type SonarCloudQueryFormValues = z.infer<typeof sonarCloudQuerySchema>;

interface SonarCloudQueryModalProps {
  trigger: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: SonarCloudQuery;
  mode?: 'create' | 'edit';
}

export function SonarCloudQueryModal({
  trigger,
  isOpen,
  onOpenChange,
  editData,
  mode = 'create',
}: SonarCloudQueryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: sonarCloudConfig = [] } = useSonarCloudConfig();
  const createQuery = useCreateSonarCloudQuery();
  const patchQuery = usePatchSonarCloudQuery();

  const queryForm = useForm<SonarCloudQueryFormValues>({
    resolver: zodResolver(sonarCloudQuerySchema),
    defaultValues: {
      name: editData?.name || '',
      project: editData?.project || '',
      metric: editData?.metric || [],
      description: editData?.description || '',
      isActive: editData?.isActive ?? true,
      sonarCloudConfigId: editData?.sonarCloudConfigId || '',
    },
  });

  // Update form values when editData changes
  useEffect(() => {
    if (editData && mode === 'edit') {
      queryForm.reset({
        name: editData.name,
        project: editData.project,
        metric: editData.metric,
        description: editData.description || '',
        isActive: editData.isActive,
        sonarCloudConfigId: editData.sonarCloudConfigId || '',
      });
    }
  }, [editData, mode, queryForm]);

  async function onQuerySubmit(values: SonarCloudQueryFormValues) {
    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        // Create new query
        await createQuery.mutateAsync({
          name: values.name,
          sonarCloudConfigId:
            values.sonarCloudConfigId || sonarCloudConfig[0]?.id || '', // Use selected config or first config
          metric: values.metric,
          project: values.project,
          description: values.description ?? '',
          isActive: values.isActive,
        });
      } else {
        // Edit existing query
        if (!editData?.id) {
          toast.error('Cannot update query: Missing ID');
          return;
        }

        // Only send changed fields to minimize data transfer
        const changedFields: Partial<SonarCloudQuery> = {};
        if (values.name !== editData.name) changedFields.name = values.name;
        if (values.metric !== editData.metric)
          changedFields.metric = values.metric;
        if (values.project !== editData.project)
          changedFields.project = values.project;
        if (values.description !== editData.description)
          changedFields.description = values.description;
        if (values.isActive !== editData.isActive)
          changedFields.isActive = values.isActive;

        // Use PATCH to update only changed fields if there are changes
        if (Object.keys(changedFields).length > 0) {
          await patchQuery.mutateAsync({
            id: editData.id,
            query: changedFields,
          });
        } else {
          toast.info('No changes detected');
        }
      }

      // Close modal and reset form on success
      onOpenChange(false);
      if (mode === 'create') {
        queryForm.reset({
          name: '',
          project: '',
          metric: [],
          description: '',
          isActive: true,
          sonarCloudConfigId: '',
        });
      }
    } catch {
      // Error is already handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? 'Add SonarCloud Query'
              : 'Edit SonarCloud Query'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new SonarCloud query to retrieve specific issues from your SonarCloud instance.'
              : 'Update your SonarCloud query settings.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...queryForm}>
          <form
            onSubmit={queryForm.handleSubmit(onQuerySubmit)}
            className="space-y-4"
          >
            <FormField
              control={queryForm.control}
              name="sonarCloudConfigId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select SonarCloud Config</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={value => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <span>
                          {sonarCloudConfig.find(c => c.id === field.value)
                            ?.instanceName ?? 'No SonarCloud Config'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(Array.isArray(sonarCloudConfig)
                            ? sonarCloudConfig
                            : []
                          ).map(config => (
                            <SelectItem key={config.id} value={config.id || ''}>
                              {config.instanceName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Select the SonarCloud configuration to use for this query.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={queryForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Query Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Projects Pull Requests"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your query.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={queryForm.control}
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., my-project" {...field} />
                  </FormControl>
                  <FormDescription>
                    The project to query. This is required for project_status
                    metrics.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={queryForm.control}
              name="metric"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric</FormLabel>
                  <div className="space-y-2">
                    {metricOptions.map(option => {
                      const checked = field.value?.includes(option);

                      return (
                        <div
                          key={option}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={checked => {
                                const updated = checked
                                  ? [...field.value, option]
                                  : field.value.filter(v => v !== option);
                                field.onChange(updated);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal capitalize">
                            {option.replace('_', ' ')}
                          </FormLabel>
                        </div>
                      );
                    })}
                  </div>
                  <FormDescription>
                    Select one or more metrics to track.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={queryForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of what this query returns"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Description for this query.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={queryForm.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active Status (Optional)</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={value => field.onChange(value === 'true')}
                    >
                      <SelectTrigger>
                        <span>{field.value ? 'Active' : 'Inactive'}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Optional description for this query.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? mode === 'create'
                    ? 'Adding...'
                    : 'Saving...'
                  : mode === 'create'
                    ? 'Add Query'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
