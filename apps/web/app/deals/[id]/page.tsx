'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card } from '@shared/ui';
import { useAuth } from '@/components/auth';
import { AppShell } from '@/components/layout/app-shell';
import {
    dealsService,
    usersApi,
    activitiesService,
    DealStage,
    type Deal,
    type UserResult,
    type Activity,
} from '@/lib/api';
import {
    DealStageStepper,
    DealContactCard,
    DealActivityTimeline,
    EditDealModal,
} from '@/components/deals';

type DealDetailPageProps = Readonly<{
    params: Promise<{ id: string }>;
}>;

export default function DealDetailPage({ params }: DealDetailPageProps) {
    const resolvedParams = use(params);
    const dealId = resolvedParams.id;

    const router = useRouter();
    const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();

    const userRole = typeof currentUser?.role === 'object' && currentUser.role !== null
        ? (currentUser.role as { name?: string }).name || ''
        : (currentUser?.role as string) || '';
    const canEditDetails = userRole === 'ORG_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SALES_LEAD';

    const [deal, setDeal] = useState<Deal | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [usersList, setUsersList] = useState<UserResult[]>([]);

    const [loading, setLoading] = useState(true);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [updatingStage, setUpdatingStage] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    // Auto-dismiss notification after 4 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Auth Guard Redirect
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    // Fetch Deal Details
    const fetchDealDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await dealsService.getDealDetails(dealId);
            setDeal(data);
        } catch (err: unknown) {
            console.error('Failed to fetch deal details:', err);
            const apiError = err as { response?: { data?: { message?: string } }; message?: string };
            setNotification({
                message: apiError?.response?.data?.message || apiError?.message || 'Failed to load deal details.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [dealId]);

    // Fetch Activities for this deal
    const fetchActivities = useCallback(async () => {
        setActivitiesLoading(true);
        try {
            const allActivities = await activitiesService.getAllActivities();
            const dealActivities = allActivities.filter((act) => act.dealId === dealId);
            setActivities(dealActivities);
        } catch (err) {
            console.error('Failed to fetch deal activities:', err);
        } finally {
            setActivitiesLoading(false);
        }
    }, [dealId]);

    // Fetch Users for Edit Modal dropdown
    const fetchUsers = useCallback(async () => {
        try {
            const usersRes = await usersApi.getUsers();
            const usersData = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];
            setUsersList(usersData);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && dealId) {
            void fetchDealDetails();
            void fetchActivities();
            void fetchUsers();
        }
    }, [isAuthenticated, dealId, fetchDealDetails, fetchActivities, fetchUsers]);

    // Handle Stage Update
    const handleStageChange = async (newStage: DealStage) => {
        if (!dealId || (deal && deal.stage === newStage)) return;

        setUpdatingStage(true);
        try {
            const updatedDeal = await dealsService.updateDealStage(dealId, {
                stage: newStage,
            });

            setDeal(updatedDeal);
            setNotification({
                message: `Deal stage successfully updated to ${newStage}!`,
                type: 'success',
            });
            void fetchActivities();
        } catch (err: unknown) {
            console.error('Failed to update stage:', err);
            const apiError = err as { response?: { data?: { message?: string } }; message?: string };
            setNotification({
                message: apiError?.response?.data?.message || apiError?.message || 'Failed to update deal stage.',
                type: 'error',
            });
        } finally {
            setUpdatingStage(false);
        }
    };

    const handleDealUpdated = (updatedDeal: Deal) => {
        setDeal(updatedDeal);
        setNotification({
            message: 'Successfully updated deal details!',
            type: 'success',
        });
        void fetchDealDetails();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
                Loading deal details...
            </div>
        );
    }

    if (!deal) {
        return (
            <AppShell title="Deal Details" subtitle="View and manage deal opportunity">
                <div className="max-w-xl mx-auto py-12 text-center text-zinc-400 space-y-4">
                    {notification && (
                        <Alert
                            tone={notification.type === 'success' ? 'success' : 'danger'}
                            className="text-xs mb-4 text-left"
                        >
                            {notification.message}
                        </Alert>
                    )}
                    <p className="text-sm text-zinc-300">Deal not found or access denied.</p>
                    <div>
                        <Link href="/deals" className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
                            ← Back to deals directory
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

    const getDealStageBadgeClass = (stage: DealStage) => {
        switch (stage) {
            case DealStage.OPEN:
                return 'bg-zinc-800 text-zinc-300 border-zinc-700';
            case DealStage.DEMO:
                return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case DealStage.PROPOSAL:
                return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            case DealStage.NEGOTIATION:
                return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case DealStage.WON:
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case DealStage.LOST:
                return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
            default:
                return 'bg-zinc-800 text-zinc-300 border-zinc-700';
        }
    };

    return (
        <AppShell
            title="Deal Details"
            subtitle="Track progression, pipeline milestones, deal value, and interactions."
            headerActions={
                canEditDetails ? (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsEditOpen(true)}
                        className="text-xs px-4 py-2"
                    >
                        ✏️ Edit Deal
                    </Button>
                ) : undefined
            }
        >
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Back Link */}
                <div>
                    <Link
                        href="/deals"
                        className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-white transition"
                    >
                        ← Back to deals
                    </Link>
                </div>

                {notification && (
                    <div className="relative">
                        <Alert
                            tone={notification.type === 'success' ? 'success' : 'danger'}
                            className="text-xs mb-4 flex items-center justify-between"
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

                {/* Main Grid: Left Main Area & Right Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Top Main Deal Card */}
                        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                            {/* Header Title & Stage / Value */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-800">
                                <div>
                                    <h1 className="text-xl font-bold text-white tracking-tight">{deal.title}</h1>
                                    {deal.description && (
                                        <p className="text-xs text-zinc-400 mt-1">{deal.description}</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-1.5">
                                    <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                                        {formatCurrency(deal.amount)}
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border tracking-wide uppercase shadow-sm ${getDealStageBadgeClass(deal.stage)}`}>
                                        {deal.stage}
                                    </span>
                                </div>
                            </div>

                            {/* Visual Pipeline Progress Stepper */}
                            <DealStageStepper
                                currentStage={deal.stage}
                                updating={updatingStage}
                                onStageChange={handleStageChange}
                            />

                            {/* Deal Metrics & Details Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-800 text-xs">
                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        CONTACT
                                    </div>
                                    <div className="text-indigo-400 font-semibold mt-1 truncate">{contactName}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        OWNER
                                    </div>
                                    <div className="text-zinc-200 font-medium mt-1 truncate">{ownerName}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        WIN PROBABILITY
                                    </div>
                                    <div className="text-zinc-300 font-mono mt-1 flex items-center gap-1.5">
                                        <span>{deal.probability || 0}%</span>
                                        <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${Math.min(100, Math.max(0, deal.probability || 0))}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        EXPECTED CLOSE
                                    </div>
                                    <div className="text-zinc-300 font-mono text-[11px] mt-1">
                                        {deal.expectedCloseDate
                                            ? new Date(deal.expectedCloseDate).toLocaleDateString()
                                            : 'Not specified'}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Deal Activity Timeline */}
                        <DealActivityTimeline
                            dealId={deal.id}
                            activities={activities}
                            loading={activitiesLoading}
                            onRefresh={fetchActivities}
                        />
                    </div>

                    {/* Right Column (1/3 width) - Contact Info Card & Lead Info */}
                    <div>
                        <DealContactCard
                            contact={deal.contact}
                            lead={deal.lead}
                            leadId={deal.leadId}
                        />
                    </div>
                </div>

                {/* Edit Deal Modal */}
                <EditDealModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    deal={deal}
                    users={usersList}
                    onSuccess={handleDealUpdated}
                />
            </div>
        </AppShell>
    );
}
