import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useProducts } from '@/hooks/api/use-products';
import { ProductTable } from './product/ProductTable';
import { ProductModal } from './product/ProductModal';
import { Plus } from 'lucide-react';

export function ProductSettingsCard() {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { data, isLoading } = useProducts();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Product / Service</CardTitle>
        <CardDescription>
          Add a new product to the dashboard. This will appear in the sidebar
          menu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">JIRA Configurations</h3>
            <ProductModal
              trigger={
                <Button>
                  <Plus />
                  Add Product / Service
                </Button>
              }
              isOpen={isProductModalOpen}
              onOpenChange={setIsProductModalOpen}
            />
          </div>
          <ProductTable
            products={data || []}
            isLoading={isLoading}
            isProductModalOpen={isProductModalOpen}
            onProductModalOpenChange={setIsProductModalOpen}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductSettingsCard;
