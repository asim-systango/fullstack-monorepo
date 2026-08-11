'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui';
import { AppShell } from '@/components/layout/app-shell';
import { MOCK_ORGANIZATIONS, type OrganizationItem } from '@/lib/constants';

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default function OrganizationDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // Find organization from mock dataset or create fallback item
  const initialOrg = MOCK_ORGANIZATIONS.find((o) => o.id === id || o.slug === id) || {
    id: id,
    name: id.replace(/-/g, ' ').toUpperCase(),
    slug: id,
    adminEmail: `admin@${id}.com`,
    usersCount: 12,
    status: 'ACTIVE' as const,
    createdAt: '2026-01-20',
  };

  const [orgStatus, setOrgStatus] = useState<OrganizationItem['status']>(
    initialOrg.status,
  );
  const [notification, setNotification] = useState<string | null>(null);

  function toggleStatus() {
    const nextStatus = orgStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setOrgStatus(nextStatus);
    setNotification(`Organization status changed to ${nextStatus}.`);
  }

  const backAction = (
    <Link href="/organizations">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-zinc-300 hover:text-white"
      >
        &larr; Back to Organizations
      </Button>
    </Link>
  );

  return (
    <AppShell
      title={`Organization: ${initialOrg.name}`}
      subtitle={`Tenant Details, domain routing, and account privileges.`}
      headerActions={backAction}
    >
      {notification && (
        <Alert tone={orgStatus === 'ACTIVE' ? 'success' : 'neutral'} className="text-xs">
          {notification}
        </Alert>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
          <CardHeader className="p-0 mb-2">
            <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tenant Status
            </CardDescription>
            <div className="mt-1">
              <Badge tone={orgStatus === 'ACTIVE' ? 'success' : 'neutral'}>
                {orgStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <p className="text-xs text-zinc-500">Access control status</p>
          </CardBody>
        </Card>

        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
          <CardHeader className="p-0 mb-2">
            <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Assigned Members
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-violet-400 mt-1">
              {initialOrg.usersCount}
            </CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <p className="text-xs text-zinc-500">Active seat licenses</p>
          </CardBody>
        </Card>

        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
          <CardHeader className="p-0 mb-2">
            <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Workspace Domain
            </CardDescription>
            <CardTitle className="text-sm font-mono font-bold text-cyan-400 mt-2 truncate">
              {initialOrg.slug}.systangocrm.com
            </CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <p className="text-xs text-zinc-500">Multi-tenant SSL endpoint</p>
          </CardBody>
        </Card>

        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
          <CardHeader className="p-0 mb-2">
            <CardDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Provisioned Date
            </CardDescription>
            <CardTitle className="text-xl font-bold text-zinc-200 mt-1">
              {initialOrg.createdAt}
            </CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <p className="text-xs text-zinc-500">Creation timestamp</p>
          </CardBody>
        </Card>
      </div>

      {/* Main Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <CardHeader className="border-b border-zinc-800/80 pb-4 p-0">
            <CardTitle className="text-base font-bold text-white">
              Organization Metadata &amp; Configuration
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-0.5">
              Primary administrative configuration for this tenant workspace.
            </CardDescription>
          </CardHeader>

          <CardBody className="p-0 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block font-medium">Organization ID</span>
                <span className="text-white font-mono font-semibold text-sm mt-0.5 block">
                  {initialOrg.id}
                </span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block font-medium">
                  Primary Admin Email
                </span>
                <span className="text-violet-300 font-semibold text-sm mt-0.5 block truncate">
                  {initialOrg.adminEmail}
                </span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block font-medium">Tenant Slug</span>
                <span className="text-cyan-300 font-mono font-semibold text-sm mt-0.5 block">
                  {initialOrg.slug}
                </span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block font-medium">
                  Database Isolation
                </span>
                <span className="text-emerald-400 font-semibold text-sm mt-0.5 block">
                  Tenant Scoped Schema
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Administrative Action Panel */}
        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <CardHeader className="border-b border-zinc-800/80 pb-4 p-0">
            <CardTitle className="text-base font-bold text-white">
              Tenant Management
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-0.5">
              Super Admin override controls.
            </CardDescription>
          </CardHeader>

          <CardBody className="p-0 space-y-4 text-xs">
            <p className="text-zinc-400 leading-relaxed">
              As a Super Admin, you can suspend or re-activate this tenant workspace if
              required.
            </p>

            <Button
              variant={orgStatus === 'ACTIVE' ? 'ghost' : 'primary'}
              onClick={toggleStatus}
              className={`w-full justify-center text-xs font-semibold py-2.5 rounded-xl transition-all ${
                orgStatus === 'ACTIVE'
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {orgStatus === 'ACTIVE' ? 'Suspend Organization' : 'Activate Organization'}
            </Button>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
