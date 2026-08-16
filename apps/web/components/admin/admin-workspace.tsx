'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/auth/routes';
import { AdminLoansPanel } from './admin-loans-panel';
import { AdminPageHeader } from './admin-page-header';

const HUB_CARDS = [
  {
    href: ROUTES.adminMembers,
    title: 'Members',
    description: 'Create members, promote staff, and manage access.',
  },
  {
    href: ROUTES.librarianBooks,
    title: 'Catalog',
    description: 'Browse titles, add books, and register copies.',
  },
  {
    href: ROUTES.adminPolicies,
    title: 'Library policies',
    description: 'Borrowing limits, loan duration, and fine rates.',
  },
  {
    href: ROUTES.adminFines,
    title: 'Fines',
    description: 'Review outstanding balances, mark paid, or waive.',
  },
  {
    href: ROUTES.adminLibrarians,
    title: 'Librarians',
    description: 'See staff accounts with desk access.',
  },
  {
    href: ROUTES.librarianMembers,
    title: 'Find members',
    description: 'Look up status, loans, and balances.',
  },
] as const;

export function AdminWorkspace() {
  return (
    <div className="admin-content">
      <AdminPageHeader
        title="Administration"
        description="Open a dedicated section to manage members, catalog, policies, or fines."
      />

      <div className="admin-hub-grid">
        {HUB_CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="admin-hub-card">
            <p className="admin-section-title">{card.title}</p>
            <p className="admin-section-desc">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5">
        <AdminLoansPanel />
      </div>
    </div>
  );
}
