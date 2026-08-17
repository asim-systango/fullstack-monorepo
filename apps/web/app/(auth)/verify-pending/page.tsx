'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Alert, Button } from '@shared/ui/components';
import { AuthLayout } from '@/components/splitter';
import { useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';

export default function VerifyPendingPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  async function resend() {
    const email = user?.email;
    if (!email) return;
    try {
      const res = await authApi.resendVerification({ email });
      setMessage(res.message);
    } catch {
      setMessage('If that email is unverified, we sent a new link.');
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="One more step before you can use Splitter"
    >
      <Alert tone="info">
        Your account is not verified yet. Check your inbox for the verification link we
        sent when you registered.
      </Alert>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      <div className="mt-6 flex flex-wrap gap-2">
        {user?.email ? (
          <Button variant="secondary" onClick={() => void resend()}>
            Resend verification email
          </Button>
        ) : null}
        <Link href="/login">
          <Button variant="ghost">Back to login</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
