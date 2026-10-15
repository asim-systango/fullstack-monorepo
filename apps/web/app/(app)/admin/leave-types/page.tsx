'use client';

import { useState } from 'react';
import {
  Button,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import { LeaveTypeDialog } from '@/components/admin';
import {
  ConfirmDialog,
  QueryErrorAlert,
  TableSkeleton,
  useToast,
} from '@/components/feedback';
import { AppPage } from '@/components/layout';
import { errorMessage } from '@/lib/leave/errors';
import { useArchiveLeaveType, useLeaveTypes } from '@/lib/leave/queries';
import type { LeaveType } from '@/lib/leave/types';

type RowProps = Readonly<{
  type: LeaveType;
  onEdit: (type: LeaveType) => void;
  onDelete: (type: LeaveType) => void;
}>;

function LeaveTypeRow({ type, onEdit, onDelete }: RowProps) {
  return (
    <TableRow>
      <TableCell>{type.name}</TableCell>
      <TableCell className="text-right tabular-nums">{type.defaultDays}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => onEdit(type)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(type)}>
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function LeaveTypesPage() {
  const toast = useToast();
  const leaveTypes = useLeaveTypes();
  const archive = useArchiveLeaveType();
  const [dialog, setDialog] = useState<{ open: boolean; editing: LeaveType | null }>({
    open: false,
    editing: null,
  });
  const [toDelete, setToDelete] = useState<LeaveType | null>(null);

  const openCreate = () => setDialog({ open: true, editing: null });

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    archive.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null);
        toast(`${name} deleted`);
      },
    });
  }

  function renderList() {
    if (leaveTypes.isPending) return <TableSkeleton rows={3} />;
    if (leaveTypes.isError) {
      return (
        <QueryErrorAlert
          error={leaveTypes.error}
          onRetry={() => void leaveTypes.refetch()}
        />
      );
    }
    if (leaveTypes.data.length === 0) {
      return (
        <EmptyState
          title="No leave types yet"
          description="Create Casual, Sick or Earned leave so employees can apply."
          action={<Button onClick={openCreate}>Create the first one</Button>}
        />
      );
    }
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell className="text-right">
              Default days per year
            </TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leaveTypes.data.map((type) => (
            <LeaveTypeRow
              key={type.id}
              type={type}
              onEdit={(t) => setDialog({ open: true, editing: t })}
              onDelete={setToDelete}
            />
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <AppPage
      title="Leave types"
      description="The kinds of leave employees can apply for."
      actions={<Button onClick={openCreate}>New leave type</Button>}
    >
      {renderList()}

      <LeaveTypeDialog
        open={dialog.open}
        editing={dialog.editing}
        onClose={() => setDialog({ open: false, editing: null })}
      />
      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${toDelete?.name ?? 'this leave type'}?`}
        description="It disappears from lists and the apply form. Past requests and balances keep it."
        confirmLabel="Delete"
        danger
        pending={archive.isPending}
        error={archive.isError ? errorMessage(archive.error) : null}
        onConfirm={confirmDelete}
        onClose={() => {
          archive.reset();
          setToDelete(null);
        }}
      />
    </AppPage>
  );
}
