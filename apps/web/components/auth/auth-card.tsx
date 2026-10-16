'use client';

import type { ReactNode } from 'react';

export function AuthCard({
  title,
  description,
  children,
}: Readonly<{ title: string; description?: string; children: ReactNode }>) {
  return (
    <div className="auth-form-body">
      {/* Title shown in AuthLayout; keep optional secondary description for forms */}
      {description ? (
        <p
          className="m-0 text-sm text-[var(--bookly-muted)]"
          data-auth-card-title={title}
        >
          {description}
        </p>
      ) : (
        <span className="sr-only">{title}</span>
      )}
      {children}
    </div>
  );
}
