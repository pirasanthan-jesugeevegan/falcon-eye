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
import type { GithubConfig } from '@/types';
import { GithubConfigModal } from './GithubConfigModal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { toast } from 'sonner';
import { useDeleteGithubConfig } from '@/hooks/api';

interface GithubConfigTableProps {
  configs: GithubConfig[];
  isLoading: boolean;
  isConfigModalOpen: boolean;
  onConfigModalOpenChange: (open: boolean) => void;
}

export function GithubConfigTable({
  configs,
  isLoading,
  isConfigModalOpen,
  onConfigModalOpenChange,
}: GithubConfigTableProps) {
  const [editData, setEditData] = useState<GithubConfig | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<GithubConfig | undefined>(
    undefined,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteConfig = useDeleteGithubConfig();

  // Handle edit button click
  const handleEditClick = (config: GithubConfig) => {
    setEditData(config);
    setIsEditModalOpen(true);
  };

  // Handle edit modal close
  const handleEditModalClose = (open: boolean) => {
    setIsEditModalOpen(open);
    if (!open) {
      setEditData(undefined);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (config: GithubConfig) => {
    setDeleteData(config);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteData) {
      toast.error('Cannot delete query: Missing ID');
      return;
    }

    try {
      await deleteConfig.mutateAsync(deleteData.id!);
      // Success toast is handled in the mutation
    } catch {
      // Error is handled in mutation
    }
  };

  const configColumnHelper = createColumnHelper<GithubConfig>();
  const configColumns = [
    configColumnHelper.accessor('owner', {
      header: 'Owner',
      cell: info => info.getValue(),
    }),
    configColumnHelper.accessor('repo', {
      header: 'Repo',
      cell: info => info.getValue(),
    }),
    configColumnHelper.accessor('workflow', {
      header: 'Workflow',
      cell: info => info.getValue() || '-',
    }),
    configColumnHelper.accessor('defaultRef', {
      header: 'Branch',
      cell: info => info.getValue() || 'main',
    }),
    configColumnHelper.accessor('inputsSchema', {
      header: 'Inputs',
      cell: info => {
        const inputs = info.getValue();
        if (!inputs || inputs.length === 0) {
          return <span className="text-gray-400">No inputs</span>;
        }

        return (
          <div className="space-y-1">
            {inputs.map((input, index) => (
              <div key={index} className="text-xs">
                <span className="font-medium">{input.name}</span>
                <span className="text-gray-500 ml-1">({input.type})</span>
                {input.type === 'select' &&
                  input.options &&
                  input.options.length > 0 && (
                    <span className="text-gray-400 ml-1">
                      - {input.options.length} options
                    </span>
                  )}
              </div>
            ))}
          </div>
        );
      },
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
        <p className="text-gray-500 mb-4">No Github configurations found</p>
        <GithubConfigModal
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Github Config
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
      <GithubConfigModal
        trigger={<span />} // Hidden trigger as we're controlling it programmatically
        isOpen={isEditModalOpen}
        onOpenChange={handleEditModalClose}
        editData={editData}
        mode="edit"
        setEditData={setEditData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        title="Delete Github Configuration"
        description={`Are you sure you want to delete the Github configuration "${deleteData?.owner}/${deleteData?.repo}/${deleteData?.workflow}"? This action cannot be undone.`}
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        isLoading={deleteConfig.isPending}
      />
    </>
  );
}
