'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card } from '@shared/ui';
import { useAuth } from '@/components/auth';
import { AppShell } from '@/components/layout/app-shell';
import {
    dealsService,
    leadsService,
    usersApi,
    DealStage,
    type Deal,
    type Lead,
    type UserResult,
} from '@/lib/api';
import {
    DealsFilterBar,
    DealsTable,
    DealsKanban,
    CreateDealModal,
} from '@/components/deals';

export default function DealsPage() {
    const router = useRouter();
    const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();

    const userRole = typeof currentUser?.role === 'object' && currentUser.role !== null
        ? (currentUser.role as { name?: string }).name || ''
        : (currentUser?.role as string) || '';
    const canCreateDeal = userRole === 'ORG_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SALES_LEAD';

    // View Mode & Filter State
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('ALL');

    // Pagination State (Limit = 6)
    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Data & Modal State
    const [dealsList, setDealsList] = useState<Deal[]>([]);
    const [allDealsForKpis, setAllDealsForKpis] = useState<Deal[]>([]);
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
    const [leadsList, setLeadsList] = useState<Lead[]>([]);
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

    // Fetch Deals
    const fetchDeals = useCallback(async () => {
        setLoading(true);
        try {
            const response = await dealsService.getDeals({
                page,
                limit,
                search: debouncedSearch.trim() || undefined,
                stage: stageFilter !== 'ALL' ? (stageFilter as DealStage) : undefined,
            });

            setDealsList(response?.data || []);
            setTotal(response?.total || 0);
            setTotalPages(response?.totalPages || 1);
        } catch (error: unknown) {
            console.error('Failed to fetch deals:', error);
            const apiError = error as { response?: { data?: { message?: string } }; message?: string };
            setNotification({
                message: apiError?.response?.data?.message || apiError?.message || 'Failed to load deals list.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, stageFilter]);

    // Fetch all deals for KPI aggregation
    const fetchAllDealsForKpis = useCallback(async () => {
        try {
            const response = await dealsService.getDeals({ limit: 100 });
            setAllDealsForKpis(response?.data || []);
        } catch (err) {
            console.error('Failed to fetch KPI deals:', err);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            void fetchDeals();
            void fetchAllDealsForKpis();
        }
    }, [isAuthenticated, fetchDeals, fetchAllDealsForKpis]);

    // Fetch Leads & Users for Create Deal dropdowns
    const fetchFormDropdowns = useCallback(async () => {
        try {
            const [leadsRes, usersRes] = await Promise.all([
                leadsService.getLeads({ limit: 100 }),
                usersApi.getUsers(),
            ]);

            const leadsData = Array.isArray(leadsRes) ? leadsRes : leadsRes?.data || [];
            const usersData = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];

            setLeadsList(leadsData);
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

    const handleDealCreated = (dealTitle: string) => {
        setNotification({
            message: `Successfully created deal "${dealTitle}"!`,
            type: 'success',
        });
        void fetchDeals();
        void fetchAllDealsForKpis();
    };

    // Calculate KPI metrics
    const totalPipelineValue = allDealsForKpis.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const wonDeals = allDealsForKpis.filter((d) => d.stage === DealStage.WON);
    const totalClosed = allDealsForKpis.filter((d) => d.stage === DealStage.WON || d.stage === DealStage.LOST);
    const winRate = totalClosed.length > 0 ? Math.round((wonDeals.length / totalClosed.length) * 100) : 0;
    const avgDealSize = allDealsForKpis.length > 0 ? Math.round(totalPipelineValue / allDealsForKpis.length) : 0;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
                Loading...
            </div>
        );
    }

    // Filter out leads that already have deals attached
    const dealLeadIds = new Set(allDealsForKpis.map((d) => d.leadId).filter(Boolean));
    const availableLeadsForDeal = leadsList.filter((l) => !dealLeadIds.has(l.id));

    return (
        <AppShell
            title="Deals & Revenue Pipeline"
            subtitle="Track high-value opportunities, forecasted revenue, and pipeline conversion stages."
            headerActions={
                canCreateDeal ? (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsAddOpen(true)}
                        className="text-xs px-4 py-2"
                    >
                        + Create Deal
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

            {/* Quick KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl">
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Total Pipeline Value
                    </div>
                    <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
                        {formatCurrency(totalPipelineValue)}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                        {allDealsForKpis.length} opportunities
                    </div>
                </Card>

                <Card className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl">
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Active Opportunities
                    </div>
                    <div className="text-xl font-bold text-indigo-400 mt-1 font-mono">
                        {allDealsForKpis.filter((d) => d.stage !== DealStage.WON && d.stage !== DealStage.LOST).length}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                        In active progression
                    </div>
                </Card>

                <Card className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl">
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Win Rate
                    </div>
                    <div className="text-xl font-bold text-cyan-400 mt-1 font-mono">
                        {winRate}%
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                        {wonDeals.length} won / {totalClosed.length} closed
                    </div>
                </Card>

                <Card className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl">
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Avg Deal Size
                    </div>
                    <div className="text-xl font-bold text-white mt-1 font-mono">
                        {formatCurrency(avgDealSize)}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                        Across active portfolio
                    </div>
                </Card>
            </div>

            {/* Filter Bar with View Mode Switcher */}
            <DealsFilterBar
                search={searchTerm}
                onSearchChange={setSearchTerm}
                stageFilter={stageFilter}
                onStageFilterChange={(stage) => {
                    setStageFilter(stage);
                    setPage(1);
                }}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Conditional View Rendering: List vs Kanban */}
            {viewMode === 'list' ? (
                <DealsTable
                    deals={dealsList}
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    onPageChange={setPage}
                />
            ) : (
                <DealsKanban
                    deals={dealsList}
                    loading={loading}
                />
            )}

            {/* Create Deal Modal */}
            <CreateDealModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                leads={availableLeadsForDeal}
                users={usersList}
                onSuccess={(createdDeal) => handleDealCreated(createdDeal.title)}
            />
        </AppShell>
    );
}
