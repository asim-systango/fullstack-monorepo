'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, organization, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 select-none font-sans">
        <div className="flex items-center space-x-3">
          <svg
            className="animate-spin h-5 w-5 text-violet-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-sm font-medium">Verifying Session...</span>
        </div>
      </div>
    );
  }

  const isSuperAdmin =
    user.role === 'SUPER_ADMIN' || user.role === 'super-admin' || !organization;
  const userInitials =
    ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900/80 border-r border-zinc-800/80 flex flex-col justify-between p-5 select-none">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 p-[1px] shadow-md shadow-violet-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center font-bold text-violet-400 text-base">
                S
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Systango<span className="text-violet-400 font-medium">.crm</span>
            </span>
          </div>

          {/* Tenant Context Box */}
          <div className="mb-6 px-3.5 py-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="text-xs font-semibold text-zinc-200 truncate">
              {organization ? organization.name : 'Platform Management'}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-violet-400 mt-1">
              {user.role || 'Member'}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-violet-600/15 border border-violet-500/20 text-violet-300 text-sm font-semibold">
              <span className="text-base">📊</span>
              <span>Overview</span>
            </button>

            {isSuperAdmin ? (
              <>
                <button
                  onClick={() => alert('Organizations directory')}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 text-sm font-medium transition-colors cursor-pointer"
                >
                  <span className="text-base">🏢</span>
                  <span>Organizations</span>
                </button>
                <button
                  onClick={() => alert('System users audit')}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 text-sm font-medium transition-colors cursor-pointer"
                >
                  <span className="text-base">👥</span>
                  <span>Global Users</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => alert('Leads directory')}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 text-sm font-medium transition-colors cursor-pointer"
                >
                  <span className="text-base">🎯</span>
                  <span>Leads &amp; Pipeline</span>
                </button>
                <button
                  onClick={() => alert('Contacts directory')}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 text-sm font-medium transition-colors cursor-pointer"
                >
                  <span className="text-base">👤</span>
                  <span>Contacts</span>
                </button>
                <button
                  onClick={() => alert('Deals directory')}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 text-sm font-medium transition-colors cursor-pointer"
                >
                  <span className="text-base">💼</span>
                  <span>Deals</span>
                </button>
              </>
            )}
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
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer text-xs flex-shrink-0 ml-1"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isSuperAdmin
                ? 'Platform Super Admin Console'
                : `${organization?.name || 'CRM Workspace'} Overview`}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Welcome back,{' '}
              <span className="text-violet-300 font-medium">{user.firstName}</span> &bull;
              Role:{' '}
              <span className="text-cyan-300 font-medium">{user.role || 'User'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isSuperAdmin && (
              <button
                onClick={() => alert('New organization provisioning dialog')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-violet-600/20 cursor-pointer"
              >
                + Provision Organization
              </button>
            )}
          </div>
        </header>

        {/* Dashboard Body Content */}
        <div className="p-8 space-y-6">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Session Status
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-2">Active</div>
              <div className="text-xs text-zinc-500 mt-1">
                Authenticated via Nest Gateway JWT
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Account Privilege
              </div>
              <div className="text-2xl font-bold text-violet-400 mt-2">
                {user.role || 'Member'}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Role-based security context
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Active Workspace
              </div>
              <div className="text-2xl font-bold text-cyan-400 mt-2">
                {organization ? organization.name : 'Global Platform'}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {organization ? `Slug: ${organization.slug}` : 'Cross-tenant management'}
              </div>
            </div>
          </div>

          {/* Context Panel */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  {isSuperAdmin ? 'Global Tenant Administration' : 'Workspace Insights'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {isSuperAdmin
                    ? 'Overview of platform tenant organizations, system health, and global user roles.'
                    : 'Track sales metrics, team leads, and pipeline activities.'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                ● System Ready
              </span>
            </div>

            <div className="pt-2 text-xs text-zinc-400 leading-relaxed">
              {isSuperAdmin ? (
                <p>
                  As a Super Administrator, you can provision new client organizations,
                  assign organization administrators, and oversee cross-tenant system
                  metrics.
                </p>
              ) : (
                <p>
                  Welcome to your CRM workspace. Use the sidebar menu to navigate through
                  your team&apos;s leads, contacts, and active sales deals.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
