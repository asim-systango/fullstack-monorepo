'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../auth';
import { getNavigationItems, isNavItemActive } from '../navigation/navigation-config';

export type NavListProps = Readonly<{
  /** Icons only, no visible labels (still keeps accessible names). */
  collapsed?: boolean;
  onNavigate?: () => void;
}>;

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = getNavigationItems(user?.role);

  return (
    <ul className="ui-nav-list">
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              className={active ? 'ui-nav-item ui-nav-item-active' : 'ui-nav-item'}
            >
              <Icon aria-hidden="true" className="ui-nav-item-icon" size={20} />
              <span className={collapsed ? 'sr-only' : undefined}>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
