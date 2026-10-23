'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { Alert, Button, Card } from '@shared/ui';
import { AppShell } from '@/components/layout/app-shell';
import { leadsService, contactsService, usersApi, activitiesService, LeadStage, type Lead, type Contact, type UserResult, type Activity } from '@/lib/api';
import { LeadStageStepper, LeadContactCard, LeadActivityTimeline, EditLeadModal } from '@/components/leads';
import { CreateDealModal } from '@/components/deals';
import { PageLoader, NotificationBanner } from '@/components/shared';
import { useAuthGuard, useNotification, useUserRole } from '@/lib/hooks';
import { getLeadStageBadgeClass } from '@/lib/utils/stage-badge';

type LeadDetailPageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
    const resolvedParams = use(params);
    const leadId = resolvedParams.id;

    const { isAuthenticated, loading: authLoading } = useAuthGuard();
    const { canManage } = useUserRole();
    const { notification, setNotification, clearNotification } = useNotification();

    const [lead, setLead] = useState<Lead | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [contactsList, setContactsList] = useState<Contact[]>([]);
    const [usersList, setUsersList] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [updatingStage, setUpdatingStage] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isConvertToDealOpen, setIsConvertToDealOpen] = useState(false);

    const fetchLeadDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await leadsService.getLeadDetails(leadId);
            setLead(data);
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { message?: string } }; message?: string };
            setNotification({ message: apiError?.response?.data?.message || apiError?.message || 'Failed to load lead details.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [leadId, setNotification]);

    const fetchActivities = useCallback(async () => {
        setActivitiesLoading(true);
        try {
            const all = await activitiesService.getAllActivities();
            setActivities(all.filter((act) => act.leadId === leadId));
        } catch { /* silently fail */ } finally {
            setActivitiesLoading(false);
        }
    }, [leadId]);

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

    useEffect(() => {
        if (isAuthenticated && leadId) {
            void fetchLeadDetails();
            void fetchActivities();
            void fetchFormDropdowns();
        }
    }, [isAuthenticated, leadId, fetchLeadDetails, fetchActivities, fetchFormDropdowns]);

    const handleStageChange = async (newStage: LeadStage) => {
        if (!leadId || (lead && lead.stage === newStage)) return;
        if (newStage === LeadStage.CONVERTED) { setIsConvertToDealOpen(true); return; }
        setUpdatingStage(true);
        try {
            const updatedLead = await leadsService.updateLeadStage(leadId, { stage: newStage });
            setLead(updatedLead);
            setNotification({ message: `Lead stage updated to ${newStage}!`, type: 'success' });
            void fetchActivities();
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { message?: string } }; message?: string };
            setNotification({ message: apiError?.response?.data?.message || apiError?.message || 'Failed to update lead stage.', type: 'error' });
        } finally { setUpdatingStage(false); }
    };

    const handleLeadUpdated = (updatedLead: Lead) => {
        setLead(updatedLead);
        setNotification({ message: 'Successfully updated lead details!', type: 'success' });
        void fetchLeadDetails();
    };

    const handleDealCreatedAndRedirect = (createdDeal: { id: string; title: string }) => {
        setNotification({ message: `Lead converted! Redirecting to deal "${createdDeal.title}"...`, type: 'success' });
    };

    if (authLoading || loading) return <PageLoader message="Loading lead details..." />;

    if (!lead) {
        return (
            <AppShell title="Lead Details" subtitle="View and manage sales lead details">
                <div className="max-w-xl mx-auto py-12 text-center text-zinc-400 space-y-4">
                    {notification && (
                        <Alert tone={notification.type === 'success' ? 'success' : 'danger'} className="text-xs mb-4 text-left">
                            {notification.message}
                        </Alert>
                    )}
                    <p className="text-sm text-zinc-300">Lead not found or access denied.</p>
                    <div>
                        <Link href="/leads" className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
                            &#8592; Back to leads directory
                        </Link>
                    </div>
                </div>
            </AppShell>
        );
    }

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
                    {canManage && lead.stage !== LeadStage.CONVERTED && (
                        <Button variant="primary" size="sm" onClick={() => setIsConvertToDealOpen(true)} className="text-xs px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20">
                            &#128188; Convert to Deal
                        </Button>
                    )}
                    {lead.stage === LeadStage.CONVERTED && (
                        <Link href="/deals">
                            <Button variant="primary" size="sm" className="text-xs px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/20">
                                &#128188; View in Deals &rarr;
                            </Button>
                        </Link>
                    )}
                    {canManage && (
                        <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)} className="text-xs px-4 py-2">
                            &#9999;&#65039; Edit Lead
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-6 max-w-7xl mx-auto">
                <div>
                    <Link href="/leads" className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-white transition">
                        &#8592; Back to leads
                    </Link>
                </div>
                <NotificationBanner notification={notification} onDismiss={clearNotification} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                                <div>
                                    <h1 className="text-lg font-bold text-white">{lead.title}</h1>
                                    {lead.description && <p className="text-xs text-zinc-400 mt-1">{lead.description}</p>}
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border tracking-wide uppercase shadow-sm ${getLeadStageBadgeClass(lead.stage)}`}>
                                    {lead.stage}
                                </span>
                            </div>
                            <LeadStageStepper
                                currentStage={lead.stage}
                                updating={updatingStage}
                                onStageChange={handleStageChange}
                                onConvertToDeal={() => setIsConvertToDealOpen(true)}
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-800 text-xs">
                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">CONTACT</div>
                                    <div className="text-indigo-400 font-semibold mt-1">{contactName}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">OWNER</div>
                                    <div className="text-zinc-200 font-medium mt-1">{ownerName}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">SOURCE</div>
                                    <div className="text-zinc-300 font-medium mt-1">{lead.source}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">CREATED</div>
                                    <div className="text-zinc-400 font-mono text-[11px] mt-1">
                                        {new Date(Number(lead.createdAt)).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </Card>
                        <LeadActivityTimeline leadId={lead.id} activities={activities} loading={activitiesLoading} onRefresh={fetchActivities} />
                    </div>
                    <div>
                        <LeadContactCard contact={lead.contact} />
                    </div>
                </div>
                <EditLeadModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} lead={lead} contacts={contactsList} users={usersList} onSuccess={handleLeadUpdated} />
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