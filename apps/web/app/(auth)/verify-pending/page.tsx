'use client';

import Link from 'next/link';
import { Alert, Button } from '@shared/ui/components';
import { AuthLayout } from '@/components/splitter';

export default function VerifyPendingPage() {
  return (
    <AuthLayout
      title="Verify your email"
      subtitle="One more step before you can use Splitter"
    >
      <Alert tone="info">
        Your account is not verified yet. Check your inbox for the verification link we
        sent when you registered.
      </Alert>
      <Link href="/login" className="mt-6 inline-block">
        <Button variant="secondary">Back to login</Button>
      </Link>
    </AuthLayout>
  );
}
