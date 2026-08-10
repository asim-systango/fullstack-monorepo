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

  const renderUserInfo = () => {
    if (loading) {
      return (
        <span className="text-xs text-muted-foreground animate-pulse">
          Loading profile…
        </span>
      );
    }

    if (user) {
      return (
        <div className="flex items-center gap-3">
          <div className="hidden flex-col text-right sm:flex">
            <span className="text-xs font-semibold text-foreground">{user.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {user.email}
            </span>
          </div>
          <Badge
            tone={user.role === 'admin' ? 'accent' : 'neutral'}
            className="capitalize"
          >
            {user.role}
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
          Portal Dashboard
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
