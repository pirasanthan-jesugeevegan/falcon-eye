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
  useCreateJiraQuery,
  useJiraConfig,
  usePatchJiraQuery,
  type JiraQuery,
} from '@/hooks/api';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
} from '@/components/ui/select';
import type { JiraConfig } from '@/types';

const jiraQuerySchema = z.object({
  name: z.string().min(1, { message: 'Query name is required.' }),
  jqlQuery: z.string().min(1, { message: 'JQL query is required.' }),
  description: z.string().optional(),
  isActive: z.boolean(),
  jiraConfigId: z.string().optional(),
});

type JiraQueryFormValues = z.infer<typeof jiraQuerySchema>;

interface JiraQueryModalProps {
  trigger: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: JiraQuery;
  mode?: 'create' | 'edit';
}

export function JiraQueryModal({
  trigger,
  isOpen,
  onOpenChange,
  editData,
  mode = 'create',
}: JiraQueryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: jiraConfig } = useJiraConfig();
  const jiraConfigs = Array.isArray(jiraConfig)
    ? jiraConfig
    : jiraConfig
      ? [jiraConfig]
      : [];
  const createQuery = useCreateJiraQuery();
  const patchQuery = usePatchJiraQuery();

  const queryForm = useForm<JiraQueryFormValues>({
    resolver: zodResolver(jiraQuerySchema),
    defaultValues: {
      name: editData?.name || '',
      jqlQuery: editData?.jqlQuery || '',
      description: editData?.description || '',
      isActive: editData?.isActive || true,
    },
  });

  // Update form values when editData changes
  useEffect(() => {
    if (editData && mode === 'edit') {
      queryForm.reset({
        jiraConfigId: editData.jiraConfigId || '',
        name: editData.name,
        jqlQuery: editData.jqlQuery,
        description: editData.description || '',
        isActive: editData.isActive,
      });
    }
  }, [editData, mode, queryForm]);

  async function onQuerySubmit(values: JiraQueryFormValues) {
    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        // Create new query
        await createQuery.mutateAsync({
          name: values.name,
          jiraConfigId: values.jiraConfigId || '',
          jqlQuery: values.jqlQuery,
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
        const changedFields: Partial<JiraQuery> = {};
        if (values.name !== editData.name) changedFields.name = values.name;
        if (values.jqlQuery !== editData.jqlQuery)
          changedFields.jqlQuery = values.jqlQuery;
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
          jqlQuery: '',
          description: '',
          isActive: true,
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
            {mode === 'create' ? 'Add JIRA Query' : 'Edit JIRA Query'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new JIRA query to retrieve specific issues from your JIRA instance.'
              : 'Update your JIRA query settings.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...queryForm}>
          <form
            onSubmit={queryForm.handleSubmit(onQuerySubmit)}
            className="space-y-4"
          >
            <FormField
              control={queryForm.control}
              name="jiraConfigId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Jira Config</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={value => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <span>
                          {jiraConfigs.find(
                            (c: JiraConfig) => c.id === field.value,
                          )?.instanceName ?? 'No Jira Config'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {jiraConfigs.map(config => (
                            <SelectItem key={config.id} value={config.id}>
                              {config.instanceName}
                            </SelectItem>
                          ))}
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

            <FormField
              control={queryForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Query Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., High Priority Bugs" {...field} />
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
              name="jqlQuery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>JQL Query</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='project = "PROJ" AND priority = High AND type = Bug'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your JIRA Query Language (JQL) query.
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of what this query returns"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description for this query.
                  </FormDescription>
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
