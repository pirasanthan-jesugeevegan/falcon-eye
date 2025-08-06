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
import type { SonarCloudConfig } from '@/types';
import {
  usePatchSonarCloudConfig,
  useUpdateSonarCloudConfig,
} from '@/hooks/api';

const sonarCloudConfigSchema = z.object({
  instanceName: z.string().min(1, { message: 'Instance name is required.' }),
  baseUrl: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .refine(val => !val.endsWith('/'), {
      message: 'URL must **not** end with a forward slash (/).',
    }),
  apiToken: z.string().min(1, { message: 'API token is required.' }),
});

type SonarCloudConfigFormValues = z.infer<typeof sonarCloudConfigSchema>;

interface SonarCloudConfigModalProps {
  trigger: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: SonarCloudConfig;
  mode?: 'create' | 'edit';
}

export function SonarCloudConfigModal({
  trigger,
  isOpen,
  onOpenChange,
  editData,
  mode = 'create',
}: SonarCloudConfigModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateConfig = useUpdateSonarCloudConfig();
  const patchConfig = usePatchSonarCloudConfig();

  const configForm = useForm<SonarCloudConfigFormValues>({
    resolver: zodResolver(sonarCloudConfigSchema),
    defaultValues: {
      instanceName: editData?.instanceName || '',
      baseUrl: editData?.baseUrl || '',
      apiToken: editData?.apiToken || '',
    },
  });

  // Update form values when editData changes
  useEffect(() => {
    if (editData && mode === 'edit') {
      configForm.reset({
        instanceName: editData.instanceName,
        baseUrl: editData.baseUrl,
        apiToken: editData.apiToken,
      });
    }
  }, [editData, mode, configForm]);

  async function onConfigSubmit(values: SonarCloudConfigFormValues) {
    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        // Create new config
        await updateConfig.mutateAsync({
          instanceName: values.instanceName,
          baseUrl: values.baseUrl,
          apiToken: values.apiToken,
        });
      } else {
        // Edit existing config
        if (!editData?.id) {
          toast.error('Cannot update configuration: Missing ID');
          return;
        }

        // Only send changed fields to minimize data transfer
        const changedFields: Partial<SonarCloudConfig> = {};
        if (values.apiToken !== editData.apiToken)
          changedFields.apiToken = values.apiToken;
        if (values.instanceName !== editData.instanceName)
          changedFields.instanceName = values.instanceName;
        if (values.baseUrl !== editData.baseUrl)
          changedFields.baseUrl = values.baseUrl;

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
              ? 'Add SonarCloud Configuration'
              : 'Edit SonarCloud Configuration'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new SonarCloud configuration to connect to your SonarCloud instance.'
              : 'Update your SonarCloud configuration settings.'}
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
                  <FormDescription>
                    Your SonarCloud instance name.
                  </FormDescription>
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
                  <FormDescription>
                    Your SonarCloud instance URL.
                  </FormDescription>
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
                    Your SonarCloud API token (create one in SonarCloud account
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
