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
import { JiraQueryModal } from './JiraQueryModal';
import { useDeleteJiraQuery } from '@/hooks/api/use-jira';
import type { JiraQuery } from '@/types';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface JiraQueryTableProps {
  queries: JiraQuery[];
  isLoading: boolean;
  isQueryModalOpen: boolean;
  onQueryModalOpenChange: (open: boolean) => void;
}

export function JiraQueryTable({
  queries,
  isLoading,
  isQueryModalOpen,
  onQueryModalOpenChange,
}: JiraQueryTableProps) {
  const [editData, setEditData] = useState<JiraQuery | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<JiraQuery | undefined>(
    undefined,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteQuery = useDeleteJiraQuery();

  // Handle edit button click
  const handleEditClick = (query: JiraQuery) => {
    setEditData(query);
    setIsEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (query: JiraQuery) => {
    setDeleteData(query);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteData?.id) {
      toast.error('Cannot delete query: Missing ID');
      return;
    }

    try {
      await deleteQuery.mutateAsync(deleteData.id);
      // Success toast is handled in the mutation
    } catch (error) {
      // Error is handled in mutation
    }
  };

  const queryColumnHelper = createColumnHelper<JiraQuery>();
  const queryColumns = [
    queryColumnHelper.accessor('name', {
      header: 'Name',
      cell: info => info.getValue(),
    }),
    queryColumnHelper.accessor('jqlQuery', {
      header: 'JQL Query',
      cell: info => (
        <div className="max-w-xs truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
    }),
    queryColumnHelper.accessor('description', {
      header: 'Description',
      cell: info => (
        <div className="max-w-xs truncate" title={info.getValue()}>
          {info.getValue() || '-'}
        </div>
      ),
    }),
    queryColumnHelper.accessor('isActive', {
      header: 'Status',
      cell: info => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            info.getValue() === true
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    }),
    queryColumnHelper.display({
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

  const queryTable = useReactTable({
    data: queries,
    columns: queryColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (queryTable.getRowModel().rows.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 mb-4">No JIRA queries found</p>
        <JiraQueryModal
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Query
            </Button>
          }
          isOpen={isQueryModalOpen}
          onOpenChange={onQueryModalOpenChange}
        />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {queryTable.getHeaderGroups().map(headerGroup => (
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
            {queryTable.getRowModel().rows.map(row => (
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
      <JiraQueryModal
        trigger={<span />} // Hidden trigger as we're controlling it programmatically
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        editData={editData}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        title="Delete JIRA Query"
        description={`Are you sure you want to delete the query "${deleteData?.name}"? This action cannot be undone.`}
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        isLoading={deleteQuery.isPending}
      />
    </>
  );
}
