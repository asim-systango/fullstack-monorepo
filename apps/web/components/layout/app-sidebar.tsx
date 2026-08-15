'use client';

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
  { href: '/warehouses', label: 'Warehouses', icon: '🏬', roles: ['admin'] },
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

function SidebarUserFooter() {
  const { user, logout } = useAuth();
  const userRole = user?.role || 'user';
  const warehouseId = user?.warehouseId ?? '';
  const { data: warehouse, isLoading: isWarehouseLoading } = useWarehouse(warehouseId);

  if (!user) {
    return (
      <Link href="/login" className="w-full">
        <Button variant="primary" size="sm" className="w-full">
          Log In
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

  return (
    <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col truncate min-w-0">
          <span
            className="text-xs font-bold text-foreground truncate"
            title={warehouseDisplay}
          >
            {warehouseDisplay}
          </span>
          {warehouse?.code && (
            <span className="text-[10px] font-medium text-muted-foreground truncate">
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
        className="w-full text-xs justify-center font-semibold"
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
  const userRole = user?.role || 'user';

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-border bg-card p-4 shadow-xs">
      {/* Top Section: Logo Branding */}
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-3 px-1 py-1">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-xs">
            INV
          </span>
          <div className="flex flex-col truncate">
            <span className="font-extrabold text-sm text-foreground tracking-tight truncate">
              Inventory & Warehouse
            </span>
            <span className="text-[11px] font-medium text-muted-foreground truncate">
              Enterprise Workspace
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 w-full">
          <div className="px-3 pb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Navigation Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const isAllowed = item.roles.includes(userRole);
            if (!isAllowed) return null;

            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent text-accent-foreground font-bold shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Profile & Sign Out */}
      <div className="border-t border-border pt-4 w-full">
        <SidebarUserFooter />
      </div>
    </aside>
  );
}
