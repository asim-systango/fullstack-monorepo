'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Skeleton } from '@shared/ui/components';
import { RequireRole } from '@/components/dashboard/require-role';
import {
  CatalogManager,
  CheckoutPanel,
  MemberLookup,
  ReturnPanel,
  StaffEmptyState,
  StaffLoanRow,
  StaffPageHeader,
} from '@/components/staff';
import { useAuth } from '@/components/auth';
import { toUserMessage } from '@/lib/auth/errors';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { useLoans, useOverdueLoans, useCanManageBooks } from '@/lib/bookly';
import { formatMoneyInr } from '@/lib/member/format';
import { useLibraryStore, type DeskPanel } from '@/lib/store';

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function LibrarianDesk() {
  const { user } = useAuth();
  const isStaff = hasRole(user, [ROLES.staff]);
  const canManageBooks = useCanManageBooks();
  const searchParams = useSearchParams();
  const setActiveDeskPanel = useLibraryStore((s) => s.setActiveDeskPanel);

  const overdue = useOverdueLoans({ limit: 12 });
  const activeLoans = useLoans({ limit: 10, status: 'active' });

  useEffect(() => {
    const panel = searchParams.get('panel');
    const hash =
      typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    const target = panel || hash;
    if (!target) return;

    const map: Record<string, { id: string; panel: DeskPanel }> = {
      checkout: { id: 'checkout', panel: 'checkout' },
      return: { id: 'return', panel: 'return' },
      member: { id: 'member-lookup', panel: 'member' },
      'member-lookup': { id: 'member-lookup', panel: 'member' },
      overdue: { id: 'overdue', panel: 'overdue' },
      catalog: { id: 'catalog', panel: 'catalog' },
    };
    const resolved = map[target];
    if (!resolved) return;
    setActiveDeskPanel(resolved.panel);
    requestAnimationFrame(() => scrollToId(resolved.id));
  }, [searchParams, setActiveDeskPanel]);

  return (
    <div className={isStaff ? 'staff-content' : 'mx-auto max-w-5xl'}>
      <StaffPageHeader
        title="Librarian Desk"
        description="Manage circulation, members, returns, and catalog operations."
      />

      {!isStaff ? (
        <div className="mb-4">
          <Alert tone="info" title="Desk lists available">
            Loan and overdue lists work for admin. Checkout, return, and member search are
            staff-only operations.
          </Alert>
        </div>
      ) : null}

      {isStaff ? (
        <div className="staff-desk-actions">
          <button
            type="button"
            className="ui-button ui-button-sm ui-button-primary"
            onClick={() => {
              setActiveDeskPanel('checkout');
              scrollToId('checkout');
            }}
          >
            Checkout Book
          </button>
          <button
            type="button"
            className="ui-button ui-button-sm ui-button-secondary"
            onClick={() => {
              setActiveDeskPanel('return');
              scrollToId('return');
            }}
          >
            Return Book
          </button>
          <button
            type="button"
            className="ui-button ui-button-sm ui-button-secondary"
            onClick={() => {
              setActiveDeskPanel('member');
              scrollToId('member-lookup');
            }}
          >
            Find Member
          </button>
          <button
            type="button"
            className="ui-button ui-button-sm ui-button-secondary"
            onClick={() => {
              setActiveDeskPanel('overdue');
              scrollToId('overdue');
            }}
          >
            View Overdue
          </button>
        </div>
      ) : null}

      {isStaff ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <CheckoutPanel />
          <ReturnPanel />
          <div className="lg:col-span-2">
            <MemberLookup />
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section id="active-loans" className="staff-card staff-card-primary scroll-mt-24">
          <div className="p-4 pb-2">
            <h2 className="staff-section-title">Active loans</h2>
            <p className="staff-section-desc">Books currently checked out.</p>
          </div>
          <div className="px-4 pb-4">
            {activeLoans.isPending ? <Skeleton size="lg" /> : null}
            {activeLoans.isError ? (
              <Alert tone="danger" title="Could not load loans">
                {toUserMessage(activeLoans.error)}
              </Alert>
            ) : null}
            {activeLoans.data && activeLoans.data.items.length === 0 ? (
              <StaffEmptyState
                title="No active loans"
                description="Nothing is currently checked out."
              />
            ) : null}
            {activeLoans.data && activeLoans.data.items.length > 0 ? (
              <ul className="m-0 list-none p-0">
                {activeLoans.data.items.map((loan) => (
                  <StaffLoanRow key={loan.id} loan={loan} />
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section id="overdue" className="staff-card staff-card-warn scroll-mt-24">
          <div className="p-4 pb-2">
            <h2 className="staff-section-title">Overdue loans</h2>
            <p className="staff-section-desc">Past-due items that may need follow-up.</p>
          </div>
          <div className="px-4 pb-4">
            {overdue.isPending ? <Skeleton size="lg" /> : null}
            {overdue.isError ? (
              <Alert tone="danger" title="Unable to load overdue loans">
                {toUserMessage(overdue.error)}
              </Alert>
            ) : null}
            {overdue.data && overdue.data.items.length === 0 ? (
              <StaffEmptyState
                title="No overdue loans"
                description="Everything is currently on schedule."
              />
            ) : null}
            {overdue.data && overdue.data.items.length > 0 ? (
              <ul className="m-0 list-none p-0">
                {overdue.data.items.map((loan) => (
                  <StaffLoanRow
                    key={loan.id}
                    loan={loan}
                    overdueDays={loan.daysLate}
                    fineLabel={
                      loan.fineAmountCents != null
                        ? formatMoneyInr(loan.fineAmountCents)
                        : null
                    }
                  />
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </div>

      {canManageBooks ? (
        <div className="mt-6">
          <CatalogManager />
        </div>
      ) : null}
    </div>
  );
}

function LibrarianDeskFallback() {
  return (
    <div className="staff-content">
      <StaffPageHeader
        title="Librarian Desk"
        description="Manage circulation, members, returns, and catalog operations."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton size="lg" />
        <Skeleton size="lg" />
      </div>
    </div>
  );
}

export default function LibrarianPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <Suspense fallback={<LibrarianDeskFallback />}>
        <LibrarianDesk />
      </Suspense>
    </RequireRole>
  );
}
