'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Alert,
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
    Select,
} from '@shared/ui';
import { useAuth, RoleGuard } from '@/components/auth';
import { AppShell } from '@/components/layout/app-shell';
import { UserRole } from '@/lib/auth/roles';
import { usersApi, type UserResult } from '@/lib/api';

export default function UsersPage() {
    const router = useRouter();
    const { isAuthenticated, user, organization, loading: authLoading } = useAuth();

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Data State
    const [usersList, setUsersList] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Invite Modal State
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteFirstName, setInviteFirstName] = useState('');
    const [inviteLastName, setInviteLastName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('');
    const [inviteSubmitting, setInviteSubmitting] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);

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

    const fetchUsers = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const query: Record<string, string | number> = { page, limit };
            if (debouncedSearch) query.search = debouncedSearch;
            if (statusFilter !== 'ALL') query.status = statusFilter;
            if (roleFilter !== 'ALL') query.roleName = roleFilter;

            const response = await usersApi.getUsers(query);
            setUsersList(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [user, page, limit, debouncedSearch, statusFilter, roleFilter]);

    // Fetch users on filter or page change
    useEffect(() => {
        if (isAuthenticated) {
            void fetchUsers();
        }
    }, [isAuthenticated, fetchUsers]);

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteFirstName || !inviteLastName || !inviteEmail || !inviteRole) {
            setInviteError('Please fill out all fields.');
            return;
        }

        setInviteSubmitting(true);
        setInviteError(null);
        try {
            await usersApi.inviteUser({
                firstName: inviteFirstName,
                lastName: inviteLastName,
                email: inviteEmail,
                roleName: inviteRole,
            });

            setNotification({
                message: `Successfully invited user ${inviteFirstName} ${inviteLastName}!`,
                type: 'success',
            });

            // Clear Form and Close Modal
            setInviteFirstName('');
            setInviteLastName('');
            setInviteEmail('');
            setInviteRole('');
            setIsInviteOpen(false);

            // Refresh list
            void fetchUsers();
        } catch (error: any) {
            setInviteError(error?.response?.data?.message || error?.message || 'Failed to invite user.');
        } finally {
            setInviteSubmitting(false);
        }
    };

    // Determine if logging in user is permitted to invite anyone
    const canInvite = user?.role === UserRole.ORG_ADMIN || user?.role === UserRole.SALES_LEAD;

    // Set default invite role when modal opens
    const openInviteModal = () => {
        if (user?.role === UserRole.SALES_LEAD) {
            setInviteRole(UserRole.SALES_REP);
        } else if (user?.role === UserRole.ORG_ADMIN) {
            setInviteRole(UserRole.SALES_REP);
        }
        setInviteError(null);
        setIsInviteOpen(true);
    };

    const getRoleBadgeTone = (role: string | null) => {
        switch (role) {
            case UserRole.SUPER_ADMIN:
                return 'accent';
            case UserRole.ORG_ADMIN:
                return 'danger';
            case UserRole.SALES_LEAD:
                return 'success';
            default:
                return 'neutral';
        }
    };

    const getStatusBadgeTone = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'success';
            case 'PENDING':
                return 'accent';
            default:
                return 'danger';
        }
    };

    const headerActions = canInvite ? (
        <Button variant="primary" onClick={openInviteModal} className="text-xs">
            + Invite Team Member
        </Button>
    ) : undefined;

    return (
        <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SALES_LEAD]}>
            <AppShell
                title={user?.role === UserRole.SUPER_ADMIN ? 'Global Users Directory' : 'Team Members'}
                subtitle={
                    user?.role === UserRole.SUPER_ADMIN
                        ? 'Manage all platform users across tenant organizations.'
                        : 'View, filter, and invite team members in your organization.'
                }
                headerActions={headerActions}
            >
                {notification && (
                    <Alert
                        tone={notification.type === 'success' ? 'success' : 'danger'}
                        className="text-xs mb-5"
                    >
                        {notification.message}
                    </Alert>
                )}

                {/* Filters and Search Bar */}
                <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className={user?.role === UserRole.SALES_LEAD ? "md:col-span-3" : "md:col-span-2"}>
                            <TextInput
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full text-xs"
                            />
                        </div>
                        {user?.role !== UserRole.SALES_LEAD && (
                            <div>
                                <Select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full text-xs"
                                >
                                    <option value="ALL">All Roles</option>
                                    {user?.role === UserRole.SUPER_ADMIN && (
                                        <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                                    )}
                                    {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ORG_ADMIN) && (
                                        <option value={UserRole.ORG_ADMIN}>Org Admin</option>
                                    )}
                                    {<option value={UserRole.SALES_LEAD}>Sales Lead</option>}
                                    <option value={UserRole.SALES_REP}>Sales Rep</option>
                                </Select>
                            </div>
                        )}
                        <div>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full text-xs"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="PENDING">Pending</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SUSPENDED">Suspended</option>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Directory Listing Table */}
                <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                    <CardBody className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHead>
                                    <TableRow className="border-b border-zinc-800/80">
                                        <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Name</TableHeaderCell>
                                        <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Email</TableHeaderCell>
                                        <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Role</TableHeaderCell>
                                        {user?.role === UserRole.SUPER_ADMIN && (
                                            <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Organization</TableHeaderCell>
                                        )}
                                        <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Status</TableHeaderCell>
                                        <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Last Login</TableHeaderCell>
                                        <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Created</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={user?.role === UserRole.SUPER_ADMIN ? 7 : 6}
                                                className="text-center py-8 text-zinc-500 text-xs"
                                            >
                                                Loading users list...
                                            </TableCell>
                                        </TableRow>
                                    ) : usersList.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={user?.role === UserRole.SUPER_ADMIN ? 7 : 6}
                                                className="text-center py-8 text-zinc-500 text-xs"
                                            >
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        usersList.map((usr) => (
                                            <TableRow key={usr.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-all">
                                                <TableCell className="py-3.5 px-5 text-white font-medium text-xs">
                                                    {usr.firstName} {usr.lastName}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-5 text-zinc-300 text-xs">{usr.email}</TableCell>
                                                <TableCell className="py-3.5 px-5 text-xs">
                                                    <Badge tone={getRoleBadgeTone(usr.roleName)}>
                                                        {usr.roleName || 'Member'}
                                                    </Badge>
                                                </TableCell>
                                                {user?.role === UserRole.SUPER_ADMIN && (
                                                    <TableCell className="py-3.5 px-5 text-zinc-300 text-xs">
                                                        {usr.organizationName || <span className="text-zinc-500 italic">None (Platform Hub)</span>}
                                                    </TableCell>
                                                )}
                                                <TableCell className="py-3.5 px-5 text-xs">
                                                    <Badge tone={getStatusBadgeTone(usr.status)}>
                                                        {usr.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3.5 px-5 text-zinc-450 text-xs">
                                                    {usr.lastLoginAt ? new Date(usr.lastLoginAt).toLocaleString() : <span className="text-zinc-600">Never</span>}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-5 text-zinc-450 text-xs">
                                                    {new Date(usr.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-800/80">
                                <span className="text-xs text-zinc-400">
                                    Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total users)
                                </span>
                                <div className="flex space-x-2">
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

                {/* Modal: Invite Team Member */}
                {isInviteOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div
                            className="bg-zinc-900 border border-zinc-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
                            role="dialog"
                            aria-modal="true"
                        >
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                                <div>
                                    <h3 className="text-base font-bold text-white">Invite Team Member</h3>
                                    <p className="text-[10px] text-zinc-400 mt-0.5">Send an invitation email to add a user to your organization.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsInviteOpen(false)}
                                    className="text-zinc-550 hover:text-white transition cursor-pointer text-sm font-semibold"
                                >
                                    ✕
                                </button>
                            </div>

                            {inviteError && (
                                <Alert tone="danger" className="text-xs">
                                    {inviteError}
                                </Alert>
                            )}

                            <form onSubmit={handleInviteSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-zinc-350 block">First Name</label>
                                        <TextInput
                                            placeholder="e.g. John"
                                            value={inviteFirstName}
                                            onChange={(e) => setInviteFirstName(e.target.value)}
                                            required
                                            className="w-full text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-zinc-350 block">Last Name</label>
                                        <TextInput
                                            placeholder="e.g. Doe"
                                            value={inviteLastName}
                                            onChange={(e) => setInviteLastName(e.target.value)}
                                            required
                                            className="w-full text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Email Address</label>
                                    <TextInput
                                        type="email"
                                        placeholder="e.g. john.doe@organziation.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                        className="w-full text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Assigned Role</label>
                                    <Select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        required
                                        className="w-full text-xs"
                                    >
                                        <option value="" disabled>Select a role...</option>
                                        {user?.role === UserRole.ORG_ADMIN && (
                                            <>
                                                <option value={UserRole.ORG_ADMIN}>Organization Admin</option>
                                                <option value={UserRole.SALES_LEAD}>Sales Lead</option>
                                            </>
                                        )}
                                        {(user?.role === UserRole.ORG_ADMIN || user?.role === UserRole.SALES_LEAD) && (
                                            <option value={UserRole.SALES_REP}>Sales Representative</option>
                                        )}
                                    </Select>
                                </div>

                                <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-850">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsInviteOpen(false)}
                                        disabled={inviteSubmitting}
                                        className="text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={inviteSubmitting}
                                        className="text-xs"
                                    >
                                        {inviteSubmitting ? 'Sending...' : 'Send Invitation'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AppShell>
        </RoleGuard>
    );
}
