'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Stethoscope,
  Calendar,
  LayoutDashboard,
  CalendarDays,
  Settings,
  Activity,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/components/auth';
import {
  Button,
  Badge,
  ThemeToggle,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@shared/ui/components';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

/** Role-based navigation configuration with Lucide icons (UI Kit link removed). */
const NAV_CONFIG: Record<string, NavItem[]> = {
  user: [
    { label: 'Doctors', href: '/doctors', icon: Stethoscope },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
  ],
  staff: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Schedule', href: '/doctor/schedule', icon: CalendarDays },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Doctors', href: '/doctors', icon: Stethoscope },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
    { label: 'Admin Panel', href: '/admin', icon: Settings },
  ],
};

const DEFAULT_NAV: NavItem[] = [
  { label: 'Doctors', href: '/doctors', icon: Stethoscope },
  { label: 'Appointments', href: '/appointments', icon: Calendar },
];

/**
 * Modern SaaS sidebar with Lucide vector icons, glassmorphism card backdrop,
 * active indicator pills, user profile card, and responsive mobile drawer.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role ?? 'user';
  const navItems = NAV_CONFIG[role] ?? DEFAULT_NAV;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        size="icon"
        variant="outline"
        className="fixed left-4 top-3 z-50 md:hidden shadow-md rounded-xl"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r
          border-border/80 bg-card/90 backdrop-blur-xl transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 shadow-sm
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-border/80 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm ring-2 ring-primary/20">
            <Activity className="size-5 animate-pulse" />
          </div>
          <Link href="/" className="flex flex-col" onClick={() => setMobileOpen(false)}>
            <span className="text-base font-bold text-foreground tracking-tight leading-none">
              PulseCare
            </span>
            <span className="text-[10px] text-muted-foreground font-mono tracking-wider">
              HEALTHCARE MANAGEMENT
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Navigation Menu
          </div>
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs ring-1 ring-primary/30'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                      }
                    `}
                  >
                    <Icon
                      className={`size-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
                    />
                    <span>{item.label}</span>
                    {isActive ? (
                      <span className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Footer Card */}
        <div className="border-t border-border/80 p-3 bg-muted/20">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                {user?.name ? getInitials(user.name) : <UserIcon className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {user?.name ?? 'Guest User'}
                </p>
                <div className="flex items-center gap-1.5">
                  <Badge
                    tone={role === 'admin' ? 'accent' : 'neutral'}
                    className="text-[9px] px-1.5 py-0 capitalize"
                  >
                    {role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger>
                  <ThemeToggle
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                  />
                </TooltipTrigger>
                <TooltipContent side="top">Toggle theme</TooltipContent>
              </Tooltip>

              {user ? (
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => void logout()}
                      aria-label="Logout"
                    >
                      <LogOut className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Sign out</TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
