'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  ShoppingCart,
  UtensilsCrossed,
} from 'lucide-react';
import type { User } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { ThemeToggle } from '@/components/theme';
import { useCart } from '@/lib/hooks/food-delivery';
import { Avatar } from './avatar';
import { BrandMark } from './brand-mark';
import { RoleBadge } from '@/components/food/role-badge';

type NavItem = { href: string; label: string; icon: typeof Home };

function navForRole(role?: User['role']): NavItem[] {
  const base: NavItem[] = [
    { href: '/restaurants', label: 'Restaurants', icon: Home },
    { href: '/orders', label: 'Orders', icon: ClipboardList },
  ];
  if (role === 'staff') {
    return [
      ...base,
      { href: '/restaurant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/restaurant/menu', label: 'Menu', icon: UtensilsCrossed },
    ];
  }
  if (role === 'admin') {
    return [
      ...base,
      { href: '/admin', label: 'Overview', icon: LayoutDashboard },
      { href: '/admin/restaurants', label: 'Manage restaurants', icon: ShieldCheck },
      { href: '/admin/orders', label: 'All orders', icon: ClipboardList },
    ];
  }
  return base;
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  bare = false,
}: Readonly<{ children: React.ReactNode; bare?: boolean }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { data: cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const items = navForRole(user?.role);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (bare) {
    return <div className="tg-root tg-fade-in">{children}</div>;
  }

  return (
    <div className="tg-root tg-app-shell">
      <aside className="tg-sidebar">
        <div className="tg-sidebar-brand">
          <BrandMark href="/restaurants" />
        </div>

        <nav className="tg-sidebar-nav" aria-label="Application navigation">
          <p className="tg-sidebar-label">Workspace</p>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`tg-sidebar-link${isActive(pathname, item.href) ? ' active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/cart"
            className={`tg-sidebar-link${isActive(pathname, '/cart') ? ' active' : ''}`}
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 ? <span className="tg-sidebar-count">{cartCount}</span> : null}
          </Link>
        </nav>

        <div className="tg-sidebar-bottom">
          <div className="tg-sidebar-tools">
            <button type="button" className="tg-sidebar-link" aria-label="Notifications">
              <Bell size={18} />
              <span>Notifications</span>
            </button>
            <div className="tg-sidebar-theme">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
          </div>

          {loading ? <span className="tg-sidebar-loading">Loading profile…</span> : null}
          {!loading && user ? (
            <div className="tg-sidebar-profile">
              <Avatar name={user.name} />
              <div className="tg-sidebar-user">
                <strong>{user.name}</strong>
                <RoleBadge role={user.role} />
              </div>
              <button
                type="button"
                className="tg-sidebar-logout"
                aria-label="Sign out"
                onClick={() => {
                  void logout().then(() => router.push('/'));
                }}
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="tg-app-main">
        <header className="tg-mobile-header">
          <BrandMark href="/restaurants" />
          <div className="tg-mobile-actions">
            <Link href="/cart" className="tg-mobile-icon" aria-label="Cart">
              <ShoppingCart size={18} />
              {cartCount > 0 ? <span>{cartCount}</span> : null}
            </Link>
            <ThemeToggle />
            {user ? (
              <div ref={menuRef} className="tg-mobile-profile">
                <button
                  type="button"
                  className="tg-mobile-user-button"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  <Avatar name={user.name} />
                  <ChevronDown size={14} />
                </button>
                {menuOpen ? (
                  <div className="tg-mobile-menu tg-fade-in">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <button
                      type="button"
                      onClick={() => {
                        void logout().then(() => router.push('/'));
                      }}
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>

        <nav className="tg-mobile-nav" aria-label="Mobile navigation">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(pathname, item.href) ? 'active' : ''}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="tg-container tg-fade-in">{children}</div>
      </div>
    </div>
  );
}
