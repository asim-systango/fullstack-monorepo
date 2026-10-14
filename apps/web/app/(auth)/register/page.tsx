'use client';

import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { NavLink, useAuth } from '@/components/auth';
import { BrandMark } from '@/components/layout';
import { ThemeToggle } from '@/components/theme';
import { PasswordInput } from '@/components/ui/password-input';
import { homePathForRole } from '@/lib/auth-routes';
import { useFormErrors } from '@/lib/hooks/use-form-errors';
import { toastApiError } from '@/lib/toast';
import { parseRegister } from '@/lib/validation/food-delivery';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAccount, isMock, pendingAction } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { errors, applyParse } = useFormErrors();
  const pending = pendingAction === 'register';

  function syncValidation(
    nextName: string,
    nextEmail: string,
    nextPassword: string,
    forceShow = false,
  ) {
    return applyParse(
      parseRegister({ name: nextName, email: nextEmail, password: nextPassword }),
      forceShow,
    );
  }

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!syncValidation(name, email, password, true)) return;

    try {
      const user = await registerAccount({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.replace(homePathForRole(user.role));
    } catch (err) {
      toastApiError(err);
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
      <div style={{ position: 'absolute', top: 20, left: 24 }}>
        <NavLink href="/login" className="tg-btn tg-btn-ghost" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to sign in
        </NavLink>
      </div>
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
            {isMock
              ? 'Mock mode — stored in this browser only.'
              : 'Creates a customer account and signs you in with a secure cookie.'}
          </p>
          <form
            method="post"
            action="#"
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmit(e);
            }}
            noValidate
          >
            <label className="tg-label" htmlFor="register-name">
              Name
            </label>
            <input
              id="register-name"
              className={`tg-input${errors.name ? ' tg-input-invalid' : ''}`}
              value={name}
              onChange={(e) => {
                const next = e.target.value;
                setName(next);
                syncValidation(next, email, password);
              }}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'register-name-error' : undefined}
            />
            {errors.name ? (
              <p id="register-name-error" className="tg-field-error" style={{ marginBottom: 8 }}>
                {errors.name}
              </p>
            ) : (
              <div style={{ marginBottom: 12 }} />
            )}

            <label className="tg-label" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              className={`tg-input${errors.email ? ' tg-input-invalid' : ''}`}
              type="email"
              value={email}
              onChange={(e) => {
                const next = e.target.value;
                setEmail(next);
                syncValidation(name, next, password);
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
            />
            {errors.email ? (
              <p id="register-email-error" className="tg-field-error" style={{ marginBottom: 8 }}>
                {errors.email}
              </p>
            ) : (
              <div style={{ marginBottom: 12 }} />
            )}

            <label className="tg-label" htmlFor="register-password">
              Password
            </label>
            <PasswordInput
              id="register-password"
              invalid={Boolean(errors.password)}
              value={password}
              onChange={(e) => {
                const next = e.target.value;
                setPassword(next);
                syncValidation(name, email, next);
              }}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
              autoComplete="new-password"
            />
            {errors.password ? (
              <p id="register-password-error" className="tg-field-error" style={{ marginBottom: 16 }}>
                {errors.password}
              </p>
            ) : (
              <p style={{ fontSize: 11.5, color: 'var(--tg-text-faint)', margin: '8px 0 16px' }}>
                Min 8 chars with uppercase, lowercase, number, and special character (e.g. User@1234)
              </p>
            )}

            <button
              type="submit"
              className="tg-btn tg-btn-primary"
              disabled={pending}
              style={{ width: '100%', height: 42 }}
            >
              {pending ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--tg-text-muted)' }}>
            Already registered?{' '}
            <NavLink href="/login" style={{ color: 'var(--tg-brand-accent)' }}>
              Log in
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
