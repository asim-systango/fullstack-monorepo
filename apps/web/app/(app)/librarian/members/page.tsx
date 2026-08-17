'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import type { MemberListSort, MemberStatus } from '@shared/types';
import { Button, Field, Select, TextInput } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { RequireRole } from '@/components/dashboard/require-role';
import {
  StaffListStatus,
  StaffPageHeader,
  StaffPagination,
} from '@/components/staff';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import {
  librarianCheckoutPath,
  librarianMemberPath,
  librarianReturnsPath,
} from '@/lib/auth/routes';
import { useMembers } from '@/lib/bookly';
import { formatMoneyInr } from '@/lib/member/format';
import { useDebouncedUrlQuery, useStaffListParams } from '@/lib/staff';

const PAGE_SIZE = 20;

function MembersContent() {
  const { user } = useAuth();
  const isStaff = hasRole(user, [ROLES.staff]);
  const { get, page, replace, setPage, clear, hasFilters } = useStaffListParams();
  const search = useDebouncedUrlQuery('q');
  const status = (get('status') || '') as MemberStatus | '';
  const sort = (get('sort') || 'fullName') as MemberListSort;

  const members = useMembers({
    page,
    limit: PAGE_SIZE,
    q: search.committed || undefined,
    status: status || undefined,
    sort: sort === 'fullName' ? undefined : sort,
  });

  return (
    <div className="staff-content">
      <StaffPageHeader
        title="Find Members"
        description={
          isStaff
            ? 'Search the member directory, then open a profile to checkout or return.'
            : 'Search the member directory and review status, loans, and balances.'
        }
      />

      <section className="staff-card">
        <div className="staff-panel-body">
          <div className="staff-filter-row staff-filter-row-4">
            <Field label="Search" htmlFor="members-q">
              <TextInput
                id="members-q"
                value={search.value}
                onChange={(e) => search.setValue(e.target.value)}
                placeholder="Name, email, or member ID…"
                autoComplete="off"
              />
            </Field>
            <Field label="Status" htmlFor="members-status">
              <Select
                id="members-status"
                value={status}
                onChange={(e) => replace({ status: e.target.value || undefined })}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </Select>
            </Field>
            <Field label="Sort" htmlFor="members-sort">
              <Select
                id="members-sort"
                value={sort}
                onChange={(e) =>
                  replace({ sort: e.target.value === 'fullName' ? undefined : e.target.value })
                }
              >
                <option value="fullName">Name A–Z</option>
                <option value="-createdAt">Recently registered</option>
              </Select>
            </Field>
            {hasFilters ? (
              <div className="flex items-end">
                <Button type="button" size="sm" variant="secondary" onClick={clear}>
                  Clear filters
                </Button>
              </div>
            ) : null}
          </div>

          <StaffListStatus
            isPending={members.isPending}
            isError={members.isError}
            error={members.error}
            isEmpty={!members.data || members.data.items.length === 0}
            hasFilters={hasFilters}
            emptyTitle="No members"
            emptyDescription="Registered members will appear here."
            onRetry={() => void members.refetch()}
            onClearFilters={clear}
          >
            <div className="staff-table-wrap">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Member ID</th>
                    <th>Loans</th>
                    <th>Balance</th>
                    <th>Status</th>
                    {isStaff ? <th /> : null}
                  </tr>
                </thead>
                <tbody>
                  {members.data?.items.map((row) => (
                    <tr key={row.userId}>
                      <td>
                        <Link href={librarianMemberPath(row.userId)}>{row.fullName}</Link>
                      </td>
                      <td>{row.email}</td>
                      <td className="font-mono text-xs">{row.userId}</td>
                      <td>
                        {row.activeLoanCount} / {row.maxActiveLoans}
                      </td>
                      <td>{formatMoneyInr(row.outstandingBalanceCents)}</td>
                      <td>{row.status}</td>
                      {isStaff ? (
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={librarianCheckoutPath(row.userId)}
                              className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
                            >
                              Checkout
                            </Link>
                            <Link
                              href={librarianReturnsPath(row.userId)}
                              className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
                            >
                              Return
                            </Link>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <StaffPagination
              page={page}
              total={members.data?.total ?? 0}
              limit={PAGE_SIZE}
              onPage={setPage}
            />
          </StaffListStatus>
        </div>
      </section>
    </div>
  );
}

export default function LibrarianMembersPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <Suspense
        fallback={
          <div className="staff-content">
            <StaffPageHeader title="Find Members" />
          </div>
        }
      >
        <MembersContent />
      </Suspense>
    </RequireRole>
  );
}
