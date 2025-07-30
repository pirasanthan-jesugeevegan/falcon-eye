import { createLazyFileRoute } from '@tanstack/react-router';
import { ProductsPage } from '@/pages/productsPage';

export const Route = createLazyFileRoute('/products/$productId')({
  component: ProductsPage,
});
