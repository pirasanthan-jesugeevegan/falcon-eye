import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { dateFormat } from '@/lib/utils';
import type { Product } from '@/types';

export default function ProductInfo({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Information</CardTitle>
        <CardDescription>Details about this product</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="text-muted-foreground">Product ID</div>
            <div className="font-medium">{product.id}</div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="text-muted-foreground">Created At</div>
            <div className="font-medium">{dateFormat(product.createdAt!)}</div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="text-muted-foreground">Updated At</div>
            <div className="font-medium">{dateFormat(product.updatedAt!)}</div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="text-muted-foreground">Status</div>
            <div className="font-medium">
              <Badge variant={product.isActive ? 'default' : 'secondary'}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
