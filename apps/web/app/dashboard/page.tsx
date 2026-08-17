'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
import {
    dashboardApi,
    organizationsApi,
    leadsService,
    dealsService,
    activitiesService,
    type OverallKpis,
    type OrganizationResult,
    type WorkspaceKpis,
    type Lead,
    type Deal,
    type Activity,
} from '@/lib/api';
import { SUPER_ADMIN_MESSAGES } from '@/lib/constants';
import {
    DashboardKpiCards,
    DashboardRecentLeads,
    DashboardRecentDeals,
    DashboardUpcomingTasks,
} from '@/components/dashboard';

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, user, organization, loading: authLoading } = useAuth();

    const isSuperAdminGlobal =
        (user?.role === UserRole.SUPER_ADMIN || !organization) && user?.role === UserRole.SUPER_ADMIN;

    // Workspace CRM State
    const [kpis, setKpis] = useState<WorkspaceKpis | null>(null);
    const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
    const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<Activity[]>([]);
    const [workspaceLoading, setWorkspaceLoading] = useState(true);

    // Super Admin Global State
    const [globalKpis, setGlobalKpis] = useState<OverallKpis | null>(null);
    const [globalKpisLoading, setGlobalKpisLoading] = useState(false);
    const [recentOrgs, setRecentOrgs] = useState<OrganizationResult[]>([]);
    const [orgsLoading, setOrgsLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    const fetchTasks = useCallback(async () => {
        try {
            const allActivities = await activitiesService.getAllActivities();
            const pendingTasks = allActivities
                .filter((a) => !a.completedAt)
                .sort((a, b) => {
                    if (a.dueAt && b.dueAt) return Number(a.dueAt) - Number(b.dueAt);
                    if (a.dueAt) return -1;
                    if (b.dueAt) return 1;
                    return Number(b.createdAt) - Number(a.createdAt);
                })
                .slice(0, 4);
            setUpcomingTasks(pendingTasks);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        }
    }, []);

    const fetchWorkspaceData = useCallback(async () => {
        setWorkspaceLoading(true);
        try {
            const [kpisRes, leadsRes, dealsRes, activitiesRes] = await Promise.all([
                dashboardApi.getCrmKpis(),
                leadsService.getLeads({ limit: 4 }),
                dealsService.getDeals({ limit: 4 }),
                activitiesService.getAllActivities(),
            ]);

            setKpis(kpisRes);
            setRecentLeads(leadsRes?.data || []);
            setRecentDeals(dealsRes?.data || []);

            const pendingTasks = (activitiesRes || [])
                .filter((a) => !a.completedAt)
                .sort((a, b) => {
                    if (a.dueAt && b.dueAt) return Number(a.dueAt) - Number(b.dueAt);
                    if (a.dueAt) return -1;
                    if (b.dueAt) return 1;
                    return Number(b.createdAt) - Number(a.createdAt);
                })
                .slice(0, 4);
            setUpcomingTasks(pendingTasks);
        } catch (err) {
            console.error('Failed to fetch workspace dashboard:', err);
        } finally {
            setWorkspaceLoading(false);
        }
    }, []);

    const fetchGlobalData = useCallback(async () => {
        setGlobalKpisLoading(true);
        setOrgsLoading(true);
        try {
            const [kpisData, orgsData] = await Promise.all([
                dashboardApi.getOverallKpis(),
                organizationsApi.getOrganizations({ limit: 5 }),
            ]);
            setGlobalKpis(kpisData);
            setRecentOrgs(orgsData.data);
        } catch (error) {
            console.error('Failed to fetch global dashboard data', error);
        } finally {
            setGlobalKpisLoading(false);
            setOrgsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            if (isSuperAdminGlobal) {
                void fetchGlobalData();
            } else {
                void fetchWorkspaceData();
            }
        }
    }, [isAuthenticated, isSuperAdminGlobal, fetchGlobalData, fetchWorkspaceData]);

    if (authLoading || !isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-zinc-400 select-none font-sans">
                <div className="flex items-center space-x-3">
                    <svg
                        className="animate-spin h-5 w-5 text-indigo-500"
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
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span className="text-sm font-medium">Verifying Session...</span>
                </div>
            </div>
        );
    }

    // If Super Admin viewing global platform tenant management
    if (isSuperAdminGlobal) {
        const totalOrgs = globalKpis ? globalKpis.organizations.total : 0;
        const activeOrgs = globalKpis ? globalKpis.organizations.active : 0;
        const totalUsers = globalKpis ? globalKpis.platformUsers.total : 0;
        const pendingInvitesCount = globalKpis ? globalKpis.platformUsers.pendingInvites : 0;
        const totalRequests = globalKpis ? globalKpis.organizationRequests.total : 0;

        return (
            <AppShell
                title={SUPER_ADMIN_MESSAGES.TITLE}
                subtitle="Manage tenant organizations, platform users, and onboarding requests"
            >
                <div className="space-y-6">
                    {/* Super Admin Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
                            <CardHeader className="p-0 mb-2">
                                <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    {SUPER_ADMIN_MESSAGES.TOTAL_ORGANIZATIONS}
                                </CardDescription>
                                <CardTitle className="text-3xl font-bold text-violet-400 mt-1">
                                    {globalKpisLoading ? '...' : totalOrgs}
                                </CardTitle>
                            </CardHeader>
                            <CardBody className="p-0">
                                <p className="text-xs text-zinc-500">
                                    {globalKpisLoading ? '...' : activeOrgs} Active Tenants
                                </p>
                            </CardBody>
                        </Card>

                        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
                            <CardHeader className="p-0 mb-2">
                                <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    {SUPER_ADMIN_MESSAGES.TOTAL_USERS}
                                </CardDescription>
                                <CardTitle className="text-3xl font-bold text-cyan-400 mt-1">
                                    {globalKpisLoading ? '...' : totalUsers}
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
                                    {globalKpisLoading ? '...' : pendingInvitesCount}
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
                                    {globalKpisLoading ? '...' : totalRequests}
                                </CardTitle>
                            </CardHeader>
                            <CardBody className="p-0">
                                <p className="text-xs text-zinc-500">Onboarding approval requests</p>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Organizations Directory Table for Super Admin */}
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
                            <Badge tone="accent">{globalKpisLoading ? '...' : totalOrgs} Provisioned</Badge>
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
                </div>
            </AppShell>
        );
    }

    // Standard CRM Workspace Dashboard matching Screenshot
    return (
        <AppShell
            title="Dashboard"
            subtitle="Your pipeline, at a glance"
        >
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* 4 Top KPI Cards */}
                <DashboardKpiCards
                    kpis={kpis}
                    loading={workspaceLoading}
                />

                {/* Main 2-Column Section matching mockup */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left Column (2/3 width) - Recent Leads & Recent Deals */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recent Leads Card */}
                        <DashboardRecentLeads
                            leads={recentLeads}
                            loading={workspaceLoading}
                        />

                        {/* Recent Deals Card */}
                        <DashboardRecentDeals
                            deals={recentDeals}
                            loading={workspaceLoading}
                        />
                    </div>

                    {/* Right Column (1/3 width) - Upcoming Tasks Card */}
                    <div className="lg:col-span-1">
                        <DashboardUpcomingTasks
                            tasks={upcomingTasks}
                            loading={workspaceLoading}
                            onRefresh={fetchTasks}
                        />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
