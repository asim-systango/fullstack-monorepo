'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
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
  TextInput,
} from '@shared/ui';
import { useAuth } from '@/components/auth';
import { AppShell } from '@/components/layout/app-shell';
import { MOCK_ORGANIZATIONS, type OrganizationItem } from '@/lib/constants';

export default function OrganizationsPage() {
  const router = useRouter();
  const { isAuthenticated, user, organization, loading } = useAuth();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');

  // Local state for organization dataset
  const [organizationsList] = useState<OrganizationItem[]>([...MOCK_ORGANIZATIONS]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

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

  const isSuperAdmin =
    user.role === 'SUPER_ADMIN' || user.role === 'super-admin' || !organization;

  // Filter logic
  const filteredOrganizations = organizationsList.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.adminEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || org.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const headerActions = isSuperAdmin ? (
    <Link href="/organizations/new">
      <Button
        variant="primary"
        className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-violet-600/20"
      >
        + Onboard Organization
      </Button>
    </Link>
  ) : undefined;

  return (
    <AppShell
      title="Tenant Organizations Directory"
      subtitle="Manage platform tenants, review onboarding requests, and inspect organization details."
      headerActions={headerActions}
    >
      {/* Directory Filter Bar */}
      <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <TextInput
              type="text"
              placeholder="Search by name, slug, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs text-zinc-400 font-medium mr-1">Status:</span>
            {(['ALL', 'ACTIVE', 'PENDING'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="text-xs rounded-lg"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Directory Table */}
      <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
        <CardHeader className="flex flex-row items-center justify-between p-0 mb-2 border-b border-zinc-800/80 pb-4">
          <div>
            <CardTitle className="text-base font-bold text-white">
              Organizations ({filteredOrganizations.length})
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-0.5">
              Showing active and pending tenant accounts.
            </CardDescription>
          </div>
          <Badge tone="accent">{organizationsList.length} Total</Badge>
        </CardHeader>

        <CardBody className="p-0">
          {filteredOrganizations.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs font-medium">
              No organizations found matching your search criteria.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Organization</TableHeaderCell>
                  <TableHeaderCell>Slug / Domain</TableHeaderCell>
                  <TableHeaderCell>Admin Email</TableHeaderCell>
                  <TableHeaderCell>Members</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                  <TableHeaderCell>Action</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrganizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-semibold text-white">{org.name}</TableCell>
                    <TableCell className="font-mono text-xs text-violet-300">
                      {org.slug}.systangocrm.com
                    </TableCell>
                    <TableCell className="text-zinc-300">{org.adminEmail}</TableCell>
                    <TableCell className="text-zinc-300 font-medium">
                      {org.usersCount} users
                    </TableCell>
                    <TableCell>
                      <Badge tone={org.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-xs">
                      {org.createdAt}
                    </TableCell>
                    <TableCell>
                      <Link href={`/organizations/${org.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-violet-400 hover:text-violet-300"
                        >
                          View Details &rarr;
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </AppShell>
  );
}
