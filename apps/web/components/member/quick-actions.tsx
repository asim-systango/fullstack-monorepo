import Link from 'next/link';
import { ROUTES } from '@/lib/auth/routes';

const ACTIONS = [
  { href: ROUTES.books, label: 'Browse Books' },
  { href: ROUTES.myLoans, label: 'My Loans' },
  { href: ROUTES.myReservations, label: 'My Reservations' },
  { href: ROUTES.myFines, label: 'My Fines' },
] as const;

export function QuickActions() {
  return (
    <nav aria-label="Quick actions" className="member-card p-2">
      <ul className="m-0 grid list-none gap-1 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-[color:var(--bookly-navy)] no-underline transition-colors hover:bg-[color-mix(in_srgb,var(--bookly-teal)_10%,#fff)] hover:no-underline"
            >
              {action.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
