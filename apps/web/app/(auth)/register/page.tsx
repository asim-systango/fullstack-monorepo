'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Form,
  PasswordInput,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';
import { getHomeHref } from '@/lib/role-home';
import {
  getEmailError,
  getPasswordError,
  getRequiredError,
  isValidEmail,
} from '@/lib/validation';
import { BicepsFlexed } from 'lucide-react';

const PASSWORD_MIN_LENGTH = 8;

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function validate(): boolean {
    const nextNameError = getRequiredError(name, 'Name');
    const nextEmailError = getEmailError(email);
    const nextPasswordError = getPasswordError(password, PASSWORD_MIN_LENGTH);

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    return !nextNameError && !nextEmailError && !nextPasswordError;
  }

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);
    if (!validate()) return;

    setPending(true);
    try {
      await authApi.register({ name, email, password });
      const loggedInUser = await authApi.login({ email, password });
      await refresh();
      router.push(getHomeHref(loggedInUser.role));
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Register failed');
      setPending(false);
    }
  }

  return (
    <div className="ui-auth-screen">
      <p className="ui-auth-brand flex items-center gap-1">
        <BicepsFlexed className="text-black" size={30} />
        Fitness
      </p>
      <Card className="ui-auth-card">
        <CardHeader className="text-center">
          <CardTitle className="text-xl ">Create your account</CardTitle>
          <CardDescription className="text-base mb-4">
            Sign up to get started
          </CardDescription>
        </CardHeader>
        <Form pending={pending} onSubmit={onSubmit} noValidate>
          <Field
            label="Name"
            htmlFor="register-name"
            required
            error={nameError ?? undefined}
            disabled={pending}
            className="mb-6"
          >
            <TextInput
              id="register-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameError(getRequiredError(name, 'Name'))}
              autoComplete="name"
            />
          </Field>
          <Field
            label="Email"
            htmlFor="register-email"
            required
            error={emailError ?? undefined}
            disabled={pending}
            className="mb-6"
          >
            <TextInput
              id="register-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (email.trim()) {
                  setEmailError(
                    isValidEmail(email) ? null : 'Enter a valid email address',
                  );
                }
              }}
              autoComplete="email"
            />
          </Field>
          <Field
            label="Password"
            htmlFor="register-password"
            required
            hint={`At least ${PASSWORD_MIN_LENGTH} characters`}
            error={passwordError ?? undefined}
            disabled={pending}
            className="mb-6"
          >
            <PasswordInput
              id="register-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() =>
                setPasswordError(getPasswordError(password, PASSWORD_MIN_LENGTH))
              }
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
            />
          </Field>
          {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}
          <Button
            type="submit"
            loading={pending}
            loadingText="Creating…"
            className="w-full"
          >
            Create account
          </Button>
        </Form>
      </Card>
      <p className="ui-auth-footer">
        Already registered? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
