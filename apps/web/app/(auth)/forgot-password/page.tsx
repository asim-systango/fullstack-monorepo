'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import { Button, Field, Form, StatusMessage, TextInput } from '@shared/ui/components';
import { AuthCard, AuthFormFooter, AuthLayout, useAuthForm } from '@/components/auth';
import { useForgotPassword } from '@/lib/auth/hooks';
import { ROUTES } from '@/lib/auth/routes';
import { useAuthUi } from '@/lib/store';
import { forgotPasswordSchema } from '@/lib/validation/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const forgotPassword = useForgotPassword();
  const { setPendingEmail } = useAuthUi();
  const { pending, error, fieldErrors, submit } = useAuthForm();
  const [email, setEmail] = useState('');

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    await submit({
      schema: forgotPasswordSchema,
      values: { email },
      onValid: async (values) => {
        await forgotPassword.mutateAsync({ email: values.email });
        setPendingEmail(values.email);
        router.push(`${ROUTES.resetPassword}?email=${encodeURIComponent(values.email)}`);
      },
    });
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your verified email and we will send a reset code if an account exists."
    >
      <AuthCard title="Reset your password">
        <Form pending={pending} onSubmit={onSubmit}>
          <Field
            label="Email address"
            htmlFor="forgot-email"
            required
            disabled={pending}
            error={fieldErrors.email}
          >
            <TextInput
              id="forgot-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button type="submit" loading={pending} loadingText="Sending…">
            Send reset code →
          </Button>
        </Form>
        <AuthFormFooter>
          <Link href={ROUTES.login}>Back to login</Link>
        </AuthFormFooter>
      </AuthCard>
    </AuthLayout>
  );
}
