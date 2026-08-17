'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@shared/ui';
import { LeadStage, type Lead } from '@/lib/api';

type DashboardRecentLeadsProps = Readonly<{
    leads: Lead[];
    loading?: boolean;
}>;

export function DashboardRecentLeads({ leads, loading }: DashboardRecentLeadsProps) {
    const formatDate = (timestamp?: number) => {
        if (!timestamp) return '—';
        return new Date(Number(timestamp)).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStageBadgeStyle = (stage: LeadStage) => {
        switch (stage) {
            case LeadStage.NEW:
                return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
            case LeadStage.CONTACTED:
                return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case LeadStage.QUALIFIED:
                return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
            case LeadStage.CONVERTED:
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case LeadStage.LOST:
                return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default:
                return 'bg-zinc-800 text-zinc-300 border-zinc-700';
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="py-8 text-center text-xs text-zinc-500">Loading recent leads...</div>;
        }

        if (leads.length === 0) {
            return (
                <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                    No leads found. Create your first lead from the Leads Directory.
                </div>
            );
        }

        return (
            <div className="overflow-x-auto -mx-5 px-5">
                <Table>
                    <TableHead>
                        <TableRow className="border-b border-zinc-800/80 text-[11px] text-zinc-400 uppercase tracking-wider">
                            <TableHeaderCell className="py-2.5 font-semibold">LEAD</TableHeaderCell>
                            <TableHeaderCell className="py-2.5 font-semibold">STAGE</TableHeaderCell>
                            <TableHeaderCell className="py-2.5 font-semibold">OWNER</TableHeaderCell>
                            <TableHeaderCell className="py-2.5 font-semibold">CREATED</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leads.map((lead) => {
                            const ownerName = lead.owner
                                ? `${lead.owner.firstName || ''} ${lead.owner.lastName || ''}`.trim() || lead.owner.email
                                : '—';

                            return (
                                <TableRow
                                    key={lead.id}
                                    className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition text-xs"
                                >
                                    <TableCell className="font-semibold text-white py-3.5">
                                        <Link
                                            href={`/leads/${lead.id}`}
                                            className="hover:text-indigo-400 transition"
                                        >
                                            {lead.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="py-3.5">
                                        <span
                                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border tracking-wider uppercase inline-block ${getStageBadgeStyle(
                                                lead.stage,
                                            )}`}
                                        >
                                            {lead.stage}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-300 py-3.5">
                                        {ownerName}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 font-mono text-[11px] py-3.5">
                                        {formatDate(lead.createdAt)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <Card className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-tight">Recent leads</h3>
                <Link
                    href="/leads"
                    className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800/70 transition"
                >
                    View all
                </Link>
            </div>

            {/* Table or Placeholder */}
            {renderContent()}
        </Card>
    );
}
