'use client';

import Link from 'next/link';
import { ShellHeader, useAuth } from '@/components/auth';
import { Button, Card, Page } from '@shared/ui/components';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <Page>
      <ShellHeader title="Support Desk Portal" subtitle="Customer & Support Agent Hub" />
      <div className="max-w-3xl space-y-6 mt-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Welcome to Support Desk</h2>
          <p className="text-foreground">
            Get fast, reliable support for your account and services. Submit new tickets,
            track existing issues, and get help from our dedicated support team.
          </p>

          {user ? (
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/tickets">
                <Button variant="primary">Go to My Tickets</Button>
              </Link>
              {(user.role === 'staff' || user.role === 'admin') && (
                <Link href="/agent">
                  <Button variant="secondary">Go to Agent Inbox</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex gap-4 pt-2">
              <Link href="/login">
                <Button variant="primary">Log In</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary">Register Account</Button>
              </Link>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">System Architecture</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Gateway & Domain API:</strong> Cookie-based JWT authentication
              through reverse proxy, backed by NestJS domain API.
            </li>
            <li>
              <strong>State Management:</strong> Server state managed via TanStack Query;
              client draft states managed via Redux Toolkit (RTK).
            </li>
            <li>
              <strong>Design System:</strong> Shared UI design system (`@shared/ui`).
            </li>
          </ul>
        </Card>
      </div>
    </Page>
  );
}
