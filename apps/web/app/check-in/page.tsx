'use client';

import { ShellHeader } from '@/components/auth';
import { Alert, LoadingState, PageHeader } from '@shared/ui/components';
import { ScannerWidget } from '@/components/ScannerWidget';
import { useAuth } from '@/components/auth/auth-provider';

export default function CheckInPage() {
  const { user, loading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ShellHeader />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <LoadingState label="Authenticating session..." />
        </main>
      </div>
    );
  }

  const isStaff = user?.role === 'admin' || user?.role === 'staff';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShellHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
        <PageHeader
          title="Staff Ticket Check-In Tool"
          description="Scan or input attendee QR payload strings to verify ticket validity and record single-entry check-ins"
        />

        {!isStaff ? (
          <Alert tone="danger" title="Access Restricted">
            The check-in tool is reserved for Staff and Admin event staff. Please log in as staff@demo.local.
          </Alert>
        ) : (
          <ScannerWidget />
        )}
      </main>
    </div>
  );
}
