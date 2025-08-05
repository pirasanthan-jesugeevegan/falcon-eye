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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUpdateJiraConfig, usePatchJiraConfig } from '@/hooks/api/use-jira';
import { type JiraConfig } from '@/types';

const jiraConfigSchema = z.object({
  instanceName: z.string().min(1, { message: 'Instance name is required.' }),
  baseUrl: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .refine(val => val.endsWith('/'), {
      message: 'URL must end with a forward slash (/).',
    }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .or(z.literal('')),
  apiToken: z.string().min(1, { message: 'API token is required.' }),
});

type JiraConfigFormValues = z.infer<typeof jiraConfigSchema>;

interface JiraConfigModalProps {
  trigger: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: JiraConfig;
  mode?: 'create' | 'edit';
}

export function JiraConfigModal({
  trigger,
  isOpen,
  onOpenChange,
  editData,
  mode = 'create',
}: JiraConfigModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateConfig = useUpdateJiraConfig();
  const patchConfig = usePatchJiraConfig();

  const configForm = useForm<JiraConfigFormValues>({
    resolver: zodResolver(jiraConfigSchema),
    defaultValues: {
      instanceName: editData?.instanceName || '',
      baseUrl: editData?.baseUrl || '',
      email: editData?.email || '',
      apiToken: editData?.apiToken || '',
    },
  });

  // Update form values when editData changes
  useEffect(() => {
    if (editData && mode === 'edit') {
      configForm.reset({
        instanceName: editData.instanceName,
        baseUrl: editData.baseUrl,
        email: editData.email,
        apiToken: editData.apiToken,
      });
    }
  }, [editData, mode, configForm]);

  async function onConfigSubmit(values: JiraConfigFormValues) {
    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        // Create new config
        await updateConfig.mutateAsync({
          instanceName: values.instanceName,
          baseUrl: values.baseUrl,
          email: values.email,
          apiToken: values.apiToken,
        });
      } else {
        // Edit existing config
        if (!editData?.id) {
          toast.error('Cannot update configuration: Missing ID');
          return;
        }

        // Only send changed fields to minimize data transfer
        const changedFields: Partial<JiraConfig> = {};
        if (values.email !== editData.email) changedFields.email = values.email;
        if (values.apiToken !== editData.apiToken)
          changedFields.apiToken = values.apiToken;

        // Use PATCH to update only changed fields
        await patchConfig.mutateAsync({
          id: editData.id,
          query: changedFields,
        });
      }

      // Close modal and reset form on success
      onOpenChange(false);

      configForm.reset({
        instanceName: '',
        baseUrl: '',
        email: '',
        apiToken: '',
      });
    } catch (error) {
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
              ? 'Add JIRA Configuration'
              : 'Edit JIRA Configuration'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new JIRA configuration to connect to your JIRA instance.'
              : 'Update your JIRA configuration settings.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...configForm}>
          <form
            onSubmit={configForm.handleSubmit(onConfigSubmit)}
            className="space-y-4"
          >
            <FormField
              control={configForm.control}
              name="instanceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instance Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Your Jira instance name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={configForm.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Your Jira instance URL.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={configForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormDescription>Your Jira account email.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={configForm.control}
              name="apiToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        mode === 'edit' ? '••••••••••••' : 'API Token'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your Jira API token (create one in Atlassian account
                    settings).
                    {mode === 'edit' && (
                      <span className="block mt-1 text-xs text-muted-foreground">
                        Leave empty to keep current token.
                      </span>
                    )}
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
                    ? 'Add Configuration'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
