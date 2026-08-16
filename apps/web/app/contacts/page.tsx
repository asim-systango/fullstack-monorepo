'use client';

import { useEffect, useState, useCallback, type SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
    Alert,
    Badge,
    Button,
    Card,
    CardBody,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    TextInput,
    Select,
    type BadgeTone,
} from '@shared/ui';
import { useAuth } from '@/components/auth';
import { AppShell } from '@/components/layout/app-shell';
import {
    contactsService,
    ContactSource,
    ContactStatus,
    type Contact,
} from '@/lib/api';

export default function ContactsPage() {
    const router = useRouter();
    const { isAuthenticated, user, loading: authLoading } = useAuth();

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [sourceFilter, setSourceFilter] = useState<string>('ALL');

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Data State
    const [contactsList, setContactsList] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    // Form Fields State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [designation, setDesignation] = useState('');
    const [source, setSource] = useState<ContactSource>(ContactSource.MANUAL);
    const [status, setStatus] = useState<ContactStatus>(ContactStatus.ACTIVE);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Redirect if guest
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch API handler
    const fetchContacts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: debouncedSearch.trim() || undefined,
                source: sourceFilter !== 'ALL' ? (sourceFilter as ContactSource) : undefined,
                status: statusFilter !== 'ALL' ? (statusFilter as ContactStatus) : undefined,
            };
            const response = await contactsService.getContacts(params);
            let dataList: Contact[] = [];
            if (Array.isArray(response?.data)) {
                dataList = response.data;
            } else if (Array.isArray(response)) {
                dataList = response;
            }
            setContactsList(dataList);
            setTotal(response?.meta?.total || dataList.length);
            setTotalPages(response?.meta?.totalPages || 1);
        } catch (error: unknown) {
            console.error('Failed to fetch contacts:', error);
        } finally {
            setLoading(false);
        }
    }, [user, page, limit, debouncedSearch, sourceFilter, statusFilter]);

    useEffect(() => {
        if (isAuthenticated) {
            void fetchContacts();
        }
    }, [isAuthenticated, fetchContacts]);

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setCompanyName('');
        setDesignation('');
        setSource(ContactSource.MANUAL);
        setStatus(ContactStatus.ACTIVE);
        setFormError(null);
    };

    const openAddModal = () => {
        resetForm();
        setIsAddOpen(true);
    };

    const openEditModal = (contact: Contact) => {
        setSelectedContact(contact);
        setFirstName(contact.firstName);
        setLastName(contact.lastName);
        setEmail(contact.email || '');
        setPhone(contact.phone);
        setCompanyName(contact.companyName || '');
        setDesignation(contact.designation || '');
        setSource(contact.source);
        setStatus(contact.status);
        setFormError(null);
        setIsEditOpen(true);
    };

    const handleAddSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
            setFormError('First Name, Last Name and Phone Number are required.');
            return;
        }

        setFormSubmitting(true);
        setFormError(null);
        try {
            await contactsService.createContact({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim() || undefined,
                phone: phone.trim(),
                companyName: companyName.trim() || undefined,
                designation: designation.trim() || undefined,
                source,
            });

            setNotification({
                message: `Successfully created contact ${firstName} ${lastName}!`,
                type: 'success',
            });

            setIsAddOpen(false);
            resetForm();
            void fetchContacts();
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { message?: string } }; message?: string };
            setFormError(apiError?.response?.data?.message || apiError?.message || 'Failed to create contact.');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedContact) return;
        if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
            setFormError('First Name, Last Name and Phone Number are required.');
            return;
        }

        setFormSubmitting(true);
        setFormError(null);
        try {
            await contactsService.updateContact(selectedContact.id, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim() || undefined,
                phone: phone.trim(),
                companyName: companyName.trim() || undefined,
                designation: designation.trim() || undefined,
                source,
                status,
            });

            setNotification({
                message: `Successfully updated contact ${firstName} ${lastName}!`,
                type: 'success',
            });

            setIsEditOpen(false);
            setSelectedContact(null);
            resetForm();
            void fetchContacts();
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { message?: string } }; message?: string };
            setFormError(apiError?.response?.data?.message || apiError?.message || 'Failed to update contact.');
        } finally {
            setFormSubmitting(false);
        }
    };

    const getSourceBadgeTone = (src: ContactSource): BadgeTone => {
        switch (src) {
            case ContactSource.WEBSITE:
                return 'neutral';
            case ContactSource.REFERRAL:
                return 'accent';
            case ContactSource.API:
                return 'neutral';
            case ContactSource.IMPORT:
                return 'neutral';
            default:
                return 'neutral';
        }
    };

    const getStatusBadgeTone = (stat: ContactStatus): BadgeTone => {
        return stat === ContactStatus.ACTIVE ? 'success' : 'danger';
    };

    const headerActions = (
        <Button variant="primary" onClick={openAddModal} className="text-xs">
            + Add Contact
        </Button>
    );

    const renderTableBody = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500 text-xs">
                        Loading contacts list...
                    </TableCell>
                </TableRow>
            );
        }

        if (contactsList.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500 text-xs">
                        No contacts found.
                    </TableCell>
                </TableRow>
            );
        }

        return (
            <>
                {contactsList.map((contact) => (
                    <TableRow key={contact.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-all">
                        <TableCell className="py-3.5 px-5 text-white font-medium text-xs">
                            <div>{contact.firstName} {contact.lastName}</div>
                            {contact.designation && (
                                <div className="text-zinc-500 text-[10px] font-normal">
                                    {contact.designation} {contact.companyName ? `@ ${contact.companyName}` : ''}
                                </div>
                            )}
                        </TableCell>
                        <TableCell className="py-3.5 px-5 text-zinc-300 text-xs">
                            {contact.email || '-'}
                        </TableCell>
                        <TableCell className="py-3.5 px-5 text-zinc-300 text-xs">
                            {contact.phone}
                        </TableCell>
                        <TableCell className="py-3.5 px-5 text-xs">
                            <Badge tone={getSourceBadgeTone(contact.source)}>
                                {contact.source}
                            </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 px-5 text-xs">
                            <Badge tone={getStatusBadgeTone(contact.status)}>
                                {contact.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 px-5 text-zinc-450 text-xs">
                            {new Date(Number(contact.createdAt)).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-3.5 px-5 text-right text-xs">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(contact)}
                                className="text-violet-400 hover:text-violet-300 text-xs"
                            >
                                Edit
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </>
        );
    };

    return (
        <AppShell
            title="Contacts Directory"
            subtitle="View, filter, and manage customer contacts for your organization."
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

            {/* Search and Filters Bar */}
            <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <TextInput
                            placeholder="Search by name, email or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-xs"
                        />
                    </div>
                    <div>
                        <Select
                            value={sourceFilter}
                            onChange={(e) => {
                                setSourceFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full text-xs"
                        >
                            <option value="ALL">All Sources</option>
                            <option value={ContactSource.WEBSITE}>Website</option>
                            <option value={ContactSource.MANUAL}>Manual</option>
                            <option value={ContactSource.REFERRAL}>Referral</option>
                            <option value={ContactSource.API}>API</option>
                            <option value={ContactSource.IMPORT}>Import</option>
                        </Select>
                    </div>
                    <div>
                        <Select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full text-xs"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value={ContactStatus.ACTIVE}>Active</option>
                            <option value={ContactStatus.INACTIVE}>Inactive</option>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Contacts Table Listing */}
            <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                <CardBody className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHead>
                                <TableRow className="border-b border-zinc-800/80">
                                    <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Name</TableHeaderCell>
                                    <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Email</TableHeaderCell>
                                    <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Phone</TableHeaderCell>
                                    <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Source</TableHeaderCell>
                                    <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Status</TableHeaderCell>
                                    <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5">Created</TableHeaderCell>
                                    <TableHeaderCell className="text-zinc-400 font-semibold text-xs py-3.5 px-5 text-right">Actions</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {renderTableBody()}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-800/80">
                            <span className="text-xs text-zinc-400">
                                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total contacts)
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

            {/* Modal: Add Contact */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                            <div>
                                <h3 className="text-base font-bold text-white">Add New Contact</h3>
                                <p className="text-[10px] text-zinc-400 mt-0.5">Enter contact details for your organization catalog.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddOpen(false)}
                                className="text-zinc-550 hover:text-white transition cursor-pointer text-sm font-semibold"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <Alert tone="danger" className="text-xs">
                                {formError}
                            </Alert>
                        )}

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">First Name *</label>
                                    <TextInput
                                        placeholder="e.g. Jane"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="w-full text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Last Name *</label>
                                    <TextInput
                                        placeholder="e.g. Smith"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="w-full text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Email Address</label>
                                    <TextInput
                                        type="email"
                                        placeholder="e.g. jane.smith@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Phone Number *</label>
                                    <TextInput
                                        placeholder="e.g. +1234567890"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="w-full text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Company Name</label>
                                    <TextInput
                                        placeholder="e.g. Acme Corp"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Designation</label>
                                    <TextInput
                                        placeholder="e.g. Purchasing Manager"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        className="w-full text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-zinc-350 block">Source</label>
                                <Select
                                    value={source}
                                    onChange={(e) => setSource(e.target.value as ContactSource)}
                                    className="w-full text-xs"
                                >
                                    <option value={ContactSource.MANUAL}>Manual</option>
                                    <option value={ContactSource.WEBSITE}>Website</option>
                                    <option value={ContactSource.REFERRAL}>Referral</option>
                                    <option value={ContactSource.API}>API</option>
                                    <option value={ContactSource.IMPORT}>Import</option>
                                </Select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-850">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAddOpen(false)}
                                    disabled={formSubmitting}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={formSubmitting}
                                    className="text-xs"
                                >
                                    {formSubmitting ? 'Creating...' : 'Create Contact'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Contact */}
            {isEditOpen && selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                            <div>
                                <h3 className="text-base font-bold text-white">Edit Contact</h3>
                                <p className="text-[10px] text-zinc-400 mt-0.5">Update information for {selectedContact.firstName} {selectedContact.lastName}.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                                className="text-zinc-550 hover:text-white transition cursor-pointer text-sm font-semibold"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <Alert tone="danger" className="text-xs">
                                {formError}
                            </Alert>
                        )}

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">First Name *</label>
                                    <TextInput
                                        placeholder="e.g. Jane"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="w-full text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Last Name *</label>
                                    <TextInput
                                        placeholder="e.g. Smith"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="w-full text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Email Address</label>
                                    <TextInput
                                        type="email"
                                        placeholder="e.g. jane.smith@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Phone Number *</label>
                                    <TextInput
                                        placeholder="e.g. +1234567890"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="w-full text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Company Name</label>
                                    <TextInput
                                        placeholder="e.g. Acme Corp"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Designation</label>
                                    <TextInput
                                        placeholder="e.g. Purchasing Manager"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        className="w-full text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Source</label>
                                    <Select
                                        value={source}
                                        onChange={(e) => setSource(e.target.value as ContactSource)}
                                        className="w-full text-xs"
                                    >
                                        <option value={ContactSource.MANUAL}>Manual</option>
                                        <option value={ContactSource.WEBSITE}>Website</option>
                                        <option value={ContactSource.REFERRAL}>Referral</option>
                                        <option value={ContactSource.API}>API</option>
                                        <option value={ContactSource.IMPORT}>Import</option>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-350 block">Status</label>
                                    <Select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as ContactStatus)}
                                        className="w-full text-xs"
                                    >
                                        <option value={ContactStatus.ACTIVE}>Active</option>
                                        <option value={ContactStatus.INACTIVE}>Inactive</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-850">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsEditOpen(false)}
                                    disabled={formSubmitting}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={formSubmitting}
                                    className="text-xs"
                                >
                                    {formSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
