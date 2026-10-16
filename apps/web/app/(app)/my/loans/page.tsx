'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ListLoansParams } from '@shared/types';
import { Button } from '@shared/ui/components';
import {
  LoanCard,
  MemberContent,
  MemberEmpty,
  MemberError,
  MemberLoadingList,
  MemberPageHeader,
  RequireMember,
} from '@/components/member';
import { ROUTES } from '@/lib/auth/routes';
import { useMyLoans } from '@/lib/bookly';
import { getLoanDueStatus } from '@/lib/member';

type LoanFilter = NonNullable<ListLoansParams['status']> | 'all';

const FILTERS: { id: LoanFilter; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'returned', label: 'Returned' },
  { id: 'all', label: 'All' },
];

function emptyCopyFor(filter: LoanFilter, dueSoonOnly: boolean): { title: string; description: string } {
  if (dueSoonOnly) {
    return {
      title: 'No books due soon',
      description: 'None of your active loans are due within the next 3 days.',
    };
  }
  if (filter === 'overdue') {
    return {
      title: 'No overdue loans',
      description: 'You are up to date — nothing is past its due date.',
    };
  }
  if (filter === 'returned') {
    return {
      title: 'No returned loans',
      description: 'Returned titles will appear here after they are checked in at the desk.',
    };
  }
  if (filter === 'all') {
    return {
      title: 'No loans yet',
      description: 'When you borrow a book, it will appear here.',
    };
  }
  return {
    title: 'No active loans',
    description: "You don't currently have any books checked out.",
  };
}

function parseStatus(value: string | null): LoanFilter {
  if (value === 'overdue' || value === 'returned' || value === 'all' || value === 'active') {
    return value;
  }
  return 'active';
}

function MyLoansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dueSoonOnly, setDueSoonOnly] = useState(searchParams.get('dueSoon') === '1');
  const [status, setStatus] = useState<LoanFilter>(() =>
    searchParams.get('dueSoon') === '1' ? 'active' : parseStatus(searchParams.get('status')),
  );

  const loans = useMyLoans({
    limit: 50,
    status: status === 'all' ? undefined : status,
  });

  const visibleItems = useMemo(() => {
    const items = loans.data?.items ?? [];
    if (!dueSoonOnly) return items;
    return items.filter((loan) => getLoanDueStatus(loan.dueDate).tone === 'dueSoon');
  }, [dueSoonOnly, loans.data?.items]);

  function selectFilter(next: LoanFilter) {
    setDueSoonOnly(false);
    setStatus(next);
    router.replace(`${ROUTES.myLoans}?status=${next}`, { scroll: false });
  }

  const emptyCopy = emptyCopyFor(status, dueSoonOnly);

  return (
    <MemberContent className="space-y-6">
      <MemberPageHeader
        title="My Loans"
        description="Track due dates and overdue titles. Returns happen at the desk."
      />

      <div className="member-filter-tabs member-enter" role="tablist" aria-label="Loan status">
        {FILTERS.map((filter) => {
          const selected = !dueSoonOnly && status === filter.id;
          return (
            <Button
              key={filter.id}
              type="button"
              size="sm"
              role="tab"
              aria-selected={selected}
              variant={selected ? 'primary' : 'secondary'}
              onClick={() => selectFilter(filter.id)}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>

      {dueSoonOnly ? (
        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
          Showing titles due within 3 days.{' '}
          <button
            type="button"
            className="member-inline-link border-0 bg-transparent p-0"
            onClick={() => selectFilter('active')}
          >
            View all active loans
          </button>
        </p>
      ) : null}

      {loans.isPending ? <MemberLoadingList count={3} /> : null}
      {loans.isError ? <MemberError title="Could not load loans" error={loans.error} /> : null}

      {!loans.isPending && !loans.isError && visibleItems.length === 0 ? (
        <MemberEmpty
          title={emptyCopy.title}
          description={emptyCopy.description}
          href={ROUTES.books}
          actionLabel="Browse Books"
        />
      ) : null}

      {visibleItems.length > 0 ? (
        <div className="member-list-stack">
          {visibleItems.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      ) : null}
    </MemberContent>
  );
}

export default function MyLoansPage() {
  return (
    <RequireMember>
      <Suspense
        fallback={
          <MemberContent className="space-y-6">
            <MemberPageHeader title="My Loans" description="Track due dates and overdue titles." />
            <MemberLoadingList count={3} />
          </MemberContent>
        }
      >
        <MyLoansContent />
      </Suspense>
    </RequireMember>
  );
}
