'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type SyntheticEvent } from 'react';
import { ApiClientError } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      if (
        err instanceof ApiClientError &&
        (err.statusCode === 401 || err.statusCode === 400)
      ) {
        setError(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
      } else {
        setError(AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-950 text-zinc-100 p-6 overflow-hidden">
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <Link href="/" className="flex items-center space-x-3 mb-8 group cursor-pointer">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 p-[1px] shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center font-bold text-violet-400 text-xl tracking-wider">
              S
            </div>
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            Systango<span className="text-violet-400 font-medium">.crm</span>
          </span>
        </Link>

        <div className="w-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Access Account
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Sign in with your administrator credentials.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="superadmin@crm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg cursor-pointer"
            >
              {pending ? 'Processing...' : 'Continue to Dashboard'}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
