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
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { SonarCloudConfig } from '@/types';
import { SonarCloudConfigModal } from './SonarCloudConfigModal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { toast } from 'sonner';
import { useDeleteSonarCloudConfig } from '@/hooks/api';

interface SonarCloudConfigTableProps {
  configs: SonarCloudConfig[];
  isLoading: boolean;
  isConfigModalOpen: boolean;
  onConfigModalOpenChange: (open: boolean) => void;
}

export function SonarCloudConfigTable({
  configs,
  isLoading,
  isConfigModalOpen,
  onConfigModalOpenChange,
}: SonarCloudConfigTableProps) {
  const [editData, setEditData] = useState<SonarCloudConfig | undefined>(
    undefined,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<SonarCloudConfig | undefined>(
    undefined,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting] = useState(false);
  const deleteConfig = useDeleteSonarCloudConfig();
  // Handle edit button click
  const handleEditClick = (config: SonarCloudConfig) => {
    setEditData(config);
    setIsEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (config: SonarCloudConfig) => {
    setDeleteData(config);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteData?.id) {
      toast.error('Cannot delete query: Missing ID');
      return;
    }

    try {
      await deleteConfig.mutateAsync(deleteData.id);
      // Success toast is handled in the mutation
    } catch {
      // Error is handled in mutation
    }
  };

  const configColumnHelper = createColumnHelper<SonarCloudConfig>();
  const configColumns = [
    configColumnHelper.accessor('instanceName', {
      header: 'Instance Name',
      cell: info => info.getValue(),
    }),
    configColumnHelper.accessor('baseUrl', {
      header: 'Base URL',
      cell: info => info.getValue(),
    }),
    configColumnHelper.accessor('apiToken', {
      header: 'API Token',
      cell: () => '••••••••••••', // Masked for security
    }),
    configColumnHelper.display({
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
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const configTable = useReactTable({
    data: Array.isArray(configs) ? configs : [configs].filter(Boolean),
    columns: configColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (configTable.getRowModel().rows.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 mb-4">No SonarCloud configurations found</p>
        <SonarCloudConfigModal
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add SonarCloud Config
            </Button>
          }
          isOpen={isConfigModalOpen}
          onOpenChange={onConfigModalOpenChange}
        />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {configTable.getHeaderGroups().map(headerGroup => (
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
            {configTable.getRowModel().rows.map(row => (
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
      <SonarCloudConfigModal
        trigger={<span />} // Hidden trigger as we're controlling it programmatically
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        editData={editData}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        title="Delete SonarCloud Configuration"
        description={`Are you sure you want to delete the SonarCloud configuration "${deleteData?.instanceName}"? This action cannot be undone.`}
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}
