'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { useAuth, RoleGuard } from '@/components/auth';
import { UserRole } from '@/lib/auth/roles';
import { AppShell } from '@/components/layout/app-shell';
import { formsApi, type FormSubmission, type FormSubmissionStatus } from '@/lib/api';

export default function RequestsPage() {
  const router = useRouter();
  const { isAuthenticated, user, organization, loading: authLoading } = useAuth();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FormSubmissionStatus | 'ALL'>('ALL');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Data State
  const [submissionsList, setSubmissionsList] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  // Status updating state
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchSubmissions = useCallback(async () => {
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
    if (!user || (!isSuperAdmin && organization))
      return;

    setLoading(true);
    try {
      const query: Record<string, string | number> = { page, limit };
      if (debouncedSearch) query.search = debouncedSearch;
      if (statusFilter !== 'ALL') query.status = statusFilter;

      const response = await formsApi.getFormSubmissions(query);
      setSubmissionsList(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch form submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user, organization, page, limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Reset page to 1 on status change
  const handleStatusChange = (status: FormSubmissionStatus | 'ALL') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleUpdateStatus = async (id: string, newStatus: FormSubmissionStatus) => {
    setUpdatingId(id);
    try {
      await formsApi.updateSubmissionStatus(id, { status: newStatus });
      await fetchSubmissions(); // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || !isAuthenticated || !user) {
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

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
      <AppShell
        title="Onboarding Requests"
        subtitle="Manage incoming tenant organization requests."
      >
        {/* Directory Filter Bar */}
        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-80">
              <TextInput
                type="text"
                placeholder="Search by name, company, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-xs text-zinc-400 font-medium mr-1">Status:</span>
              {(['ALL', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'] as const).map(
                (status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                    className="text-xs rounded-lg"
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ),
              )}
            </div>
          </div>
        </Card>

        {/* Directory Table */}
        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <CardHeader className="flex flex-row items-center justify-between p-0 mb-2 border-b border-zinc-800/80 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-white">
                Form Submissions
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-0.5">
                Review and manage onboarding requests.
              </CardDescription>
            </div>
            <Badge tone="accent">{total} Total</Badge>
          </CardHeader>

          <CardBody className="p-0">
            {(() => {
              if (loading) {
                return (
                  <div className="py-12 text-center text-zinc-500 text-xs font-medium">
                    Loading requests...
                  </div>
                );
              }
              if (submissionsList.length === 0) {
                return (
                  <div className="py-12 text-center text-zinc-500 text-xs font-medium">
                    No requests found matching your search criteria.
                  </div>
                );
              }
              return (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Company</TableHeaderCell>
                      <TableHeaderCell>Contact</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Submitted At</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Action</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissionsList.map((submission) => {
                      let statusTone: 'success' | 'accent' | 'neutral' | 'danger' =
                        'neutral';
                      if (submission.status === 'APPROVED') statusTone = 'success';
                      else if (submission.status === 'PENDING') statusTone = 'accent';
                      else if (submission.status === 'REJECTED') statusTone = 'danger';

                      return (
                        <TableRow key={submission.id}>
                          <TableCell className="font-semibold text-white">
                            {submission.companyName || 'N/A'}
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            {submission.contactName}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {submission.email}
                          </TableCell>
                          <TableCell className="text-zinc-400 text-xs">
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge tone={statusTone}>
                              {submission.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {submission.status === 'PENDING' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={updatingId === submission.id}
                                  onClick={() =>
                                    handleUpdateStatus(submission.id, 'IN_REVIEW')
                                  }
                                  className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                  Review
                                </Button>
                              )}
                              {(submission.status === 'PENDING' ||
                                submission.status === 'IN_REVIEW') && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={updatingId === submission.id}
                                      onClick={() =>
                                        handleUpdateStatus(submission.id, 'APPROVED')
                                      }
                                      className="text-xs text-emerald-400 hover:text-emerald-300"
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={updatingId === submission.id}
                                      onClick={() =>
                                        handleUpdateStatus(submission.id, 'REJECTED')
                                      }
                                      className="text-xs text-red-400 hover:text-red-300"
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              );
            })()}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
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
    </RoleGuard>
  );
}
