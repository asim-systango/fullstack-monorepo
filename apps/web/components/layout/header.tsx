'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth';
import {
  Badge,
  Button,
  ThemeToggle,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@shared/ui/components';

/**
 * Top header bar with user info, role badge, theme switcher, and logout action using Lucide icons.
 */
export function Header() {
  const { user, logout, loading } = useAuth();

  const getInitials = (name?: string, firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleTone = (
    role?: string,
  ): 'neutral' | 'accent' | 'success' | 'warning' | 'danger' => {
    const r = role?.toUpperCase();
    if (r === 'ADMIN') return 'accent';
    if (r === 'DOCTOR') return 'warning';
    return 'neutral';
  };

  const renderUserInfo = () => {
    if (loading) {
      return (
        <span className="text-xs text-muted-foreground animate-pulse">
          Loading profile…
        </span>
      );
    }

    if (user) {
      const displayName =
        user.name ||
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.email.split('@')[0];
      const roleStr = String(user.role).toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shadow-2xs overflow-hidden">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user.name, user.firstName, user.lastName)
              )}
            </div>
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-xs font-semibold text-foreground leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono leading-tight">
                {user.email}
              </span>
            </div>
          </div>
          <Badge
            tone={getRoleTone(user.role)}
            className="uppercase font-mono text-[10px] tracking-wider"
          >
            {roleStr}
          </Badge>
          <Tooltip>
            <TooltipTrigger>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => void logout()}
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Sign out of your account</TooltipContent>
          </Tooltip>
        </div>
      );
    }

    return <span className="text-xs text-muted-foreground">Not signed in</span>;
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/80 bg-card/80 px-6 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-2 pl-10 md:pl-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          PulseCare Healthcare System
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger>
            <ThemeToggle variant="outline" size="sm" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Toggle Light / Dark Mode</TooltipContent>
        </Tooltip>

        <div className="h-4 w-px bg-border hidden sm:block" />

        {renderUserInfo()}
      </div>
    </header>
  );
}
