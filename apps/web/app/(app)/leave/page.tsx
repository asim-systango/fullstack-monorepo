'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { Button, EmptyState, Field, Select, Skeleton } from '@shared/ui/components';
import { QueryErrorAlert, TableSkeleton } from '@/components/feedback';
import { AppPage, ButtonLink } from '@/components/layout';
import { BalanceCards, Pagination, RequestsTable } from '@/components/leave';
import { STATUS_LABEL } from '@/lib/leave/format';
import { useMyBalances, useMyRequests } from '@/lib/leave/queries';
import {
  LEAVE_STATUSES,
  type Balance,
  type LeaveRequest,
  type LeaveStatus,
  type Paginated,
} from '@/lib/leave/types';
import { setMyPage, setMyStatus, useAppDispatch, useAppSelector } from '@/lib/store';

const PAGE_SIZE = 10;

function BalancesSection({ query }: Readonly<{ query: UseQueryResult<Balance[]> }>) {
  if (query.isPending) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton size="lg" />
        <Skeleton size="lg" />
        <Skeleton size="lg" />
      </div>
    );
  }
  if (query.isError) {
    return <QueryErrorAlert error={query.error} onRetry={() => void query.refetch()} />;
  }
  return <BalanceCards balances={query.data} />;
}

type RequestsSectionProps = Readonly<{
  query: UseQueryResult<Paginated<LeaveRequest>>;
  status: LeaveStatus | '';
}>;

function RequestsSection({ query, status }: RequestsSectionProps) {
  const dispatch = useAppDispatch();

  if (query.isPending) return <TableSkeleton />;
  if (query.isError) {
    return <QueryErrorAlert error={query.error} onRetry={() => void query.refetch()} />;
  }

  const { items, total, page, limit } = query.data;
  if (total === 0 && !status) {
    return (
      <EmptyState
        title="You haven't applied for leave yet"
        description="Your requests and their status will show up here."
        action={<ButtonLink href="/leave/new">Apply</ButtonLink>}
      />
    );
  }
  if (total === 0) {
    return (
      <EmptyState
        title={`No ${STATUS_LABEL[status as LeaveStatus].toLowerCase()} requests`}
        action={
          <Button variant="secondary" onClick={() => dispatch(setMyStatus(''))}>
            Show all requests
          </Button>
        }
      />
    );
  }

  return (
    <>
      <RequestsTable
        rows={items}
        stale={query.isPlaceholderData}
        detailHref={(row) => `/leave/${row.id}`}
      />
      <Pagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={(next) => dispatch(setMyPage(next))}
      />
    </>
  );
}

export default function MyLeavePage() {
  const dispatch = useAppDispatch();
  const { status, page } = useAppSelector((state) => state.requestFilters.mine);
  const balances = useMyBalances();
  const requests = useMyRequests({ page, limit: PAGE_SIZE, status: status || undefined });

  return (
    <AppPage
      title="My leave"
      description={`Your balances for ${new Date().getFullYear()} and your requests`}
      actions={<ButtonLink href="/leave/new">Apply for leave</ButtonLink>}
    >
      <section aria-labelledby="balances-title">
        <h2
          id="balances-title"
          className="mt-0 mb-3 text-base font-semibold text-foreground"
        >
          Balances
        </h2>
        <BalancesSection query={balances} />
      </section>

      <section aria-labelledby="requests-title" className="mt-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 id="requests-title" className="m-0 text-base font-semibold text-foreground">
            My requests
          </h2>
          <Field label="Status" htmlFor="my-status" className="mb-0 w-48">
            <Select
              id="my-status"
              value={status}
              onChange={(e) => dispatch(setMyStatus(e.target.value as LeaveStatus | ''))}
            >
              <option value="">All</option>
              {LEAVE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <RequestsSection query={requests} status={status} />
      </section>
    </AppPage>
  );
}
