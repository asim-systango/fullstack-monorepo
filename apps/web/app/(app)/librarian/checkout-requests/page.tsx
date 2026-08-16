'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import type { CheckoutRequestStatus } from '@shared/types';
import { Alert, Button, Field, Select, TextInput } from '@shared/ui/components';
import { RequireRole } from '@/components/dashboard/require-role';
import {
  StaffListStatus,
  StaffPageHeader,
  StaffPagination,
} from '@/components/staff';
import { useAuth } from '@/components/auth';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { librarianCheckoutRequestPath } from '@/lib/auth/routes';
import { useCheckoutRequests } from '@/lib/bookly';
import { formatDateTime } from '@/lib/member';
import { useDebouncedUrlQuery, useStaffListParams } from '@/lib/staff';

const PAGE_SIZE = 20;

function CheckoutRequestsContent() {
  const { user } = useAuth();
  const isStaff = hasRole(user, [ROLES.staff]);
  const { get, page, replace, setPage, clear, hasFilters } = useStaffListParams();
  const search = useDebouncedUrlQuery('q');
  const status = (get('status') || 'pending') as CheckoutRequestStatus;

  const requests = useCheckoutRequests({
    page,
    limit: PAGE_SIZE,
    status,
    q: search.committed || undefined,
  });

  return (
    <div className="staff-content">
      <StaffPageHeader
        title="Checkout Requests"
        description="Review member requests, then issue or reject from the request detail."
      />

      {!isStaff ? (
        <div className="mb-4">
          <Alert tone="info" title="Issue is staff-only">
            You can view requests. Issuing a copy is a staff desk operation.
          </Alert>
        </div>
      ) : null}

      <section className="staff-card staff-card-operational">
        <div className="staff-panel-body">
          <div className="staff-filter-row staff-filter-row-4">
            <Field label="Search" htmlFor="requests-q">
              <TextInput
                id="requests-q"
                value={search.value}
                onChange={(e) => search.setValue(e.target.value)}
                placeholder="Member or title…"
                autoComplete="off"
              />
            </Field>
            <Field label="Status" htmlFor="requests-status">
              <Select
                id="requests-status"
                value={status}
                onChange={(e) => replace({ status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </Field>
            {hasFilters || search.value ? (
              <div className="flex items-end">
                <Button type="button" size="sm" variant="secondary" onClick={clear}>
                  Clear filters
                </Button>
              </div>
            ) : null}
          </div>

          <StaffListStatus
            isPending={requests.isPending}
            isError={requests.isError}
            error={requests.error}
            isEmpty={!requests.data || requests.data.items.length === 0}
            hasFilters={Boolean(search.committed) || status !== 'pending'}
            emptyTitle="No pending checkout requests"
            emptyDescription="Members will appear here after they request an available title."
            filteredTitle="No matching requests"
            onRetry={() => void requests.refetch()}
            onClearFilters={clear}
          >
            <div className="staff-table-wrap">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Book</th>
                    <th>Requested</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {requests.data?.items.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <p className="m-0 font-medium">{request.member?.fullName ?? 'Member'}</p>
                        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                          {request.member?.email}
                        </p>
                      </td>
                      <td>{request.book.title}</td>
                      <td>{formatDateTime(request.createdAt)}</td>
                      <td>{request.status}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={librarianCheckoutRequestPath(request.id)}
                            className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
                          >
                            View
                          </Link>
                          {isStaff && request.status === 'pending' ? (
                            <Link
                              href={librarianCheckoutRequestPath(request.id)}
                              className="ui-button ui-button-sm ui-button-primary no-underline hover:no-underline"
                            >
                              Issue Book
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <StaffPagination
              page={page}
              total={requests.data?.total ?? 0}
              limit={PAGE_SIZE}
              onPage={setPage}
            />
          </StaffListStatus>
        </div>
      </section>
    </div>
  );
}

export default function LibrarianCheckoutRequestsPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <Suspense
        fallback={
          <div className="staff-content">
            <StaffPageHeader title="Checkout Requests" />
          </div>
        }
      >
        <CheckoutRequestsContent />
      </Suspense>
    </RequireRole>
  );
}
