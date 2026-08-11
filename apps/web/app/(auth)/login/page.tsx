'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type SyntheticEvent } from 'react';
import { ApiClientError } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(AUTH_ERROR_MESSAGES.REQUIRED_FIELDS);
      return;
    }

    setPending(true);
    setError(null);
    try {
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 401 || err.statusCode === 400) {
          setError(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
        } else {
          setError(AUTH_ERROR_MESSAGES.SERVER_ERROR);
        }
      } else {
        setError(AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-950 text-zinc-100 p-6 overflow-hidden select-none font-sans">
      {/* Soft Ambient Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-violet-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Brand Logo Header */}
        <Link href="/" className="flex items-center space-x-3 mb-8 group cursor-pointer">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/35 transition-all">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center font-bold text-violet-400 text-xl tracking-wider">
              S
            </div>
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            Systango<span className="text-violet-400 font-medium">.crm</span>
          </span>
        </Link>

        {/* Login Card */}
        <div className="w-full bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl shadow-black/60">
          <div className="mb-6 text-left">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Enter your work credentials to access your CRM workspace.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium flex items-center space-x-2 animate-in fade-in duration-200">
              <span className="flex-shrink-0 text-base">⚠️</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4 text-left">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-zinc-300 uppercase tracking-wider"
              >
                Work Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all disabled:opacity-50"
                required
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-zinc-300 uppercase tracking-wider"
                >
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all disabled:opacity-50"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-violet-500 focus:ring-offset-zinc-900"
                />
                <span className="text-xs text-zinc-400">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:from-violet-700 active:to-indigo-700 text-white font-semibold text-sm tracking-wide transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {pending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In →</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-xs text-zinc-500 text-center">
            Need access to a workspace? Contact your system administrator.
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Systango Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}
