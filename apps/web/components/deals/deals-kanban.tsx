'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, type BadgeTone } from '@shared/ui';
import { DealStage, type Deal } from '@/lib/api';

type DealsKanbanProps = Readonly<{
    deals: Deal[];
    loading: boolean;
}>;

interface StageColumn {
    stage: DealStage;
    label: string;
    tone: BadgeTone;
    borderColor: string;
    headerBg: string;
}

const STAGE_COLUMNS: StageColumn[] = [
    {
        stage: DealStage.OPEN,
        label: 'Open',
        tone: 'neutral',
        borderColor: 'border-zinc-800',
        headerBg: 'bg-zinc-800/40',
    },
    {
        stage: DealStage.DEMO,
        label: 'Demo',
        tone: 'accent',
        borderColor: 'border-blue-900/60',
        headerBg: 'bg-blue-950/30',
    },
    {
        stage: DealStage.PROPOSAL,
        label: 'Proposal',
        tone: 'accent',
        borderColor: 'border-purple-900/60',
        headerBg: 'bg-purple-950/30',
    },
    {
        stage: DealStage.NEGOTIATION,
        label: 'Negotiation',
        tone: 'accent',
        borderColor: 'border-amber-900/60',
        headerBg: 'bg-amber-950/30',
    },
    {
        stage: DealStage.WON,
        label: 'Won 🏆',
        tone: 'success',
        borderColor: 'border-emerald-900/60',
        headerBg: 'bg-emerald-950/30',
    },
    {
        stage: DealStage.LOST,
        label: 'Lost ❌',
        tone: 'danger',
        borderColor: 'border-red-900/60',
        headerBg: 'bg-red-950/30',
    },
];

export function DealsKanban({ deals, loading }: DealsKanbanProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="py-12 text-center text-zinc-500 text-xs">
                Loading deals kanban board...
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {STAGE_COLUMNS.map((col) => {
                const columnDeals = deals.filter((deal) => deal.stage === col.stage);
                const columnTotalValue = columnDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);

                return (
                    <div
                        key={col.stage}
                        className={`flex flex-col bg-zinc-900/40 border ${col.borderColor} rounded-2xl overflow-hidden min-h-[460px]`}
                    >
                        {/* Column Header */}
                        <div className={`flex flex-col gap-1 px-4 py-3 border-b ${col.borderColor} ${col.headerBg}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white">{col.label}</span>
                                <Badge tone={col.tone}>
                                    {columnDeals.length}
                                </Badge>
                            </div>
                            <div className="text-[11px] font-semibold text-emerald-400 font-mono">
                                {formatCurrency(columnTotalValue)}
                            </div>
                        </div>

                        {/* Column Cards Container */}
                        <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[620px]">
                            {columnDeals.length === 0 ? (
                                <div className="h-28 flex items-center justify-center text-[11px] text-zinc-600 border border-dashed border-zinc-800/80 rounded-xl text-center px-2">
                                    No deals in {col.label.toLowerCase()}
                                </div>
                            ) : (
                                columnDeals.map((deal) => {
                                    const contactName = deal.contact
                                        ? `${deal.contact.firstName || ''} ${deal.contact.lastName || ''}`.trim() || deal.contact.email
                                        : 'Unassigned Contact';

                                    const ownerName = deal.owner
                                        ? `${deal.owner.firstName || ''} ${deal.owner.lastName || ''}`.trim() || deal.owner.email
                                        : 'Unassigned';

                                    return (
                                        <Card
                                            key={deal.id}
                                            className="bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 p-3.5 rounded-xl space-y-2.5 transition-all shadow-md"
                                        >
                                            <div>
                                                <Link
                                                    href={`/deals/${deal.id}`}
                                                    className="text-xs font-semibold text-white hover:text-indigo-300 hover:underline line-clamp-1 block"
                                                >
                                                    {deal.title}
                                                </Link>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs font-bold text-emerald-400 font-mono">
                                                        {formatCurrency(deal.amount)}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 font-mono">
                                                        {deal.probability || 0}% prob
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Probability Progress Bar */}
                                            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full"
                                                    style={{ width: `${Math.min(100, Math.max(0, deal.probability || 0))}%` }}
                                                />
                                            </div>

                                            {/* Contact details */}
                                            <div className="text-[11px] text-zinc-300 bg-zinc-950/50 p-2 rounded-lg border border-zinc-850/60">
                                                <div className="font-medium text-white truncate">{contactName}</div>
                                                {deal.contact?.email && (
                                                    <div className="text-[10px] text-zinc-500 truncate">{deal.contact.email}</div>
                                                )}
                                            </div>

                                            {/* Footer owner & date */}
                                            <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                                                <span className="truncate max-w-[90px] text-zinc-300 font-medium">{ownerName}</span>
                                                {deal.expectedCloseDate && (
                                                    <span className="font-mono text-[9px] text-zinc-500">
                                                        {new Date(deal.expectedCloseDate).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                )}
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
