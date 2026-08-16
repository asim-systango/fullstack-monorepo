'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import { Button, Field, Form, StatusMessage, TextInput } from '@shared/ui/components';
import {
  AuthCard,
  AuthFormFooter,
  AuthLayout,
  PasswordField,
  useAuthForm,
} from '@/components/auth';
import { useRegister } from '@/lib/auth/hooks';
import { ROUTES } from '@/lib/auth/routes';
import { useAuthUi } from '@/lib/store';
import { PASSWORD_HINT, registerSchema } from '@/lib/validation/auth';

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const { setPendingEmail } = useAuthUi();
  const { pending, error, fieldErrors, submit } = useAuthForm();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    await submit({
      schema: registerSchema,
      values: { name, email, password, confirmPassword },
      onValid: async (values) => {
        await register.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password,
        });
        setPendingEmail(values.email);
        router.push(`${ROUTES.verifyOtp}?email=${encodeURIComponent(values.email)}`);
      },
    });
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Bookly to browse the catalog, manage loans, and more."
    >
      <AuthCard title="Register">
        <Form pending={pending} onSubmit={onSubmit}>
          <Field
            label="Full name"
            htmlFor="register-name"
            required
            disabled={pending}
            error={fieldErrors.name}
          >
            <TextInput
              id="register-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field
            label="Email address"
            htmlFor="register-email"
            required
            disabled={pending}
            error={fieldErrors.email}
          >
            <TextInput
              id="register-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field
            label="Password"
            htmlFor="register-password"
            required
            hint={PASSWORD_HINT}
            disabled={pending}
            error={fieldErrors.password}
          >
            <PasswordField
              id="register-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          <Field
            label="Confirm password"
            htmlFor="register-confirm"
            required
            disabled={pending}
            error={fieldErrors.confirmPassword}
          >
            <PasswordField
              id="register-confirm"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button type="submit" loading={pending} loadingText="Creating…">
            Create account →
          </Button>
        </Form>
        <AuthFormFooter>
          Already registered? <Link href={ROUTES.login}>Log in</Link>
        </AuthFormFooter>
      </AuthCard>
    </AuthLayout>
  );
}
