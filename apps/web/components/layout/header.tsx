'use client';

import { useAuth } from '@/components/auth';
import { Badge, Button } from '@shared/ui/components';

/**
 * Top header bar with user info, role badge, and logout action.
 */
export function Header() {
  const { user, logout, loading } = useAuth();

  const renderUserInfo = () => {
    if (loading) {
      return <span className="text-sm text-muted-foreground">Loading…</span>;
    }

    if (user) {
      return (
        <>
          <span className="hidden text-sm text-foreground sm:inline">{user.name}</span>
          <Badge>{user.role}</Badge>
          <Button onClick={() => void logout()}>Logout</Button>
        </>
      );
    }

    return <span className="text-sm text-muted-foreground">Not signed in</span>;
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background font-bold text-xs">
          ✚
        </span>
        <h2 className="text-base font-bold text-foreground tracking-tight">
          PulseCare Hospital System
        </h2>
      </div>

      <div className="flex items-center gap-4">{renderUserInfo()}</div>
    </header>
  );
}
