'use client';

import React from 'react';
import { Card, Badge, type BadgeTone } from '@shared/ui';
import { LeadStage, type Lead } from '@/lib/api';

type LeadsKanbanProps = Readonly<{
    leads: Lead[];
    loading: boolean;
}>;

interface StageColumn {
    stage: LeadStage;
    label: string;
    tone: BadgeTone;
    borderColor: string;
    headerBg: string;
}

const STAGE_COLUMNS: StageColumn[] = [
    {
        stage: LeadStage.NEW,
        label: 'New',
        tone: 'neutral',
        borderColor: 'border-zinc-800',
        headerBg: 'bg-zinc-800/40',
    },
    {
        stage: LeadStage.CONTACTED,
        label: 'Contacted',
        tone: 'accent',
        borderColor: 'border-blue-900/60',
        headerBg: 'bg-blue-950/30',
    },
    {
        stage: LeadStage.QUALIFIED,
        label: 'Qualified',
        tone: 'accent',
        borderColor: 'border-purple-900/60',
        headerBg: 'bg-purple-950/30',
    },
    {
        stage: LeadStage.CONVERTED,
        label: 'Converted',
        tone: 'success',
        borderColor: 'border-emerald-900/60',
        headerBg: 'bg-emerald-950/30',
    },
    {
        stage: LeadStage.LOST,
        label: 'Lost',
        tone: 'danger',
        borderColor: 'border-red-900/60',
        headerBg: 'bg-red-950/30',
    },
];

export function LeadsKanban({ leads, loading }: LeadsKanbanProps) {
    if (loading) {
        return (
            <div className="py-12 text-center text-zinc-500 text-xs">
                Loading kanban board...
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {STAGE_COLUMNS.map((col) => {
                const columnLeads = leads.filter((lead) => lead.stage === col.stage);

                return (
                    <div
                        key={col.stage}
                        className={`flex flex-col bg-zinc-900/40 border ${col.borderColor} rounded-2xl overflow-hidden min-h-[420px]`}
                    >
                        {/* Column Header */}
                        <div className={`flex items-center justify-between px-4 py-3 border-b ${col.borderColor} ${col.headerBg}`}>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-white">{col.label}</span>
                                <Badge tone={col.tone}>
                                    {columnLeads.length}
                                </Badge>
                            </div>
                        </div>

                        {/* Column Cards Container */}
                        <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                            {columnLeads.length === 0 ? (
                                <div className="h-28 flex items-center justify-center text-[11px] text-zinc-600 border border-dashed border-zinc-800/80 rounded-xl">
                                    No leads in {col.label.toLowerCase()}
                                </div>
                            ) : (
                                columnLeads.map((lead) => {
                                    const contactName = lead.contact
                                        ? `${lead.contact.firstName || ''} ${lead.contact.lastName || ''}`.trim() || lead.contact.email
                                        : 'Unassigned Contact';

                                    const ownerName = lead.owner
                                        ? `${lead.owner.firstName || ''} ${lead.owner.lastName || ''}`.trim() || lead.owner.email
                                        : 'Unassigned';

                                    return (
                                        <Card
                                            key={lead.id}
                                            className="bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 p-3.5 rounded-xl space-y-2.5 transition-all shadow-md"
                                        >
                                            <div>
                                                <a
                                                    href={`/leads/${lead.id}`}
                                                    className="text-xs font-semibold text-white hover:text-indigo-300 hover:underline line-clamp-1 block"
                                                >
                                                    {lead.title}
                                                </a>
                                                {lead.description && (
                                                    <p className="text-[10px] text-zinc-450 line-clamp-2 mt-0.5">
                                                        {lead.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="text-[11px] text-zinc-300 bg-zinc-950/50 p-2 rounded-lg border border-zinc-850/60">
                                                <div className="font-medium text-white truncate">{contactName}</div>
                                                {lead.contact?.email && (
                                                    <div className="text-[10px] text-zinc-500 truncate">{lead.contact.email}</div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                                                <Badge tone="neutral">
                                                    {lead.source}
                                                </Badge>
                                                <span className="truncate max-w-[90px] text-zinc-450">{ownerName}</span>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
