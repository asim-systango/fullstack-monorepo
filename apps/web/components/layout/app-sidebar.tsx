'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge, Button, type BadgeTone } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { useWarehouse } from '@/lib/hooks/use-warehouses';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    roles: ['admin', 'staff', 'user'],
  },
  {
    href: '/products',
    label: 'Products Catalog',
    icon: '📦',
    roles: ['admin', 'staff', 'user'],
  },
  { href: '/warehouses', label: 'Warehouses', icon: '🏬', roles: ['admin', 'staff'] },
  {
    href: '/movements',
    label: 'Stock Movements',
    icon: '🔄',
    roles: ['admin', 'staff', 'user'],
  },
  { href: '/transfers', label: 'Stock Transfers', icon: '🔀', roles: ['admin', 'staff'] },
  {
    href: '/purchase-orders',
    label: 'Purchase Orders',
    icon: '📋',
    roles: ['admin', 'staff'],
  },
];

function getRoleBadge(role: string) {
  let tone: BadgeTone = 'neutral';
  let label = 'Clerk';

  if (role === 'admin') {
    tone = 'success';
    label = 'Admin';
  } else if (role === 'staff') {
    tone = 'accent';
    label = 'Manager';
  }

  return <Badge tone={tone}>{label}</Badge>;
}

function SidebarUserFooter({ isCollapsed }: Readonly<{ isCollapsed: boolean }>) {
  const { user, logout } = useAuth();
  const userRole = user?.role || 'user';
  const warehouseId = user?.warehouseId ?? '';
  const { data: warehouse, isLoading: isWarehouseLoading } = useWarehouse(warehouseId);

  if (!user) {
    return (
      <Link href="/login" className="w-full">
        <Button variant="primary" size="sm" className="w-full">
          {isCollapsed ? '🔑' : 'Log In'}
        </Button>
      </Link>
    );
  }

  let warehouseDisplay = 'No Warehouse Assigned';
  if (warehouseId) {
    if (warehouse?.name) {
      warehouseDisplay = warehouse.name;
    } else if (isWarehouseLoading) {
      warehouseDisplay = 'Loading warehouse...';
    } else {
      warehouseDisplay = 'Assigned Warehouse';
    }
  } else if (userRole === 'admin') {
    warehouseDisplay = 'All Warehouses';
  }

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs"
          title={warehouseDisplay}
        >
          {warehouseDisplay.charAt(0).toUpperCase()}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs text-muted-foreground hover:bg-danger/10 hover:text-danger"
          title="Sign Out"
        >
          🚪
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/80 bg-muted/40 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col truncate min-w-0">
          <span
            className="text-xs font-semibold text-foreground truncate"
            title={warehouseDisplay}
          >
            {warehouseDisplay}
          </span>
          {warehouse?.code && (
            <span className="text-[10px] text-muted-foreground truncate">
              {warehouse.code}
              {warehouse.location ? ` • ${warehouse.location}` : ''}
            </span>
          )}
        </div>
        {getRoleBadge(userRole)}
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="w-full text-xs justify-center"
        onClick={() => void logout()}
      >
        Sign Out
      </Button>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userRole = user?.role || 'user';

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-col justify-between border-r border-border bg-card p-3 shadow-xs transition-all duration-300 ${
        isCollapsed ? 'w-16 items-center' : 'w-64'
      }`}
    >
      {/* Top Section: Logo Branding & Expand/Collapse Toggle Button */}
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-xs">
              INV
            </span>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm text-foreground tracking-tight truncate">
                  Inventory & Warehouse
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  Admin Workspace
                </span>
              </div>
            )}
          </div>

          {/* Toggle Open/Close Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <span className="text-xs font-bold">{isCollapsed ? '▶' : '◀'}</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 w-full">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation Menu
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const isAllowed = item.roles.includes(userRole);
            if (!isAllowed) return null;

            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  isCollapsed ? 'justify-center px-2' : 'px-3'
                } ${
                  isActive
                    ? 'bg-accent text-accent-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Profile & Sign Out */}
      <div className="border-t border-border pt-4 w-full">
        <SidebarUserFooter isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
