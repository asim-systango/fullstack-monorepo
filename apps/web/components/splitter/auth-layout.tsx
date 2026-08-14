'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthLayout({
  title,
  subtitle,
  children,
}: Readonly<{ title: string; subtitle?: string; children: ReactNode }>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="splitter-brand-gradient relative hidden flex-col justify-between p-10 text-white lg:flex">
        <div>
          <Link
            href="/"
            className="text-2xl font-bold text-white no-underline hover:no-underline"
          >
            Splitter
          </Link>
          <p className="mt-2 max-w-sm text-sm text-white/85">
            Split bills, track balances, and settle up — the simple way to share expenses
            with friends, roommates, and travel groups.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-white/90">
          <li className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/20 text-xs">
              ✓
            </span>
            Add expenses and split equally or by amount
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/20 text-xs">
              ✓
            </span>
            See who owes whom at a glance
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/20 text-xs">
              ✓
            </span>
            Record settlements when you pay someone back
          </li>
        </ul>
      </aside>
      <main className="flex flex-col justify-center px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="text-xl font-bold text-primary no-underline hover:no-underline"
            >
              Splitter
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
