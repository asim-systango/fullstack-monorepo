'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@shared/ui';
import { DealStage, type Deal } from '@/lib/api';
import { formatCurrencyINR } from './dashboard-kpi-cards';

type DashboardRecentDealsProps = Readonly<{
    deals: Deal[];
    loading?: boolean;
}>;

export function DashboardRecentDeals({ deals, loading }: DashboardRecentDealsProps) {
    const formatDate = (dateStr?: string | number) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getDealStageBadgeStyle = (stage: DealStage) => {
        switch (stage) {
            case DealStage.OPEN:
                return 'bg-zinc-800 text-zinc-300 border-zinc-700';
            case DealStage.DEMO:
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case DealStage.PROPOSAL:
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
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
        <Card className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-tight">Recent deals</h3>
                <Link
                    href="/deals"
                    className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800/70 transition"
                >
                    View all
                </Link>
            </div>

            {/* Table */}
            {loading ? (
                <div className="py-8 text-center text-xs text-zinc-500">Loading recent deals...</div>
            ) : deals.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                    No active deals found. Convert an existing lead to create your first deal.
                </div>
            ) : (
                <div className="overflow-x-auto -mx-5 px-5">
                    <Table>
                        <TableHead>
                            <TableRow className="border-b border-zinc-800/80 text-[11px] text-zinc-400 uppercase tracking-wider">
                                <TableHeaderCell className="py-2.5 font-semibold">DEAL</TableHeaderCell>
                                <TableHeaderCell className="py-2.5 font-semibold">STAGE</TableHeaderCell>
                                <TableHeaderCell className="py-2.5 font-semibold">AMOUNT</TableHeaderCell>
                                <TableHeaderCell className="py-2.5 font-semibold">CLOSE DATE</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {deals.map((deal) => (
                                <TableRow
                                    key={deal.id}
                                    className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition text-xs"
                                >
                                    <TableCell className="font-semibold text-white py-3.5">
                                        <Link
                                            href={`/deals/${deal.id}`}
                                            className="hover:text-indigo-400 transition"
                                        >
                                            {deal.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="py-3.5">
                                        <span
                                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border tracking-wider uppercase inline-block ${getDealStageBadgeStyle(
                                                deal.stage,
                                            )}`}
                                        >
                                            {deal.stage}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-emerald-400 font-mono font-bold py-3.5">
                                        {formatCurrencyINR(deal.amount)}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 font-mono text-[11px] py-3.5">
                                        {formatDate(deal.expectedCloseDate)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </Card>
    );
}
