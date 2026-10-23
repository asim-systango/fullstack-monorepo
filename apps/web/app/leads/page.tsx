'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@shared/ui';
import { AppShell } from '@/components/layout/app-shell';
import { leadsService, contactsService, usersApi, LeadStage, LeadSource, type Lead, type Contact, type UserResult } from '@/lib/api';
import { LeadsFilterBar, LeadsTable, LeadsKanban, CreateLeadModal } from '@/components/leads';
import { PageLoader, NotificationBanner } from '@/components/shared';
import { useAuthGuard, useNotification, useUserRole } from '@/lib/hooks';

export default function LeadsPage() {
    const { isAuthenticated, loading: authLoading } = useAuthGuard();
    const { canManage } = useUserRole();
    const { notification, setNotification, clearNotification } = useNotification();

    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('ALL');
    const [sourceFilter, setSourceFilter] = useState<string>('ALL');
    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [leadsList, setLeadsList] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [contactsList, setContactsList] = useState<Contact[]>([]);
    const [usersList, setUsersList] = useState<UserResult[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const response = await leadsService.getLeads({
                page, limit,
                search: debouncedSearch.trim() || undefined,
                stage: stageFilter !== 'ALL' ? (stageFilter as LeadStage) : undefined,
                source: sourceFilter !== 'ALL' ? (sourceFilter as LeadSource) : undefined,
            });
            setLeadsList(response?.data || []);
            setTotal(response?.total || 0);
            setTotalPages(response?.totalPages || 1);
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { message?: string } }; message?: string };
            setNotification({ message: apiError?.response?.data?.message || apiError?.message || 'Failed to load leads list.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, stageFilter, sourceFilter, setNotification]);

    useEffect(() => { if (isAuthenticated) void fetchLeads(); }, [isAuthenticated, fetchLeads]);

    const fetchFormDropdowns = useCallback(async () => {
        try {
            const [contactsRes, usersRes] = await Promise.all([
                contactsService.getContacts({ page: 1, limit: 100 }),
                usersApi.getUsers(),
            ]);
            setContactsList(Array.isArray(contactsRes) ? contactsRes : contactsRes?.data || []);
            setUsersList(Array.isArray(usersRes) ? usersRes : usersRes?.data || []);
        } catch { /* silently fail */ }
    }, []);

    useEffect(() => { if (isAuthenticated) void fetchFormDropdowns(); }, [isAuthenticated, fetchFormDropdowns]);

    const handleLeadCreated = (leadTitle: string) => {
        setNotification({ message: `Successfully created lead "${leadTitle}"!`, type: 'success' });
        void fetchLeads();
    };

    if (authLoading) return <PageLoader />;

    return (
        <AppShell
            title="Leads Directory"
            subtitle="View, filter, and manage sales leads and pipeline opportunities."
            headerActions={
                canManage ? (
                    <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} className="text-xs px-4 py-2">
                        + Create Lead
                    </Button>
                ) : undefined
            }
        >
            <NotificationBanner notification={notification} onDismiss={clearNotification} />
            <LeadsFilterBar
                search={searchTerm}
                onSearchChange={setSearchTerm}
                stageFilter={stageFilter}
                onStageFilterChange={(stage) => { setStageFilter(stage); setPage(1); }}
                sourceFilter={sourceFilter}
                onSourceFilterChange={(source) => { setSourceFilter(source); setPage(1); }}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
            {viewMode === 'list' ? (
                <LeadsTable leads={leadsList} loading={loading} page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
            ) : (
                <LeadsKanban leads={leadsList} loading={loading} />
            )}
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