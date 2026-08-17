'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Alert, Button, Skeleton } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { RequireRole } from '@/components/dashboard/require-role';
import { StaffEmptyState, StaffLoanRow, StaffPageHeader } from '@/components/staff';
import { toUserMessage } from '@/lib/auth/errors';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { librarianCheckoutPath, librarianReturnsPath } from '@/lib/auth/routes';
import { useMember, useMemberLoanSummary } from '@/lib/bookly';
import { formatMoneyInr } from '@/lib/member/format';
import { firstRouteParam } from '@/lib/staff';

function MemberDetailContent() {
  const { user } = useAuth();
  const isStaff = hasRole(user, [ROLES.staff]);
  const params = useParams<{ userId: string }>();
  const userId = firstRouteParam(params.userId);
  const member = useMember(userId || undefined);
  const summary = useMemberLoanSummary(userId || undefined);

  if (!userId) {
    return (
      <div className="staff-content">
        <StaffPageHeader title="Member" />
        <Alert tone="danger" title="Could not load member">
          This member link is missing an ID.
        </Alert>
      </div>
    );
  }

  if (member.isPending) {
    return (
      <div className="staff-content">
        <StaffPageHeader title="Member" />
        <Skeleton size="lg" />
      </div>
    );
  }

  if (member.isError || !member.data) {
    return (
      <div className="staff-content">
        <StaffPageHeader title="Member" />
        <Alert tone="danger" title="Could not load member">
          {toUserMessage(member.error)}
        </Alert>
        <div className="mt-3">
          <Button type="button" variant="secondary" onClick={() => void member.refetch()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const profile = member.data;
  const activeLoans = profile.loans.filter(
    (loan): loan is typeof loan & { book: NonNullable<typeof loan.book>; bookCopy: NonNullable<typeof loan.bookCopy> } =>
      Boolean(!loan.returnedAt && loan.book && loan.bookCopy),
  );

  return (
    <div className="staff-content">
      <StaffPageHeader
        title={profile.fullName}
        description={profile.email}
        actions={
          isStaff ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href={librarianCheckoutPath(profile.userId)}
                className="ui-button ui-button-sm ui-button-primary no-underline hover:no-underline"
              >
                Checkout
              </Link>
              <Link
                href={librarianReturnsPath(profile.userId)}
                className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
              >
                Return
              </Link>
            </div>
          ) : undefined
        }
      />

      <section className="staff-card mb-4">
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="staff-metric-label">Member ID</p>
            <p className="m-0 break-all font-mono text-sm">{profile.userId}</p>
          </div>
          <div>
            <p className="staff-metric-label">Status</p>
            <p className="m-0 text-sm">{profile.status}</p>
          </div>
          <div>
            <p className="staff-metric-label">Active loans</p>
            <p className="m-0 text-sm">
              {summary.data
                ? `${summary.data.activeLoanCount} / ${summary.data.maxActiveLoans}`
                : profile.activeLoanCount}
            </p>
          </div>
          <div>
            <p className="staff-metric-label">Outstanding fines</p>
            <p className="m-0 text-sm">{formatMoneyInr(profile.outstandingBalanceCents)}</p>
          </div>
        </div>
      </section>

      <section className="staff-card">
        <div className="p-4 pb-2">
          <h2 className="staff-section-title">Active loans</h2>
          <p className="staff-section-desc">Open loans for this member.</p>
        </div>
        <div className="px-4 pb-4">
          {activeLoans.length === 0 ? (
            <StaffEmptyState
              title="No active loans"
              description="This member does not currently have a book out."
            />
          ) : (
            <ul className="m-0 list-none p-0">
              {activeLoans.map((loan) => (
                <StaffLoanRow
                  key={loan.id}
                  loan={{
                    ...loan,
                    book: loan.book,
                    bookCopy: loan.bookCopy,
                    fine: null,
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default function LibrarianMemberDetailPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <MemberDetailContent />
    </RequireRole>
  );
}
