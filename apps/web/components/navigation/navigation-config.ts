import {
  Dumbbell,
  LayoutDashboard,
  ClipboardList,
  Target,
  Trophy,
  Users,
  UserCog,
  type LucideIcon,
} from 'lucide-react';
import type { User } from '@shared/api-client';
import { getHomeHref } from '@/lib/role-home';

export type NavigationItem = Readonly<{
  label: string;
  href: string;
  icon: LucideIcon;
}>;

const ATHLETE_NAV_ITEMS: readonly NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Workout', href: '/workouts', icon: Dumbbell },
  { label: 'Plan', href: '/plans', icon: ClipboardList },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Personal Record', href: '/prs', icon: Trophy },
];

const COACH_NAV_ITEMS: readonly NavigationItem[] = [
  { label: 'Athletes', href: '/coach', icon: Users },
];

const ADMIN_NAV_ITEMS: readonly NavigationItem[] = [
  { label: 'Coach Assignments', href: '/admin/coach-assignments', icon: UserCog },
];

/**
 * Role-scoped nav — `user` gets the full athlete surface, `staff` only gets
 * the read-only coach roster (the only route their role can actually reach),
 * `admin` gets the coach↔athlete assignment screen (the only route their role
 * can reach).
 */
export function getNavigationItems(
  role: User['role'] | null | undefined,
): readonly NavigationItem[] {
  if (role === 'user') return ATHLETE_NAV_ITEMS;
  if (role === 'staff') return COACH_NAV_ITEMS;
  if (role === 'admin') return ADMIN_NAV_ITEMS;
  return [];
}

/** `/workouts/new`, `/workouts/123` etc. all belong to the `/workouts` nav item. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export { getHomeHref };
