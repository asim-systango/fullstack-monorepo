'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { Alert, Button, Card } from '@shared/ui';
import { AppShell } from '@/components/layout/app-shell';
import { dealsService, usersApi, activitiesService, DealStage, type Deal, type UserResult, type Activity } from '@/lib/api';
import { DealStageStepper, DealContactCard, DealActivityTimeline, EditDealModal } from '@/components/deals';
import { PageLoader, NotificationBanner } from '@/components/shared';
import { useAuthGuard, useNotification, useUserRole } from '@/lib/hooks';
import { getDealStageBadgeClass } from '@/lib/utils/stage-badge';
import { formatCurrency } from '@/lib/utils/format';

type DealDetailPageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default function DealDetailPage({ params }: DealDetailPageProps) {
    const resolvedParams = use(params);
    const dealId = resolvedParams.id;

    const { isAuthenticated, loading: authLoading } = useAuthGuard();
    const { canManage } = useUserRole();
    const { notification, setNotification, clearNotification } = useNotification();

    const [deal, setDeal] = useState<Deal | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [usersList, setUsersList] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [updatingStage, setUpdatingStage] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const fetchDealDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await dealsService.getDealDetails(dealId);
            setDeal(data);
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { message?: string } }; message?: string };
            setNotification({ message: apiError?.response?.data?.message || apiError?.message || 'Failed to load deal details.', type: 'error' });
        } finally { setLoading(false); }
    }, [dealId, setNotification]);

    const fetchActivities = useCallback(async () => {
        setActivitiesLoading(true);
        try {
            const all = await activitiesService.getAllActivities();
            setActivities(all.filter((act) => act.dealId === dealId));
        } catch { /* silently fail */ } finally { setActivitiesLoading(false); }
    }, [dealId]);

    const fetchUsers = useCallback(async () => {
        try {
            const usersRes = await usersApi.getUsers();
            setUsersList(Array.isArray(usersRes) ? usersRes : usersRes?.data || []);
        } catch { /* silently fail */ }
    }, []);

    useEffect(() => {
        if (isAuthenticated && dealId) {
            void fetchDealDetails();
            void fetchActivities();
            void fetchUsers();
        }
    }, [isAuthenticated, dealId, fetchDealDetails, fetchActivities, fetchUsers]);

    const handleStageChange = async (newStage: DealStage) => {
        if (!dealId || (deal && deal.stage === newStage)) return;
        setUpdatingStage(true);
        try {
            const updatedDeal = await dealsService.updateDealStage(dealId, { stage: newStage });
            setDeal(updatedDeal);
            setNotification({ message: `Deal stage successfully updated to ${newStage}!`, type: 'success' });
            void fetchActivities();
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { message?: string } }; message?: string };
            setNotification({ message: apiError?.response?.data?.message || apiError?.message || 'Failed to update deal stage.', type: 'error' });
        } finally { setUpdatingStage(false); }
    };

    const handleDealUpdated = (updatedDeal: Deal) => {
        setDeal(updatedDeal);
        setNotification({ message: 'Successfully updated deal details!', type: 'success' });
        void fetchDealDetails();
    };

    if (authLoading || loading) return <PageLoader message="Loading deal details..." />;

    if (!deal) {
        return (
            <AppShell title="Deal Details" subtitle="View and manage deal opportunity">
                <div className="max-w-xl mx-auto py-12 text-center text-zinc-400 space-y-4">
                    {notification && (
                        <Alert tone={notification.type === 'success' ? 'success' : 'danger'} className="text-xs mb-4 text-left">
                            {notification.message}
                        </Alert>
                    )}
                    <p className="text-sm text-zinc-300">Deal not found or access denied.</p>
                    <div>
                        <Link href="/deals" className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
                            &#8592; Back to deals directory
                        </Link>
                    </div>
                </div>
            </AppShell>
        );
    }

    const contactName = deal.contact
        ? `${deal.contact.firstName || ''} ${deal.contact.lastName || ''}`.trim() || deal.contact.email
        : 'Unassigned Contact';

    const ownerName = deal.owner
        ? `${deal.owner.firstName || ''} ${deal.owner.lastName || ''}`.trim() || deal.owner.email
        : 'Unassigned';

    return (
        <AppShell
            title="Deal Details"
            subtitle="Track progression, pipeline milestones, deal value, and interactions."
            headerActions={
                canManage ? (
                    <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)} className="text-xs px-4 py-2">
                        &#9999;&#65039; Edit Deal
                    </Button>
                ) : undefined
            }
        >
            <div className="space-y-6 max-w-7xl mx-auto">
                <div>
                    <Link href="/deals" className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-white transition">
                        &#8592; Back to deals
                    </Link>
                </div>
                <NotificationBanner notification={notification} onDismiss={clearNotification} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-800">
                                <div>
                                    <h1 className="text-xl font-bold text-white tracking-tight">{deal.title}</h1>
                                    {deal.description && <p className="text-xs text-zinc-400 mt-1">{deal.description}</p>}
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-1.5">
                                    <div className="text-2xl font-extrabold text-emerald-400 font-mono">{formatCurrency(deal.amount)}</div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border tracking-wide uppercase shadow-sm ${getDealStageBadgeClass(deal.stage)}`}>
                                        {deal.stage}
                                    </span>
                                </div>
                            </div>
                            <DealStageStepper currentStage={deal.stage} updating={updatingStage} onStageChange={handleStageChange} />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-800 text-xs">
                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">CONTACT</div>
                                    <div className="text-indigo-400 font-semibold mt-1 truncate">{contactName}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">OWNER</div>
                                    <div className="text-zinc-200 font-medium mt-1 truncate">{ownerName}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">WIN PROBABILITY</div>
                                    <div className="text-zinc-300 font-mono mt-1 flex items-center gap-1.5">
                                        <span>{deal.probability || 0}%</span>
                                        <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, deal.probability || 0))}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">EXPECTED CLOSE</div>
                                    <div className="text-zinc-300 font-mono text-[11px] mt-1">
                                        {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'Not specified'}
                                    </div>
                                </div>
                            </div>
                        </Card>
                        <DealActivityTimeline dealId={deal.id} activities={activities} loading={activitiesLoading} onRefresh={fetchActivities} />
                    </div>
                    <div>
                        <DealContactCard contact={deal.contact} lead={deal.lead} leadId={deal.leadId} />
                    </div>
                </div>
                <EditDealModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} deal={deal} users={usersList} onSuccess={handleDealUpdated} />
            </div>
        </AppShell>
    );
}