'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/components/auth';

type TopHeaderProps = Readonly<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}>;

export function TopHeader({ title, subtitle, actions }: TopHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-20 border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          {subtitle || (
            <>
              Welcome back,{' '}
              <span className="text-violet-300 font-medium">{user?.firstName}</span>{' '}
              &bull; Role:{' '}
              <span className="text-cyan-300 font-medium">{user?.role || 'User'}</span>
            </>
          )}
        </p>
      </div>

      {actions && <div className="flex items-center space-x-3">{actions}</div>}
    </header>
  );
}
