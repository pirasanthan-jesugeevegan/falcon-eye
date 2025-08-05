import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Pencil, Plus } from 'lucide-react';
import type { Product } from '@/types';
import { ProductModal } from './ProductModal';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  isProductModalOpen?: boolean;
  onProductModalOpenChange: (open: boolean) => void;
}

export function ProductTable({
  products,
  isLoading,
  isProductModalOpen,
  onProductModalOpenChange,
}: ProductTableProps) {
  const [editData, setEditData] = useState<Product | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handle edit button click
  const handleEditClick = (product: Product) => {
    setEditData(product);
    setIsEditModalOpen(true);
  };

  const productColumnHelper = createColumnHelper<Product>();
  const productColumns = [
    productColumnHelper.accessor('productName', {
      header: 'Product Name',
      cell: info => info.getValue(),
    }),
    productColumnHelper.accessor('icon', {
      header: 'Icon',
      cell: info => info.getValue(),
    }),
    productColumnHelper.accessor('path', {
      header: 'Path',
      cell: info => info.getValue() || '-',
    }),
    productColumnHelper.accessor('isActive', {
      header: 'Status',
      cell: info => (info.getValue() ? 'Active' : 'Inactive'),
    }),
    productColumnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditClick(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const productTable = useReactTable({
    data: Array.isArray(products) ? products : [products].filter(Boolean),
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (productTable.getRowModel().rows.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 mb-4">No products found</p>
        <ProductModal
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          }
          isOpen={isProductModalOpen ?? false}
          onOpenChange={onProductModalOpenChange}
        />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {productTable.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {productTable.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <ProductModal
        trigger={<span />} // Hidden trigger as we're controlling it programmatically
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        editData={editData}
        mode="edit"
      />
    </>
  );
}
