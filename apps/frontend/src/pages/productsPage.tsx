import { useParams } from '@tanstack/react-router';

export function ProductsPage() {
  const { productId } = useParams({ from: '/products/$productId' });
  return <div>Hello &quot;/$productId&quot;! {productId}</div>;
}
