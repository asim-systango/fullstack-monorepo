'use client';

import type { ReactNode } from 'react';
import { BooklyLogo } from './bookly-logo';

export function AuthLayout({
  title,
  subtitle,
  children,
}: Readonly<{ title: string; subtitle?: string; children: ReactNode }>) {
  return (
    <div className="auth-shell">
      <div className="auth-shell-frame">
        <aside className="auth-brand-panel" aria-label="Bookly brand">
          <div>
            <div className="auth-brand-mark">
              <BooklyLogo variant="mark" priority className="h-8 w-8 object-contain" />
            </div>
            <h1 className="auth-brand-title">Bookly</h1>
            <hr className="auth-brand-rule" />
            <p className="auth-brand-tagline">
              Every borrowed book opens a door — manage your library with clarity and
              care.
            </p>
          </div>
          <p className="auth-brand-footer">Discover · Borrow · Return · Grow</p>
        </aside>
        <section className="auth-form-panel" aria-labelledby="auth-form-heading">
          <span className="auth-secure-badge">Secure access to Bookly</span>
          <div>
            <h2 id="auth-form-heading" className="auth-form-title">
              {title}
            </h2>
            {subtitle ? <p className="auth-form-description">{subtitle}</p> : null}
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
