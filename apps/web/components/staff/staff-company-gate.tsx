'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import { Spinner } from '@/components/ui';
import { getMyCompany } from '@/lib/api/companies-api';
import { getErrorStatus } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';

/** Staff routes (except setup): redirect to /company/setup when GET /companies/me 404s. */
export function StaffCompanyGate({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const skip = pathname === '/company/setup';

  const { isLoading, isError, error, isSuccess } = useQuery({
    queryKey: queryKeys.companyMe,
    queryFn: getMyCompany,
    enabled: !skip,
    retry: false,
  });

  useEffect(() => {
    if (skip) return;
    if (isError && getErrorStatus(error) === 404) {
      router.replace('/company/setup');
    }
  }, [skip, isError, error, router]);

  if (skip) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Checking company profile" />
      </div>
    );
  }

  if (isError && getErrorStatus(error) === 404) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Redirecting to company setup" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-feed px-4 py-8 text-sm text-danger">
        Could not load company profile. Refresh and try again.
      </div>
    );
  }

  if (!isSuccess) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}
