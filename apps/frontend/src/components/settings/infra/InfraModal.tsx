import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useCreateInfrastructure, useUpdateInfrastructure } from '@/hooks/api';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

const infrastructureFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  iframeUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  isActive: z.boolean().optional(),
});

type InfrastructureFormValues = z.infer<typeof infrastructureFormSchema>;

interface InfraModalProps {
  trigger: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: InfrastructureFormValues & { id?: string };
  mode?: 'create' | 'edit';
}

export function InfraModal({
  trigger,
  isOpen,
  onOpenChange,
  editData,
  mode = 'create',
}: InfraModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createInfrastructure = useCreateInfrastructure();
  const updateInfrastructure = useUpdateInfrastructure();

  const configForm = useForm<InfrastructureFormValues>({
    resolver: zodResolver(infrastructureFormSchema),
    defaultValues: {
      name: editData?.name || '',
      iframeUrl: editData?.iframeUrl || '',
      isActive: editData?.isActive || true,
    },
  });

  // Reset form when modal opens/closes or editData changes
  useEffect(() => {
    if (isOpen) {
      configForm.reset({
        name: editData?.name || '',
        iframeUrl: editData?.iframeUrl || '',
        isActive: editData?.isActive ?? true,
      });
    }
  }, [isOpen, editData, configForm]);

  async function onConfigSubmit(values: InfrastructureFormValues) {
    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        // Create new infrastructure dashboard
        await createInfrastructure.mutateAsync({
          name: values.name,
          iframeUrl: values.iframeUrl,
          isActive: values.isActive ?? true,
        });

        configForm.reset({
          name: '',
          iframeUrl: '',
          isActive: true,
        });
      } else {
        // Update existing infrastructure dashboard
        if (!editData?.id) {
          throw new Error('Infrastructure ID is required for update');
        }

        await updateInfrastructure.mutateAsync({
          id: editData.id,
          infrastructure: {
            name: values.name,
            iframeUrl: values.iframeUrl,
            isActive: values.isActive ?? true,
          },
        });
      }

      // Close modal on success
      onOpenChange(false);
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
              ? 'Add Infrastructure Dashboard'
              : 'Edit Infrastructure Dashboard'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new infrastructure dashboard with an iframe URL.'
              : 'Update your infrastructure dashboard settings.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...configForm}>
          <form
            onSubmit={configForm.handleSubmit(onConfigSubmit)}
            className="space-y-4"
          >
            <FormField
              control={configForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dashboard Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter dashboard name" />
                  </FormControl>
                  <FormDescription>
                    This is the name that will identify the dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={configForm.control}
              name="iframeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFrame URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://example.com/dashboard"
                      type="url"
                    />
                  </FormControl>
                  <FormDescription>
                    The URL of the dashboard to embed in an iframe.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={configForm.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={value => field.onChange(value === 'true')}
                      value={field.value ? 'true' : 'false'}
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
                    Set whether this dashboard is active or inactive.
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
                    ? 'Add Dashboard'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
