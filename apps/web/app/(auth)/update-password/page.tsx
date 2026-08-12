'use client';

import { useState, useEffect, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiClientError } from '@shared/api-client';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  TextInput,
} from '@shared/ui';
import { authApi, type UserProfile } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { clearPendingPasswordReset } from '@/lib/store/slices/auth-slice';

interface UpdatePasswordFormState {
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_FORM_STATE: UpdatePasswordFormState = {
  newPassword: '',
  confirmPassword: '',
};

export default function UpdatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Redux state selector
  const reduxResetToken = useAppSelector((state) => state.auth.pendingResetToken);
  const reduxUser = useAppSelector((state) => state.auth.pendingUser);

  const [activeToken, setActiveToken] = useState<string | null>(reduxResetToken);
  const [userInfo, setUserInfo] = useState<UserProfile | null>(reduxUser);

  // Consolidated form state object
  const [formState, setFormState] = useState<UpdatePasswordFormState>(INITIAL_FORM_STATE);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Synchronize token and user from Redux store, query param, or sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlToken = searchParams.get('token');
      const sessionToken = sessionStorage.getItem('pendingResetToken');
      const storedUser = sessionStorage.getItem('pendingResetUser');

      const token = reduxResetToken || urlToken || sessionToken;
      if (!token) {
        // No reset session exists, redirect to login
        router.push('/login');
        return;
      }

      setActiveToken(token);

      if (!userInfo) {
        if (reduxUser) {
          setUserInfo(reduxUser);
        } else if (storedUser) {
          try {
            setUserInfo(JSON.parse(storedUser));
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }, [reduxResetToken, reduxUser, searchParams, userInfo, router]);

  function updateFormField<K extends keyof UpdatePasswordFormState>(
    field: K,
    value: UpdatePasswordFormState[K],
  ) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  const hasMinLength = formState.newPassword.length >= 8;
  const passwordsMatch =
    formState.newPassword.length > 0 &&
    formState.newPassword === formState.confirmPassword;
  const isFormValid = hasMinLength && passwordsMatch;

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!activeToken) {
      setError('Password reset session expired. Please log in again.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!passwordsMatch) {
      setError('New password and confirm password do not match.');
      return;
    }

    setPending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await authApi.resetPassword({
        token: activeToken,
        newPassword: formState.newPassword,
      });

      setSuccessMsg(
        response.message ||
          'Password updated successfully! Redirecting you to sign in...',
      );

      // Clean up Redux store and sessionStorage
      dispatch(clearPendingPasswordReset());
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingResetToken');
        sessionStorage.removeItem('pendingResetUser');
      }

      // Smooth redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        const backendMessage = (
          err as unknown as { response?: { data?: { message?: string | string[] } } }
        )?.response?.data?.message;
        const finalMsg = Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage ||
            err.message ||
            'Failed to reset password. Please try again.';
        setError(finalMsg);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-6 overflow-hidden select-none font-sans">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full bg-violet-600/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[28rem] h-[28rem] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <Link href="/" className="flex items-center space-x-3 mb-6 group cursor-pointer">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-amber-400 p-[1px] shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/35 transition-all">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center font-bold text-violet-400 text-xl tracking-wider">
              S
            </div>
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            Systango<span className="text-violet-400 font-medium">.crm</span>
          </span>
        </Link>

        <Card className="w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-6 shadow-2xl shadow-black/70">
          <CardHeader className="mb-4 text-left p-0 space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium w-fit mb-1">
              <span>🔒 First-Time Security Setup</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              Update Your Password
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 leading-relaxed">
              Because this is your initial sign-in, you must create a new password before
              accessing your CRM workspace.
            </CardDescription>

            {userInfo && (
              <div className="mt-3 p-3 bg-zinc-950/70 rounded-xl border border-zinc-800/60 text-xs space-y-1">
                <div className="text-zinc-400">
                  Account:{' '}
                  <span className="text-white font-medium">
                    {userInfo.firstName} {userInfo.lastName} ({userInfo.email})
                  </span>
                </div>
                {userInfo.role && (
                  <div className="text-violet-300 font-mono text-[11px]">
                    Role: {userInfo.role}
                  </div>
                )}
              </div>
            )}
          </CardHeader>

          <CardBody className="p-0">
            {error && (
              <Alert tone="danger" className="mb-4 text-xs">
                {error}
              </Alert>
            )}

            {successMsg && (
              <Alert tone="success" className="mb-4 text-xs">
                {successMsg}
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-4 text-left">
              <Field label="New Password" htmlFor="new-password" required>
                <TextInput
                  id="new-password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={formState.newPassword}
                  onChange={(e) => updateFormField('newPassword', e.target.value)}
                  disabled={pending || Boolean(successMsg)}
                  required
                />
              </Field>

              <Field label="Confirm New Password" htmlFor="confirm-password" required>
                <TextInput
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={formState.confirmPassword}
                  onChange={(e) => updateFormField('confirmPassword', e.target.value)}
                  disabled={pending || Boolean(successMsg)}
                  required
                />
              </Field>

              {/* Password Requirement Indicators */}
              <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/60 space-y-1.5 text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className={
                      hasMinLength ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                    }
                  >
                    {hasMinLength ? '✓' : '○'}
                  </span>
                  <span className={hasMinLength ? 'text-zinc-200' : 'text-zinc-500'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={
                      passwordsMatch ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                    }
                  >
                    {passwordsMatch ? '✓' : '○'}
                  </span>
                  <span className={passwordsMatch ? 'text-zinc-200' : 'text-zinc-500'}>
                    Passwords match
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={pending}
                disabled={!isFormValid || pending || Boolean(successMsg)}
                loadingText="Updating Password..."
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-amber-500 via-violet-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-violet-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Password &amp; Continue &rarr;
              </Button>
            </form>
          </CardBody>
        </Card>

        <p className="mt-6 text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Systango Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}
