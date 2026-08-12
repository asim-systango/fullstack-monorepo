'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type SyntheticEvent } from 'react';
import { ApiClientError } from '@shared/api-client';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  TextInput,
} from '@shared/ui';
import { useAuth } from '@/components/auth';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';
import { useAppDispatch } from '@/lib/store';
import { setPendingPasswordReset } from '@/lib/store/slices/auth-slice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
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
      const res = await login(email.trim(), password);
      if (res.isPasswordChangeRequired || (res.passwordResetToken && !res.accessToken)) {
        if (res.passwordResetToken) {
          dispatch(
            setPendingPasswordReset({
              resetToken: res.passwordResetToken,
              user: res.user,
            }),
          );
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('pendingResetToken', res.passwordResetToken);
            sessionStorage.setItem('pendingResetUser', JSON.stringify(res.user));
          }
        }
        router.push('/update-password');
        return;
      }
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
    <div className="min-h-screen relative flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-6 overflow-hidden select-none font-sans">
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

        {/* Login Card using @shared/ui Card */}
        <Card className="w-full bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl shadow-black/60">
          <CardHeader className="mb-4 text-left p-0">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Enter your work credentials to access your CRM workspace.
            </CardDescription>
          </CardHeader>

          <CardBody className="p-0">
            {/* Error Alert using @shared/ui Alert */}
            {error && (
              <Alert tone="danger" className="mb-5 text-xs">
                {error}
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-4 text-left">
              {/* Email Input using @shared/ui Field & TextInput */}
              <Field label="Work Email" htmlFor="login-email" required>
                <TextInput
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={pending}
                  autoComplete="email"
                />
              </Field>

              {/* Password Input using @shared/ui Field & TextInput */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-1">
                  <span className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Password <span className="text-violet-400">*</span>
                  </span>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <TextInput
                  id="login-password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={pending}
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* Remember Me using @shared/ui Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <Checkbox
                  id="remember-me"
                  label="Remember this device"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              </div>

              {/* Submit Button using @shared/ui Button */}
              <Button
                type="submit"
                variant="primary"
                loading={pending}
                loadingText="Authenticating..."
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-violet-600/20"
              >
                Sign In →
              </Button>
            </form>
          </CardBody>

          <p className="mt-6 text-xs text-zinc-500 text-center">
            Need access to a workspace?{' '}
            <Link
              href="/onboarding-request"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Request Access
            </Link>
          </p>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Systango Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}
