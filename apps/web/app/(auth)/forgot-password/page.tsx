'use client';

import Link from 'next/link';
import { useState, type SyntheticEvent } from 'react';
import { Alert, Button, Card, Field, Form, TextInput } from '@shared/ui/components';
import { AuthLayout } from '@/components/splitter';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      await authApi.forgotPassword({ email });
    } finally {
      setPending(false);
      setDone(true);
    }
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="We'll email you a reset link">
      {done ? (
        <Alert tone="success">
          If that email exists, we sent a password reset link. Check your inbox.
        </Alert>
      ) : (
        <Card className="splitter-shadow border-0 sm:border">
          <Form pending={pending} onSubmit={onSubmit} className="space-y-4">
            <Field label="Email" htmlFor="forgot-email" required>
              <TextInput
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button type="submit" className="w-full" loading={pending}>
              Send reset link
            </Button>
          </Form>
        </Card>
      )}
      <Link href="/login" className="mt-6 inline-block text-sm">
        ← Back to login
      </Link>
    </AuthLayout>
  );
}
