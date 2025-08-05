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
import { useCreateProduct, useUpdateProduct } from '@/hooks/api';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import DynamicHeroIcon from '@/components/ui/dynamicIcon';
import * as HIcons from '@heroicons/react/24/solid';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

const productFormSchema = z.object({
  productName: z.string().min(1, { message: 'Product name is required.' }),
  icon: z.string().optional(),
  path: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductModalProps {
  trigger: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: ProductFormValues & { id?: string };
  mode?: 'create' | 'edit';
}

const heroIconNames = Object.keys(HIcons) as (keyof typeof HIcons)[];

export function ProductModal({
  trigger,
  isOpen,
  onOpenChange,
  editData,
  mode = 'create',
}: ProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const configForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: editData?.productName || '',
      icon: editData?.icon || '',
      path: editData?.path || '',
      isActive: editData?.isActive || true,
    },
  });

  // Reset form when modal opens/closes or editData changes
  useEffect(() => {
    if (isOpen) {
      configForm.reset({
        productName: editData?.productName || '',
        icon: editData?.icon || '',
        path: editData?.path || '',
        isActive: editData?.isActive ?? true,
      });
    }
  }, [isOpen, editData, configForm]);

  async function onConfigSubmit(values: ProductFormValues) {
    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        // Create new product
        await createProduct.mutateAsync({
          productName: values.productName,
          icon: values.icon || '',
          path: values.path || '',
          isActive: values.isActive ?? true,
        });

        configForm.reset({
          productName: '',
          icon: '',
          path: '',
          isActive: true,
        });
      } else {
        // Update existing product
        if (!editData?.id) {
          throw new Error('Product ID is required for update');
        }

        await updateProduct.mutateAsync({
          id: editData.id,
          product: {
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
              ? 'Add Product / Service'
              : 'Edit Product / Service Status'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new product or service to your catalog.'
              : 'Update your product or service Status.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...configForm}>
          <form
            onSubmit={configForm.handleSubmit(onConfigSubmit)}
            className="space-y-4"
          >
            {mode === 'create' && (
              <FormField
                control={configForm.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product / Service Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter product name" />
                    </FormControl>
                    <FormDescription>
                      This is the name that will be displayed in the sidebar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {mode === 'create' && (
              <FormField
                control={configForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Command className="border rounded-md bg-background">
                      <CommandInput placeholder="Search icons..." />
                      <CommandList className="max-h-48 overflow-y-auto">
                        {heroIconNames.map(iconName => (
                          <CommandItem
                            key={iconName}
                            value={iconName}
                            onSelect={value => {
                              field.onChange(value);
                            }}
                          >
                            <DynamicHeroIcon
                              icon={iconName}
                              className="h-5 w-5"
                            />
                            <span className="ml-2">{iconName}</span>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                    {field.value && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                        <DynamicHeroIcon
                          icon={field.value as keyof typeof HIcons}
                        />
                        <span>{field.value}</span>
                      </div>
                    )}
                    <FormDescription>
                      Select a Icon for the product / service.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {mode === 'create' && (
              <FormField
                control={configForm.control}
                name="path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Path</FormLabel>
                    <FormControl>
                      <Input placeholder="/product-path" {...field} />
                    </FormControl>
                    <FormDescription>
                      Path for the product. Must start with a forward slash (/).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={configForm.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active Status</FormLabel>
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
                    ? 'Add Product'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
