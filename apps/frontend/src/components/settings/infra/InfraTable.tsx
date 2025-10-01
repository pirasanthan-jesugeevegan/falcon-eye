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
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { Infrastructure } from '@/types';
import { InfraModal } from './InfraModal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useDeleteInfrastructure } from '@/hooks/api/use-infrastructure';

interface InfraTableProps {
  infrastructure: Infrastructure[];
  isLoading: boolean;
  isInfraModalOpen?: boolean;
  onInfraModalOpenChange: (open: boolean) => void;
}

export function InfraTable({
  infrastructure,
  isLoading,
  isInfraModalOpen,
  onInfraModalOpenChange,
}: InfraTableProps) {
  const [editData, setEditData] = useState<Infrastructure | undefined>(
    undefined,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [infraToDelete, setInfraToDelete] = useState<Infrastructure | null>(
    null,
  );

  const { mutateAsync: deleteInfrastructure, isPending: isDeleting } =
    useDeleteInfrastructure();

  // Handle edit button click
  const handleEditClick = (infra: Infrastructure) => {
    setEditData(infra);
    setIsEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (infra: Infrastructure) => {
    setInfraToDelete(infra);
    setDeleteConfirmOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (infraToDelete?.id) {
      await deleteInfrastructure(infraToDelete.id);
      setInfraToDelete(null);
    }
  };

  const infraColumnHelper = createColumnHelper<Infrastructure>();
  const infraColumns = [
    infraColumnHelper.accessor('name', {
      header: 'Dashboard Name',
      cell: info => info.getValue(),
    }),
    infraColumnHelper.accessor('iframeUrl', {
      header: 'IFrame URL',
      cell: info => (
        <span className="truncate max-w-xs block" title={info.getValue()}>
          {info.getValue()}
        </span>
      ),
    }),
    infraColumnHelper.accessor('isActive', {
      header: 'Status',
      cell: info => (info.getValue() ? 'Active' : 'Inactive'),
    }),
    infraColumnHelper.display({
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteClick(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    }),
  ];

  const infraTable = useReactTable({
    data: Array.isArray(infrastructure)
      ? infrastructure
      : [infrastructure].filter(Boolean),
    columns: infraColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (infraTable.getRowModel().rows.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 mb-4">No infrastructure dashboards found</p>
        <InfraModal
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Infrastructure Dashboard
            </Button>
          }
          isOpen={isInfraModalOpen ?? false}
          onOpenChange={onInfraModalOpenChange}
        />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {infraTable.getHeaderGroups().map(headerGroup => (
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
            {infraTable.getRowModel().rows.map(row => (
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
      <InfraModal
        trigger={<span />} // Hidden trigger as we're controlling it programmatically
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        editData={editData}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        title="Delete Infrastructure Dashboard"
        description={`Are you sure you want to delete "${infraToDelete?.name}"? This action cannot be undone.`}
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        isLoading={isDeleting}
      />
    </>
  );
}
