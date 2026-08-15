'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui';
import { useAuth } from '@/components/auth';
import { UserRole } from '@/lib/auth/roles';
import { AppShell } from '@/components/layout/app-shell';
import { dashboardApi, type OverallKpis } from '@/lib/api';
import { organizationsApi, type OrganizationResult } from '@/lib/api';
import { SUPER_ADMIN_MESSAGES } from '@/lib/constants';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, organization, loading } = useAuth();

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || (!organization && user);

  const [kpis, setKpis] = useState<OverallKpis | null>(null);
  const [kpisLoading, setKpisLoading] = useState(false);
  const [recentOrgs, setRecentOrgs] = useState<OrganizationResult[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (isSuperAdmin) {
        setKpisLoading(true);
        setOrgsLoading(true);
        try {
          const [kpisData, orgsData] = await Promise.all([
            dashboardApi.getOverallKpis(),
            organizationsApi.getOrganizations({ limit: 5 }),
          ]);
          setKpis(kpisData);
          setRecentOrgs(orgsData.data);
        } catch (error) {
          console.error('Failed to fetch dashboard data', error);
        } finally {
          setKpisLoading(false);
          setOrgsLoading(false);
        }
      }
    }
    fetchDashboardData();
  }, [isSuperAdmin]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-zinc-400 select-none font-sans">
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

  // Stats Calculations
  const totalOrgs = kpis ? kpis.organizations.total : 0;
  const activeOrgs = kpis ? kpis.organizations.active : 0;
  const totalUsers = kpis ? kpis.platformUsers.total : 0;
  const pendingInvitesCount = kpis ? kpis.platformUsers.pendingInvites : 0;
  const totalRequests = kpis ? kpis.organizationRequests.total : 0;

  return (
    <AppShell
      title={
        isSuperAdmin
          ? SUPER_ADMIN_MESSAGES.TITLE
          : `${organization?.name || 'CRM Workspace'} Overview`
      }
    >
      {/* Super Admin Stats Grid */}
      {isSuperAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
            <CardHeader className="p-0 mb-2">
              <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {SUPER_ADMIN_MESSAGES.TOTAL_ORGANIZATIONS}
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-violet-400 mt-1">
                {kpisLoading ? '...' : totalOrgs}
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <p className="text-xs text-zinc-500">
                {kpisLoading ? '...' : activeOrgs} Active Tenants
              </p>
            </CardBody>
          </Card>

          <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
            <CardHeader className="p-0 mb-2">
              <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {SUPER_ADMIN_MESSAGES.TOTAL_USERS}
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-cyan-400 mt-1">
                {kpisLoading ? '...' : totalUsers}
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <p className="text-xs text-zinc-500">Across all active workspaces</p>
            </CardBody>
          </Card>

          <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
            <CardHeader className="p-0 mb-2">
              <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {SUPER_ADMIN_MESSAGES.PENDING_INVITES}
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-400 mt-1">
                {kpisLoading ? '...' : pendingInvitesCount}
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <p className="text-xs text-zinc-500">Awaiting admin acceptance</p>
            </CardBody>
          </Card>

          <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
            <CardHeader className="p-0 mb-2">
              <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {SUPER_ADMIN_MESSAGES.TOTAL_REQUESTS}
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-400 mt-1">
                {kpisLoading ? '...' : totalRequests}
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <p className="text-xs text-zinc-500">Onboarding approval requests</p>
            </CardBody>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
            <CardHeader className="p-0 mb-2">
              <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Session Status
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-400">
                Active
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <p className="text-xs text-zinc-500">Authenticated via Nest Gateway JWT</p>
            </CardBody>
          </Card>

          <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
            <CardHeader className="p-0 mb-2">
              <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Account Privilege
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-violet-400">
                {user.role || 'Member'}
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <p className="text-xs text-zinc-500">Role-based security context</p>
            </CardBody>
          </Card>

          <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
            <CardHeader className="p-0 mb-2">
              <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Active Workspace
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-cyan-400">
                {organization ? organization.name : 'Global Platform'}
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <p className="text-xs text-zinc-500">
                {organization ? `Slug: ${organization.slug}` : 'Cross-tenant management'}
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Organizations Directory Table for Super Admin */}
      {isSuperAdmin && (
        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <CardHeader className="flex flex-row items-center justify-between p-0 mb-4 border-b border-zinc-800/80 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-white">
                Tenant Organizations Directory
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-0.5">
                Recent workspaces provisioned on the platform.
              </CardDescription>
            </div>
            <Badge tone="accent">{kpisLoading ? '...' : totalOrgs} Provisioned</Badge>
          </CardHeader>

          <CardBody className="p-0">
            {orgsLoading ? (
              <div className="py-8 text-center text-sm text-zinc-500">
                Loading organizations...
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Organization Name</TableHeaderCell>
                    <TableHeaderCell>Slug / Domain</TableHeaderCell>
                    <TableHeaderCell>Admin Contact</TableHeaderCell>
                    <TableHeaderCell>Users</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Created Date</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrgs.map((org) => {
                    const status = org.adminUser?.isPasswordChangeRequired
                      ? 'PENDING'
                      : org.status;
                    let statusTone: 'success' | 'accent' | 'neutral' = 'neutral';
                    if (status === 'ACTIVE') statusTone = 'success';
                    else if (status === 'PENDING') statusTone = 'accent';

                    return (
                      <TableRow key={org.id}>
                        <TableCell className="font-semibold text-white">
                          {org.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-violet-300">
                          {org.slug}.systangocrm.com
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {org.adminUser?.email || org.email}
                        </TableCell>
                        <TableCell className="text-zinc-300 font-medium">
                          {org.usersCount} members
                        </TableCell>
                        <TableCell>
                          <Badge tone={statusTone}>{status}</Badge>
                        </TableCell>
                        <TableCell className="text-zinc-400 text-xs">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {recentOrgs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-zinc-500">
                        No organizations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      )}
    </AppShell>
  );
}
