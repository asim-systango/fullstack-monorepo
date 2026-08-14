'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { Alert, Button, Spinner, StatusMessage } from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { AuthLayout } from '@/components/splitter';
import { authApi } from '@/lib/api';

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    void authApi
      .verifyEmail({ token })
      .then(() => {
        setStatus('success');
        setMessage('Your email is verified. You can now log in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof ApiClientError ? err.message : 'Verification failed.');
      });
  }, [token]);

  let body: ReactNode;
  if (status === 'loading') {
    body = <Spinner label="Verifying" />;
  } else if (status === 'success') {
    body = (
      <>
        <Alert tone="success">{message}</Alert>
        <Button className="mt-6" onClick={() => router.push('/login')}>
          Continue to login
        </Button>
      </>
    );
  } else {
    body = (
      <>
        <StatusMessage tone="error">{message}</StatusMessage>
        <Link href="/login" className="mt-4 inline-block text-sm">
          Back to login
        </Link>
      </>
    );
  }

  return <AuthLayout title="Verify email">{body}</AuthLayout>;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Spinner label="Loading" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
