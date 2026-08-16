'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge, Button } from '@shared/ui';
import { useAuth } from '@/components/auth';
import { UserRole } from '@/lib/auth/roles';

export function Sidebar() {
  const pathname = usePathname();
  const { user, organization, logout } = useAuth();

  if (!user) return null;

  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN || !organization;
  const userInitials =
    ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || 'U';

  const isOrgAdminOrSalesLead =
    user.role === UserRole.ORG_ADMIN || user.role === UserRole.SALES_LEAD;

  const navItems = isSuperAdmin
    ? [
      { label: 'Overview', icon: '📊', href: '/' },
      { label: 'Organizations', icon: '🏢', href: '/organizations' },
      { label: 'Global Users', icon: '👥', href: '/users' },
      { label: 'Requests', icon: '📥', href: '/requests' },
    ]
    : [
      { label: 'Overview', icon: '📊', href: '/' },
      { label: 'Leads & Pipeline', icon: '🎯', href: '/leads' },
      { label: 'Contacts', icon: '👤', href: '/contacts' },
      { label: 'Deals', icon: '💼', href: '/deals' },
      ...(isOrgAdminOrSalesLead
        ? [{ label: 'Team Members', icon: '👥', href: '/users' }]
        : []),
    ];

  return (
    <aside className="w-64 bg-zinc-900/80 border-r border-zinc-800/80 flex flex-col justify-between p-5 select-none shrink-0">
      <div>
        {/* Brand Logo Header */}
        <Link href="/" className="flex items-center space-x-3 mb-8 px-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 p-[1px] shadow-md shadow-violet-500/20 group-hover:shadow-violet-500/35 transition-all">
            <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center font-bold text-violet-400 text-base">
              S
            </div>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Systango<span className="text-violet-400 font-medium">.crm</span>
          </span>
        </Link>

        {/* Tenant Context Box */}
        <div className="mb-6 px-3.5 py-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
          <div className="text-xs font-semibold text-zinc-200 truncate">
            {organization ? organization.name : 'Platform Management'}
          </div>
          <div className="mt-1">
            <Badge tone={isSuperAdmin ? 'accent' : 'neutral'}>
              {user.role || 'Member'}
            </Badge>
          </div>
        </div>

        {/* Dynamic Role-Based Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${isActive
                  ? 'bg-violet-600/15 border border-violet-500/20 text-violet-300 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 font-medium'
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Sign Out Footer */}
      <div className="pt-4 border-t border-zinc-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-xs flex-shrink-0">
              {userInitials}
            </div>
            <div className="truncate min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-[10px] text-zinc-500 truncate">{user.email}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title="Sign Out"
            className="text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0 ml-1"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
