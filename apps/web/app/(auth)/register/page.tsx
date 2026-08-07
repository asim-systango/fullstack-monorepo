'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import { ApiClientError } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { BrandMark } from '@/components/layout';
import { ThemeToggle } from '@/components/theme';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isMock } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await register({ name, email, password });
      router.push('/restaurants');
    } catch (err) {
      setError(err instanceof ApiClientError || err instanceof Error ? err.message : 'Register failed');
    } finally {
      setPending(false);
    }
  }

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
      <div style={{ position: 'absolute', top: 20, right: 24 }}>
        <ThemeToggle />
      </div>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <BrandMark />
        </div>
        <div className="tg-card" style={{ padding: 26, boxShadow: 'var(--tg-shadow-sm)' }}>
          <p style={{ fontSize: 17, fontWeight: 500, margin: '0 0 4px', color: 'var(--tg-text)' }}>
            Create account
          </p>
          <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: '0 0 18px' }}>
            {isMock ? 'Mock mode — stored in this browser only.' : 'Register to order food.'}
          </p>
          <form onSubmit={(e) => void onSubmit(e)}>
            <label className="tg-label">Name</label>
            <input className="tg-input" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 12 }} required />
            <label className="tg-label">Email</label>
            <input className="tg-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 12 }} required />
            <label className="tg-label">Password</label>
            <input className="tg-input" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: 16 }} required />
            {error ? <p style={{ color: 'var(--tg-danger-fg)', fontSize: 12.5 }}>{error}</p> : null}
            <button type="submit" className="tg-btn tg-btn-primary" disabled={pending} style={{ width: '100%', height: 42 }}>
              {pending ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--tg-text-muted)' }}>
            Already registered? <Link href="/login" style={{ color: 'var(--tg-brand-accent)' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
