import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateGithubConfig, usePatchGithubConfig } from '@/hooks/api';
import { type GithubConfig } from '@/types';

// Schema for workflow input options
const workflowInputOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

// Schema for workflow input schema
const workflowInputSchemaSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  type: z.enum(['string', 'select', 'boolean', 'number']),
  defaultValue: z.string().optional(),
  options: z.array(workflowInputOptionSchema).optional(),
});

const githubConfigSchema = z.object({
  owner: z.string().min(1, { message: 'Owner is required.' }),
  repo: z.string().min(1, { message: 'Repo is required.' }),
  workflow: z.string().min(1, { message: 'Workflow is required.' }),
  pat: z.string().optional(), // Make PAT optional since it's disabled in edit mode
  inputsSchema: z.array(workflowInputSchemaSchema).optional(),
  defaultRef: z.string().optional(),
});

type GithubConfigFormValues = z.infer<typeof githubConfigSchema>;

interface GithubConfigModalProps {
  trigger: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: GithubConfig;
  mode?: 'create' | 'edit';
  setEditData?: (data: GithubConfig | undefined) => void;
}

export function GithubConfigModal({
  trigger,
  isOpen,
  onOpenChange,
  editData,
  mode = 'create',
  setEditData,
}: GithubConfigModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createConfig = useCreateGithubConfig();
  const patchConfig = usePatchGithubConfig();

  const configForm = useForm<GithubConfigFormValues>({
    resolver: zodResolver(githubConfigSchema),
    defaultValues: {
      owner: editData?.owner || '',
      repo: editData?.repo || '',
      workflow: editData?.workflow || '',
      pat: editData?.pat || '',
      inputsSchema: editData?.inputsSchema || [],
      defaultRef: editData?.defaultRef || 'main',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: configForm.control,
    name: 'inputsSchema',
  });

  // Add new input field
  const addInputField = () => {
    append({
      name: '',
      type: 'string' as const,
      options: [{ value: '', label: '' }],
    });
  };

  // Update form values when editData changes
  useEffect(() => {
    if (editData && mode === 'edit') {
      configForm.reset({
        owner: editData.owner,
        repo: editData.repo,
        workflow: editData.workflow,
        pat: editData.pat,
        inputsSchema: editData.inputsSchema,
        defaultRef: editData.defaultRef,
      });
    }
  }, [editData, mode, configForm]);

  // Reset form when modal opens in create mode
  useEffect(() => {
    if (isOpen && mode === 'create' && !editData) {
      configForm.reset({
        owner: '',
        repo: '',
        workflow: '',
        pat: '',
        inputsSchema: [],
        defaultRef: 'main',
      });
    }
  }, [isOpen, mode, editData, configForm]);

  async function onConfigSubmit(values: GithubConfigFormValues) {
    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        // Create new config - PAT is required for creation
        if (!values.pat) {
          toast.error(
            'GitHub Token is required for creating a new configuration',
          );
          return;
        }

        await createConfig.mutateAsync({
          owner: values.owner,
          repo: values.repo,
          workflow: values.workflow,
          pat: values.pat,
          inputsSchema: values.inputsSchema || [],
          defaultRef: values.defaultRef,
        });
      } else {
        // Edit existing config
        if (!editData?.id) {
          toast.error('Cannot update configuration: Missing ID');
          return;
        }

        // In edit mode, only update inputsSchema since other fields are disabled
        await patchConfig.mutateAsync({
          id: editData.id,
          query: {
            inputsSchema: values.inputsSchema || [],
          },
        });
      }

      // Close modal and reset form on success
      onOpenChange(false);

      // Reset form with default values
      configForm.reset({
        owner: '',
        repo: '',
        workflow: '',
        pat: '',
        inputsSchema: [],
        defaultRef: 'main',
      });

      // Clear edit data when closing
      if (mode === 'edit') {
        setEditData?.(undefined);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error is already handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {' '}
            {mode === 'create'
              ? 'Add Github Configuration'
              : 'Edit Github Configuration'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new Github configuration to connect to your Github instance.'
              : 'Update your Github configuration settings.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...configForm}>
          <form
            onSubmit={configForm.handleSubmit(onConfigSubmit)}
            className="space-y-4"
          >
            {/* Basic Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={configForm.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="myorg"
                        {...field}
                        disabled={mode === 'edit'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={configForm.control}
                name="repo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="myrepo"
                        {...field}
                        disabled={mode === 'edit'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={configForm.control}
                name="workflow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="run-test.yml"
                        {...field}
                        disabled={mode === 'edit'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={configForm.control}
                name="defaultRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="main"
                        {...field}
                        disabled={mode === 'edit'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={configForm.control}
              name="pat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        mode === 'edit' ? '••••••••••••' : 'GitHub Token'
                      }
                      {...field}
                      disabled={mode === 'edit'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Workflow Inputs - Accordion */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <FormLabel>Workflow Inputs</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInputField}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Input
                </Button>
              </div>

              <Accordion type="single" collapsible className="space-y-2">
                {fields.map((field, index) => (
                  <AccordionItem
                    key={field.id}
                    value={`input-${index}`}
                    className="border rounded-lg"
                  >
                    <AccordionTrigger className="px-3 py-2 hover:no-underline">
                      <div className="flex justify-between items-center w-full pr-4">
                        <span className="text-sm font-medium">
                          {configForm.watch(`inputsSchema.${index}.name`) ||
                            `Input ${index + 1}`}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            remove(index);
                          }}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={configForm.control}
                          name={`inputsSchema.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Name</FormLabel>
                              <FormControl>
                                <Input placeholder="env" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={configForm.control}
                          name={`inputsSchema.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="select">Select</SelectItem>
                                  <SelectItem value="boolean">
                                    Boolean
                                  </SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Options for select type only */}
                      {configForm.watch(`inputsSchema.${index}.type`) ===
                        'select' && (
                        <div className="space-y-2">
                          <FormLabel className="text-sm">
                            Options (value: label)
                          </FormLabel>
                          {configForm
                            .watch(`inputsSchema.${index}.options`)
                            ?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex gap-2">
                                <Input
                                  placeholder="dev"
                                  value={option.value}
                                  onChange={e => {
                                    const currentOptions =
                                      configForm.getValues(
                                        `inputsSchema.${index}.options`,
                                      ) || [];
                                    currentOptions[optionIndex].value =
                                      e.target.value;
                                    configForm.setValue(
                                      `inputsSchema.${index}.options`,
                                      currentOptions,
                                    );
                                  }}
                                />
                                <Input
                                  placeholder="Development"
                                  value={option.label}
                                  onChange={e => {
                                    const currentOptions =
                                      configForm.getValues(
                                        `inputsSchema.${index}.options`,
                                      ) || [];
                                    currentOptions[optionIndex].label =
                                      e.target.value;
                                    configForm.setValue(
                                      `inputsSchema.${index}.options`,
                                      currentOptions,
                                    );
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const currentOptions =
                                      configForm.getValues(
                                        `inputsSchema.${index}.options`,
                                      ) || [];
                                    const newOptions = currentOptions.filter(
                                      (_, i) => i !== optionIndex,
                                    );
                                    configForm.setValue(
                                      `inputsSchema.${index}.options`,
                                      newOptions,
                                    );
                                  }}
                                  disabled={
                                    configForm.watch(
                                      `inputsSchema.${index}.options`,
                                    )?.length === 1
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentOptions =
                                configForm.getValues(
                                  `inputsSchema.${index}.options`,
                                ) || [];
                              configForm.setValue(
                                `inputsSchema.${index}.options`,
                                [...currentOptions, { value: '', label: '' }],
                              );
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Option
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

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
