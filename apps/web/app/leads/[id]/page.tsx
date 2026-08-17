'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card } from '@shared/ui';
import { useAuth } from '@/components/auth';
import { AppShell } from '@/components/layout/app-shell';
import {
    leadsService,
    contactsService,
    usersApi,
    activitiesService,
    LeadStage,
    type Lead,
    type Contact,
    type UserResult,
    type Activity,
} from '@/lib/api';
import {
    LeadStageStepper,
    LeadContactCard,
    LeadActivityTimeline,
    EditLeadModal,
} from '@/components/leads';
import { CreateDealModal } from '@/components/deals';

type LeadDetailPageProps = Readonly<{
    params: Promise<{ id: string }>;
}>;

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
    const resolvedParams = use(params);
    const leadId = resolvedParams.id;

    const router = useRouter();
    const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();

    const userRole = typeof currentUser?.role === 'object' && currentUser.role !== null
        ? (currentUser.role as { name?: string }).name || ''
        : (currentUser?.role as string) || '';
    const canEditDetails = userRole === 'ORG_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SALES_LEAD';

    const [lead, setLead] = useState<Lead | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [contactsList, setContactsList] = useState<Contact[]>([]);
    const [usersList, setUsersList] = useState<UserResult[]>([]);

    const [loading, setLoading] = useState(true);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [updatingStage, setUpdatingStage] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isConvertToDealOpen, setIsConvertToDealOpen] = useState(false);

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

    // Fetch Lead Details
    const fetchLeadDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await leadsService.getLeadDetails(leadId);
            setLead(data);
        } catch (err: unknown) {
            console.error('Failed to fetch lead details:', err);
            const apiError = err as { response?: { data?: { message?: string } }; message?: string };
            setNotification({
                message: apiError?.response?.data?.message || apiError?.message || 'Failed to load lead details.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    // Fetch Activities for this lead
    const fetchActivities = useCallback(async () => {
        setActivitiesLoading(true);
        try {
            const allActivities = await activitiesService.getAllActivities();
            const leadActivities = allActivities.filter((act) => act.leadId === leadId);
            setActivities(leadActivities);
        } catch (err) {
            console.error('Failed to fetch activities:', err);
        } finally {
            setActivitiesLoading(false);
        }
    }, [leadId]);

    // Fetch Contacts & Users for Edit Modal dropdowns
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
        if (isAuthenticated && leadId) {
            void fetchLeadDetails();
            void fetchActivities();
            void fetchFormDropdowns();
        }
    }, [isAuthenticated, leadId, fetchLeadDetails, fetchActivities, fetchFormDropdowns]);

    // Handle Stage Update
    const handleStageChange = async (newStage: LeadStage) => {
        if (!leadId || (lead && lead.stage === newStage)) return;

        // If user wants to mark converted, trigger the convert-to-deal modal directly
        if (newStage === LeadStage.CONVERTED) {
            setIsConvertToDealOpen(true);
            return;
        }

        setUpdatingStage(true);
        try {
            const updatedLead = await leadsService.updateLeadStage(leadId, {
                stage: newStage,
            });

            setLead(updatedLead);
            setNotification({
                message: `Lead stage updated to ${newStage}!`,
                type: 'success',
            });
            void fetchActivities();
        } catch (err: unknown) {
            console.error('Failed to update stage:', err);
            const apiError = err as { response?: { data?: { message?: string } }; message?: string };
            setNotification({
                message: apiError?.response?.data?.message || apiError?.message || 'Failed to update lead stage.',
                type: 'error',
            });
        } finally {
            setUpdatingStage(false);
        }
    };

    const handleLeadUpdated = (updatedLead: Lead) => {
        setLead(updatedLead);
        setNotification({
            message: 'Successfully updated lead details!',
            type: 'success',
        });
        void fetchLeadDetails();
    };

    const handleDealCreatedAndRedirect = (createdDeal: { id: string; title: string }) => {
        setNotification({
            message: `Lead converted! Redirecting to deal "${createdDeal.title}"...`,
            type: 'success',
        });
        // Redirect directly to the newly created deal page
        router.push(`/deals/${createdDeal.id}`);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
                Loading lead details...
            </div>
        );
    }

    if (!lead) {
        return (
            <AppShell title="Lead Details" subtitle="View and manage sales lead details">
                <div className="max-w-xl mx-auto py-12 text-center text-zinc-400 space-y-4">
                    {notification && (
                        <Alert
                            tone={notification.type === 'success' ? 'success' : 'danger'}
                            className="text-xs mb-4 text-left"
                        >
                            {notification.message}
                        </Alert>
                    )}
                    <p className="text-sm text-zinc-300">Lead not found or access denied.</p>
                    <div>
                        <Link href="/leads" className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
                            ← Back to leads directory
                        </Link>
                    </div>
                </div>
            </AppShell>
        );
    }

    const getStageBadgeTone = (stage: LeadStage) => {
        switch (stage) {
            case LeadStage.NEW:
                return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
            case LeadStage.CONTACTED:
                return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case LeadStage.QUALIFIED:
                return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
            case LeadStage.CONVERTED:
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case LeadStage.LOST:
                return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
            default:
                return 'bg-zinc-800 text-zinc-300 border-zinc-700';
        }
    };

    const contactName = lead.contact
        ? `${lead.contact.firstName || ''} ${lead.contact.lastName || ''}`.trim() || lead.contact.email
        : 'Unassigned Contact';

    const ownerName = lead.owner
        ? `${lead.owner.firstName || ''} ${lead.owner.lastName || ''}`.trim() || lead.owner.email
        : 'Unassigned';

    return (
        <AppShell
            title="Lead Details"
            subtitle="View, track pipeline progress, update stage, and log activities for this lead."
            headerActions={
                <div className="flex items-center gap-2.5">
                    {canEditDetails && lead.stage !== LeadStage.CONVERTED && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsConvertToDealOpen(true)}
                            className="text-xs px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20"
                        >
                            💼 Convert to Deal
                        </Button>
                    )}

                    {lead.stage === LeadStage.CONVERTED && (
                        <Link href="/deals">
                            <Button
                                variant="primary"
                                size="sm"
                                className="text-xs px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/20"
                            >
                                💼 View in Deals →
                            </Button>
                        </Link>
                    )}

                    {canEditDetails && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsEditOpen(true)}
                            className="text-xs px-4 py-2"
                        >
                            ✏️ Edit Lead
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Back Link */}
                <div>
                    <Link
                        href="/leads"
                        className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-white transition"
                    >
                        ← Back to leads
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

                {/* Main Grid: Left Main Area & Right Contact Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Top Main Lead Card */}
                        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                            {/* Header Title & Stage Badge */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                                <div>
                                    <h1 className="text-lg font-bold text-white">{lead.title}</h1>
                                    {lead.description && (
                                        <p className="text-xs text-zinc-400 mt-1">{lead.description}</p>
                                    )}
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border tracking-wide uppercase shadow-sm ${getStageBadgeTone(lead.stage)}`}>
                                    {lead.stage}
                                </span>
                            </div>

                            {/* Visual Pipeline Progress Stepper & Actions */}
                            <LeadStageStepper
                                currentStage={lead.stage}
                                updating={updatingStage}
                                onStageChange={handleStageChange}
                                onConvertToDeal={() => setIsConvertToDealOpen(true)}
                            />

                            {/* Lead Details Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-800 text-xs">
                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        CONTACT
                                    </div>
                                    <div className="text-indigo-400 font-semibold mt-1">{contactName}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        OWNER
                                    </div>
                                    <div className="text-zinc-200 font-medium mt-1">{ownerName}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        SOURCE
                                    </div>
                                    <div className="text-zinc-300 font-medium mt-1">{lead.source}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        CREATED
                                    </div>
                                    <div className="text-zinc-400 font-mono text-[11px] mt-1">
                                        {new Date(Number(lead.createdAt)).toLocaleDateString(undefined, {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Activity Timeline Card */}
                        <LeadActivityTimeline
                            leadId={lead.id}
                            activities={activities}
                            loading={activitiesLoading}
                            onRefresh={fetchActivities}
                        />
                    </div>

                    {/* Right Column (1/3 width) - Contact Info Card */}
                    <div>
                        <LeadContactCard contact={lead.contact} />
                    </div>
                </div>

                {/* Edit Lead Modal Component */}
                <EditLeadModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    lead={lead}
                    contacts={contactsList}
                    users={usersList}
                    onSuccess={handleLeadUpdated}
                />

                {/* Convert Lead to Deal Modal Component */}
                <CreateDealModal
                    isOpen={isConvertToDealOpen}
                    onClose={() => setIsConvertToDealOpen(false)}
                    leads={lead ? [lead] : []}
                    initialLeadId={lead?.id}
                    users={usersList}
                    onSuccess={handleDealCreatedAndRedirect}
                />
            </div>
        </AppShell>
    );
}
