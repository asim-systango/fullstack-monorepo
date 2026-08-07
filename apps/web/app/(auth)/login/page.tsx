'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type SyntheticEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ApiClientError } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { BrandMark } from '@/components/layout';
import { RoleBadge } from '@/components/food/role-badge';
import { ThemeToggle } from '@/components/theme';
import { MOCK_USERS } from '@/lib/mock/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/restaurants';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError('');
    try {
      const user = await login({ email, password });
      if (user.role === 'staff') router.push('/restaurant/dashboard');
      else if (user.role === 'admin') router.push('/admin');
      else router.push(returnTo.startsWith('/') ? returnTo : '/restaurants');
    } catch (err) {
      setError(err instanceof ApiClientError || err instanceof Error ? err.message : 'Login failed');
    } finally {
      setPending(false);
    }
  }

  async function quickLogin(demoEmail: string) {
    const account = MOCK_USERS.find((u) => u.email === demoEmail);
    if (!account) return;
    setEmail(demoEmail);
    setPassword(account.password);
    setPending(true);
    setError('');
    try {
      const user = await login({ email: demoEmail, password: account.password });
      if (user.role === 'staff') router.push('/restaurant/dashboard');
      else if (user.role === 'admin') router.push('/admin');
      else router.push('/restaurants');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setPending(false);
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

      <form onSubmit={(e) => void submit(e)}>
        <label className="tg-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          className="tg-input"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 14 }}
          required
        />
        <label className="tg-label" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          className="tg-input"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: error ? 10 : 18 }}
          required
        />
        {error ? (
          <p style={{ fontSize: 12.5, color: 'var(--tg-danger-fg)', margin: '0 0 14px' }}>{error}</p>
        ) : null}
        <button
          className="tg-btn tg-btn-primary"
          type="submit"
          disabled={pending}
          style={{ width: '100%', height: 42 }}
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 14px' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--tg-border)' }} />
        <span style={{ fontSize: 11.5, color: 'var(--tg-text-faint)' }}>staging demo accounts</span>
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
            }}
          >
            <span>Continue as {acc.name}</span>
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
        <Suspense fallback={<p style={{ textAlign: 'center', color: 'var(--tg-text-muted)' }}>Loading…</p>}>
          <LoginForm />
        </Suspense>
        <p
          style={{
            textAlign: 'center',
            fontSize: 11.5,
            color: 'var(--tg-text-faint)',
            marginTop: 16,
          }}
        >
          Demo environment · password123 for all accounts
        </p>
      </div>
    </div>
  );
}
