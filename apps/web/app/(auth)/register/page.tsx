'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type SyntheticEvent } from 'react';
import {
  Button,
  Field,
  Form,
  TextInput,
  StatusMessage,
  LoadingState,
  Card,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { ShellHeader, useAuth } from '@/components/auth';
import { useRegister } from '@/features/auth/hooks/use-auth';
import { registerSchema } from '@/features/auth/validators';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const registerMutation = useRegister();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState label="Redirecting to dashboard..." />
      </div>
    );
  }

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validation = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || 'Invalid form data';
      setError(firstError);
      return;
    }

    try {
      await registerMutation.mutateAsync({
        firstName,
        lastName,
        email,
        phone: phone.trim() || undefined,
        password,
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ShellHeader />

      <main className="flex flex-1 items-center justify-center p-6 my-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Create Patient Account
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              Register as a patient to book appointments and manage your healthcare
            </p>
          </div>

          <Card className="p-6">
            <Form
              pending={registerMutation.isPending}
              onSubmit={onSubmit}
              className="space-y-3.5"
            >
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First Name"
                  htmlFor="reg-fname"
                  required
                  disabled={registerMutation.isPending}
                >
                  <TextInput
                    id="reg-fname"
                    name="firstName"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Field>
                <Field
                  label="Last Name"
                  htmlFor="reg-lname"
                  required
                  disabled={registerMutation.isPending}
                >
                  <TextInput
                    id="reg-lname"
                    name="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Field>
              </div>

              <Field
                label="Email Address"
                htmlFor="reg-email"
                required
                disabled={registerMutation.isPending}
              >
                <TextInput
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field
                label="Phone Number"
                htmlFor="reg-phone"
                disabled={registerMutation.isPending}
              >
                <TextInput
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>

              <Field
                label="Password"
                htmlFor="reg-password"
                required
                hint="8+ chars with uppercase, lowercase, number, special char"
                disabled={registerMutation.isPending}
              >
                <TextInput
                  id="reg-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>

              <Field
                label="Confirm Password"
                htmlFor="reg-confirm"
                required
                disabled={registerMutation.isPending}
              >
                <TextInput
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>

              {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

              <Button
                type="submit"
                variant="primary"
                loading={registerMutation.isPending}
                loadingText="Registering…"
                className="w-full mt-2"
              >
                Create Account
              </Button>
            </Form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in instead
              </Link>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
