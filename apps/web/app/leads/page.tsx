'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button } from '@shared/ui';
import { useAuth } from '@/components/auth';
import { AppShell } from '@/components/layout/app-shell';
import {
    leadsService,
    contactsService,
    usersApi,
    LeadStage,
    LeadSource,
    type Lead,
    type Contact,
    type UserResult,
} from '@/lib/api';
import {
    LeadsFilterBar,
    LeadsTable,
    LeadsKanban,
    CreateLeadModal,
} from '@/components/leads';

export default function LeadsPage() {
    const router = useRouter();
    const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();

    const userRole = typeof currentUser?.role === 'object' && currentUser.role !== null ? (currentUser.role as { name?: string }).name || '' : (currentUser?.role as string) || '';
    const canCreateLead = userRole === 'ORG_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SALES_LEAD';

    // View Mode & Filter State
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('ALL');
    const [sourceFilter, setSourceFilter] = useState<string>('ALL');

    // Pagination State (Limit = 6 per user request)
    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Data & Modal State
    const [leadsList, setLeadsList] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Auto-dismiss notification after 4 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [contactsList, setContactsList] = useState<Contact[]>([]);
    const [usersList, setUsersList] = useState<UserResult[]>([]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Auth Redirect
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    // Fetch Leads
    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const response = await leadsService.getLeads({
                page,
                limit,
                search: debouncedSearch.trim() || undefined,
                stage: stageFilter !== 'ALL' ? (stageFilter as LeadStage) : undefined,
                source: sourceFilter !== 'ALL' ? (sourceFilter as LeadSource) : undefined,
            });

            setLeadsList(response?.data || []);
            setTotal(response?.total || 0);
            setTotalPages(response?.totalPages || 1);
        } catch (error: unknown) {
            console.error('Failed to fetch leads:', error);
            const apiError = error as { response?: { data?: { message?: string } }; message?: string };
            setNotification({
                message: apiError?.response?.data?.message || apiError?.message || 'Failed to load leads list.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, stageFilter, sourceFilter]);

    useEffect(() => {
        if (isAuthenticated) {
            void fetchLeads();
        }
    }, [isAuthenticated, fetchLeads]);

    // Fetch Contacts & Users for modal form dropdowns
    const fetchFormDropdowns = useCallback(async () => {
        try {
            const [contactsRes, usersRes] = await Promise.all([
                contactsService.getContacts({ page: 1, limit: 100 }),
                usersApi.getUsers(),
            ]);

            const contactsData = Array.isArray(contactsRes) ? contactsRes : contactsRes?.data || [];
            const usersData = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];

            setContactsList(contactsData);
            setUsersList(usersData);
        } catch (err) {
            console.error('Error fetching dropdown choices:', err);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            void fetchFormDropdowns();
        }
    }, [isAuthenticated, fetchFormDropdowns]);

    const handleLeadCreated = (leadTitle: string) => {
        setNotification({
            message: `Successfully created lead "${leadTitle}"!`,
            type: 'success',
        });
        void fetchLeads();
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
                Loading...
            </div>
        );
    }

    return (
        <AppShell
            title="Leads Directory"
            subtitle="View, filter, and manage sales leads and pipeline opportunities."
            headerActions={
                canCreateLead ? (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsAddOpen(true)}
                        className="text-xs px-4 py-2"
                    >
                        + Create Lead
                    </Button>
                ) : undefined
            }
        >
            {notification && (
                <div className="relative">
                    <Alert
                        tone={notification.type === 'success' ? 'success' : 'danger'}
                        className="text-xs mb-5 flex items-center justify-between"
                    >
                        <span>{notification.message}</span>
                        <button
                            type="button"
                            onClick={() => setNotification(null)}
                            className="ml-3 text-zinc-400 hover:text-white transition font-bold text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </Alert>
                </div>
            )}

            {/* Filter Bar with View Mode Switcher */}
            <LeadsFilterBar
                search={searchTerm}
                onSearchChange={setSearchTerm}
                stageFilter={stageFilter}
                onStageFilterChange={(stage) => {
                    setStageFilter(stage);
                    setPage(1);
                }}
                sourceFilter={sourceFilter}
                onSourceFilterChange={(source) => {
                    setSourceFilter(source);
                    setPage(1);
                }}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Conditional View Rendering: List vs Kanban */}
            {viewMode === 'list' ? (
                <LeadsTable
                    leads={leadsList}
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    onPageChange={setPage}
                />
            ) : (
                <LeadsKanban
                    leads={leadsList}
                    loading={loading}
                />
            )}

            {/* Create Modal Component */}
            <CreateLeadModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                contacts={contactsList}
                users={usersList}
                onSuccess={handleLeadCreated}
            />
        </AppShell>
    );
}
