'use client';

import { LoadingState } from '@shared/ui/components';
import { AuthLayout } from './auth-layout';

export function AuthPageFallback({ title }: Readonly<{ title: string }>) {
  return (
    <AuthLayout title={title} subtitle="Loading…">
      <div className="auth-form-body py-8">
        <LoadingState variant="block" label="Loading…" />
      </div>
    </AuthLayout>
  );
}
