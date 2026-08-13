'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { organizationsApi, type OrganizationResult } from '@/lib/api/organizations.api';

export default function OrganizationsPage() {
  const router = useRouter();
  const { isAuthenticated, user, organization, loading } = useAuth();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Data State
  const [organizationsList, setOrganizationsList] = useState<OrganizationResult[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchOrganizations = useCallback(async () => {
    if (
      !user ||
      (user.role !== 'SUPER_ADMIN' && user.role !== 'super-admin' && organization)
    )
      return;

    setOrgsLoading(true);
    try {
      const query: Record<string, string | number> = { page, limit };
      if (debouncedSearch) query.search = debouncedSearch;
      if (statusFilter !== 'ALL') query.status = statusFilter;

      const response = await organizationsApi.getOrganizations(query);
      setOrganizationsList(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setOrgsLoading(false);
    }
  }, [user, organization, page, limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Reset page to 1 on status change
  const handleStatusChange = (status: 'ALL' | 'ACTIVE' | 'PENDING') => {
    setStatusFilter(status);
    setPage(1);
  };

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
                onClick={() => handleStatusChange(status)}
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
              Organizations
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-0.5">
              Showing active and pending tenant accounts.
            </CardDescription>
          </div>
          <Badge tone="accent">{total} Total</Badge>
        </CardHeader>

        <CardBody className="p-0">
          {(() => {
            if (orgsLoading) {
              return (
                <div className="py-12 text-center text-zinc-500 text-xs font-medium">
                  Loading organizations...
                </div>
              );
            }
            if (organizationsList.length === 0) {
              return (
                <div className="py-12 text-center text-zinc-500 text-xs font-medium">
                  No organizations found matching your search criteria.
                </div>
              );
            }
            return (
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
                  {organizationsList.map((org) => {
                    const displayStatus = org.adminUser?.isPasswordChangeRequired
                      ? 'PENDING'
                      : org.status;
                    let statusTone: 'success' | 'accent' | 'neutral' = 'neutral';
                    if (displayStatus === 'ACTIVE') statusTone = 'success';
                    else if (displayStatus === 'PENDING') statusTone = 'accent';

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
                          {org.usersCount} users
                        </TableCell>
                        <TableCell>
                          <Badge tone={statusTone}>{displayStatus}</Badge>
                        </TableCell>
                        <TableCell className="text-zinc-400 text-xs">
                          {new Date(org.createdAt).toLocaleDateString()}
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
                    );
                  })}
                </TableBody>
              </Table>
            );
          })()}

          {/* Pagination Controls */}
          {!orgsLoading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-800/80 mt-4 pt-4">
              <div className="text-xs text-zinc-400">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-xs"
                >
                  &larr; Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-xs"
                >
                  Next &rarr;
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </AppShell>
  );
}
