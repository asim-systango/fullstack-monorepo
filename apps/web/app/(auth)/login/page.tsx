'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { User } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { BrandMark } from '@/components/layout';
import { RoleBadge } from '@/components/food/role-badge';
import { ThemeToggle } from '@/components/theme';
import { PasswordInput } from '@/components/ui/password-input';
import { homePathForRole } from '@/lib/auth-routes';
import { useFormErrors } from '@/lib/hooks/use-form-errors';
import { MOCK_USERS } from '@/lib/mock/auth';
import { toastApiError } from '@/lib/toast';
import { parseLogin } from '@/lib/validation/food-delivery';

function LoginForm() {
  const router = useRouter();
  const { login: loginAccount, isMock, pendingAction } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { errors, applyParse } = useFormErrors();
  const pending = pendingAction === 'login';

  function goHome(role: User['role']) {
    router.replace(homePathForRole(role));
  }

  function syncValidation(nextEmail: string, nextPassword: string, forceShow = false) {
    return applyParse(parseLogin({ email: nextEmail, password: nextPassword }), forceShow);
  }

  async function submit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!syncValidation(email, password, true)) return;
    try {
      const user = await loginAccount({ email: email.trim(), password });
      goHome(user.role);
    } catch (err) {
      toastApiError(err);
    }
  }

  async function quickLogin(demoEmail: string) {
    const account = MOCK_USERS.find((u) => u.email === demoEmail);
    if (!account) return;
    setEmail(demoEmail);
    setPassword(account.password);
    syncValidation(demoEmail, account.password, true);
    try {
      const user = await loginAccount({ email: demoEmail, password: account.password });
      goHome(user.role);
    } catch (err) {
      toastApiError(err);
    }
  }

  return (
    <div className="tg-card" style={{ padding: '26px 26px 22px', boxShadow: 'var(--tg-shadow-sm)' }}>
      <p style={{ fontSize: 17, fontWeight: 500, color: 'var(--tg-text)', margin: '0 0 4px' }}>
        Sign in
      </p>
      <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: '0 0 20px' }}>
        Access your account to order, manage a kitchen, or run the platform.
      </p>

      <form
        method="post"
        action="#"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(e);
        }}
        noValidate
      >
        <label className="tg-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          className={`tg-input${errors.email ? ' tg-input-invalid' : ''}`}
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            const next = e.target.value;
            setEmail(next);
            syncValidation(next, password);
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
        />
        {errors.email ? (
          <p id="login-email-error" className="tg-field-error" style={{ marginBottom: 10 }}>
            {errors.email}
          </p>
        ) : (
          <div style={{ marginBottom: 14 }} />
        )}

        <label className="tg-label" htmlFor="login-password">
          Password
        </label>
        <PasswordInput
          id="login-password"
          invalid={Boolean(errors.password)}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            const next = e.target.value;
            setPassword(next);
            syncValidation(email, next);
          }}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'login-password-error' : undefined}
          autoComplete="current-password"
        />
        {errors.password ? (
          <p id="login-password-error" className="tg-field-error" style={{ marginBottom: 14 }}>
            {errors.password}
          </p>
        ) : (
          <div style={{ marginBottom: 18 }} />
        )}

        <button
          className="tg-btn tg-btn-primary"
          type="submit"
          disabled={pending}
          style={{ width: '100%', height: 42 }}
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: 13, color: 'var(--tg-text-muted)' }}>
        New here?{' '}
        <Link
          href="/register"
          prefetch={false}
          style={{ color: 'var(--tg-brand-accent)' }}
          onClick={(e) => {
            e.preventDefault();
            router.push('/register');
          }}
        >
          Create an account
        </Link>
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 14px' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--tg-border)' }} />
        <span style={{ fontSize: 11.5, color: 'var(--tg-text-faint)' }}>
          {isMock ? 'mock demo accounts' : 'demo accounts (seed)'}
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--tg-border)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MOCK_USERS.map((acc) => (
          <button
            key={acc.email}
            type="button"
            disabled={pending}
            onClick={() => void quickLogin(acc.email)}
            className="tg-btn tg-btn-secondary"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              padding: '9px 12px',
              textAlign: 'left',
            }}
          >
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span>Continue as {acc.name}</span>
              <span style={{ fontSize: 11, color: 'var(--tg-text-faint)' }}>
                {acc.email}
                {acc.restaurant ? ` · ${acc.restaurant}` : ''}
              </span>
            </span>
            <RoleBadge role={acc.role} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="tg-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 20, left: 24 }}>
        <Link href="/" className="tg-btn tg-btn-ghost" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back
        </Link>
      </div>
      <div style={{ position: 'absolute', top: 20, right: 24 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 380 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'center',
            marginBottom: 28,
          }}
        >
          <BrandMark />
        </div>
        <LoginForm />
        <p
          style={{
            textAlign: 'center',
            fontSize: 11.5,
            color: 'var(--tg-text-faint)',
            marginTop: 16,
          }}
        >
          Demo logins · strong passwords (e.g. Admin@123)
        </p>
      </div>
    </div>
  );
}
