'use client';

import { BicepsFlexed } from 'lucide-react';
import { NavList } from './nav-list';
import { useSidebar } from './sidebar-provider';
import { getHomeHref } from '@/lib/role-home';
import Link from 'next/link';
import { useAuth } from '../auth';

/** Desktop sidebar — hidden on small screens, where MobileSidebar takes over. */
export function Sidebar() {
  const { collapsed } = useSidebar();
  const { user } = useAuth();

  return (
    <aside
      className={collapsed ? 'ui-sidebar ui-sidebar-collapsed pt-0' : 'ui-sidebar pt-0'}
    >
      <Link
        href={getHomeHref(user?.role)}
        className="ui-app-brand flex items-center gap-1 mb-2"
      >
        <BicepsFlexed className="text-black" size={30} /> {collapsed ? '' : 'Fitness'}
      </Link>
      <nav aria-label="Primary" className="ui-sidebar-nav">
        <NavList collapsed={collapsed} />
      </nav>
    </aside>
  );
}
