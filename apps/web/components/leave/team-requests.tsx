'use client';

import { useState, type ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Button, EmptyState } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import {
  ConfirmDialog,
  QueryErrorAlert,
  TableSkeleton,
  useToast,
} from '@/components/feedback';
import { decisionState } from '@/lib/leave/decisions';
import { errorMessage } from '@/lib/leave/errors';
import {
  useApproveRequest,
  useRejectRequest,
  useRemoveRequest,
  useTeamRequests,
} from '@/lib/leave/queries';
import type { LeaveRequest, Paginated, Role } from '@/lib/leave/types';
import {
  clearTeamFilters,
  setTeamPage,
  toTeamQuery,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';
import { DecisionDialog, type DecisionTarget } from './decision-dialog';
import { Pagination } from './pagination';
import { RequestFilters, hasBadRange } from './request-filters';
import { RequestsTable } from './requests-table';

const PAGE_SIZE = 10;

type Mode = 'manager' | 'admin';

type RowActionsProps = Readonly<{
  row: LeaveRequest;
  viewer: { id: string; role: Role };
  mode: Mode;
  onDecide: (target: DecisionTarget) => void;
  onDelete: (row: LeaveRequest) => void;
}>;

function RowActions({ row, viewer, mode, onDecide, onDelete }: RowActionsProps) {
  const state = decisionState(viewer, row);
  if (state.canDecide) {
    return (
      <>
        <Button size="sm" onClick={() => onDecide({ request: row, decision: 'approve' })}>
          Approve
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDecide({ request: row, decision: 'reject' })}
        >
          Reject
        </Button>
      </>
    );
  }
  // only closed requests can be soft deleted, they never touched a balance
  const deletable =
    mode === 'admin' &&
    !row.deletedAt &&
    (row.status === 'cancelled' || row.status === 'rejected');
  if (deletable) {
    return (
      <Button size="sm" variant="ghost" onClick={() => onDelete(row)}>
        Delete
      </Button>
    );
  }
  return state.reason ? (
    <span className="text-xs whitespace-nowrap text-muted-foreground">
      {state.reason}
    </span>
  ) : null;
}

type ListProps = Readonly<{
  query: UseQueryResult<Paginated<LeaveRequest>>;
  badRange: boolean;
  onlyPending: boolean;
  renderActions: (row: LeaveRequest) => ReactNode;
  detailHref?: (row: LeaveRequest) => string;
}>;

function RequestsList({
  query,
  badRange,
  onlyPending,
  renderActions,
  detailHref,
}: ListProps) {
  const dispatch = useAppDispatch();

  if (badRange) {
    return <EmptyState title="Fix the date range to see requests" />;
  }
  if (query.isPending) return <TableSkeleton />;
  if (query.isError) {
    return <QueryErrorAlert error={query.error} onRetry={() => void query.refetch()} />;
  }
  if (query.data.total === 0) {
    if (onlyPending) {
      return (
        <EmptyState title="No pending requests" description="You're all caught up." />
      );
    }
    return (
      <EmptyState
        title="No requests match these filters"
        action={
          <Button variant="secondary" onClick={() => dispatch(clearTeamFilters())}>
            Clear filters
          </Button>
        }
      />
    );
  }

  const { items, total, page, limit } = query.data;
  return (
    <>
      <RequestsTable
        rows={items}
        stale={query.isPlaceholderData}
        showEmployee
        showReason
        detailHref={detailHref}
        renderActions={renderActions}
      />
      <Pagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={(next) => dispatch(setTeamPage(next))}
      />
    </>
  );
}

// manager "Approvals" and admin "All requests" are the same board with small differences
export function TeamRequests({ mode }: Readonly<{ mode: Mode }>) {
  const { user } = useAuth();
  const toast = useToast();
  const filter = useAppSelector((state) => state.requestFilters.team);
  const badRange = hasBadRange(filter);
  const query = toTeamQuery(
    mode === 'admin' ? filter : { ...filter, includeDeleted: false },
    PAGE_SIZE,
  );
  const requests = useTeamRequests(query, !badRange);
  const approve = useApproveRequest();
  const reject = useRejectRequest();
  const remove = useRemoveRequest();
  const [target, setTarget] = useState<DecisionTarget | null>(null);
  const [toDelete, setToDelete] = useState<LeaveRequest | null>(null);

  if (!user) return null;
  const viewer = { id: user.id, role: user.role };
  const decision = target?.decision === 'reject' ? reject : approve;
  const onlyPending =
    filter.status === 'pending' && !filter.leaveTypeId && !filter.from && !filter.to;

  function closeDecision() {
    approve.reset();
    reject.reset();
    setTarget(null);
  }

  function decide(comment: string) {
    if (!target) return;
    const verb = target.decision === 'reject' ? 'Rejected' : 'Approved';
    const name = target.request.employee.name;
    decision.mutate(
      { id: target.request.id, comment: comment || undefined },
      {
        onSuccess: () => {
          setTarget(null);
          toast(`${verb} ${name}'s leave`);
        },
      },
    );
  }

  function confirmDelete() {
    if (!toDelete) return;
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null);
        toast('Request deleted, it is hidden from the default list');
      },
    });
  }

  return (
    <>
      <RequestFilters allowDeleted={mode === 'admin'} />
      <RequestsList
        query={requests}
        badRange={badRange}
        onlyPending={onlyPending}
        detailHref={mode === 'manager' ? (row) => `/leave/${row.id}` : undefined}
        renderActions={(row) => (
          <RowActions
            row={row}
            viewer={viewer}
            mode={mode}
            onDecide={setTarget}
            onDelete={setToDelete}
          />
        )}
      />
      <DecisionDialog
        target={target}
        pending={decision.isPending}
        error={decision.isError ? errorMessage(decision.error) : null}
        onSubmit={decide}
        onClose={closeDecision}
      />
      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this request?"
        description="It is a soft delete: hidden from lists, still kept in the database."
        confirmLabel="Delete"
        danger
        pending={remove.isPending}
        error={remove.isError ? errorMessage(remove.error) : null}
        onConfirm={confirmDelete}
        onClose={() => {
          remove.reset();
          setToDelete(null);
        }}
      />
    </>
  );
}
