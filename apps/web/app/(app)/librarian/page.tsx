'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@shared/ui/components';
import { RequireRole } from '@/components/dashboard/require-role';
import { LIBRARIAN_ROLES } from '@/lib/auth/roles';
import { ROUTES } from '@/lib/auth/routes';

const PANEL_TARGETS: Record<string, string> = {
  checkout: ROUTES.librarianCheckout,
  return: ROUTES.librarianReturns,
  overdue: ROUTES.librarianOverdue,
  catalog: ROUTES.librarianBooks,
  member: ROUTES.librarianMembers,
  'member-lookup': ROUTES.librarianMembers,
};

function LibrarianRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const panel = searchParams.get('panel');
    const hash = window.location.hash.replace('#', '');
    router.replace(PANEL_TARGETS[panel || hash] ?? ROUTES.dashboard);
  }, [router, searchParams]);

  return (
    <div className="staff-content">
      <Skeleton size="lg" />
    </div>
  );
}

export default function LibrarianPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <Suspense
        fallback={
          <div className="staff-content">
            <Skeleton size="lg" />
          </div>
        }
      >
        <LibrarianRedirect />
      </Suspense>
    </RequireRole>
  );
}
