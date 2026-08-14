'use client';

import type { ReactNode } from 'react';

export function AuthFormFooter({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div className={className ? `auth-form-footer ${className}` : 'auth-form-footer'}>
      {children}
    </div>
  );
}
