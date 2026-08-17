'use client';

import React from 'react';
import Link from 'next/link';
import {
    Badge,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    type BadgeTone,
} from '@shared/ui';
import { DealStage, type Deal } from '@/lib/api';

type DealsTableProps = Readonly<{
    deals: Deal[];
    loading: boolean;
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (newPage: number) => void;
}>;

export function DealsTable({
    deals,
    loading,
    page,
    totalPages,
    total,
    onPageChange,
}: DealsTableProps) {
    const getStageBadgeTone = (stage: DealStage): BadgeTone => {
        switch (stage) {
            case DealStage.OPEN:
                return 'neutral';
            case DealStage.DEMO:
                return 'accent';
            case DealStage.PROPOSAL:
                return 'accent';
            case DealStage.NEGOTIATION:
                return 'accent';
            case DealStage.WON:
                return 'success';
            case DealStage.LOST:
                return 'danger';
            default:
                return 'neutral';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const renderTableBody = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500 text-xs">
                        Loading deals list...
                    </TableCell>
                </TableRow>
            );
        }

        if (deals.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500 text-xs">
                        No deals found.
                    </TableCell>
                </TableRow>
            );
        }

        return (
            <>
                {deals.map((deal) => {
                    const contactName = deal.contact
                        ? `${deal.contact.firstName || ''} ${deal.contact.lastName || ''}`.trim() || deal.contact.email
                        : 'Unassigned Contact';

                    const ownerName = deal.owner
                        ? `${deal.owner.firstName || ''} ${deal.owner.lastName || ''}`.trim() || deal.owner.email
                        : 'Unassigned';

                    return (
                        <TableRow
                            key={deal.id}
                            className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-all cursor-pointer"
                        >
                            <TableCell className="py-3.5 px-5 text-white font-medium text-xs">
                                <Link
                                    href={`/deals/${deal.id}`}
                                    className="hover:underline text-indigo-400 hover:text-indigo-300 font-semibold block"
                                >
                                    {deal.title}
                                </Link>
                                {deal.description && (
                                    <div className="text-zinc-500 text-[10px] font-normal truncate max-w-xs mt-0.5">
                                        {deal.description}
                                    </div>
                                )}
                            </TableCell>

                            <TableCell className="py-3.5 px-5 text-zinc-300 text-xs">
                                <div>{contactName}</div>
                                {deal.contact?.email && (
                                    <div className="text-zinc-500 text-[10px] truncate max-w-[160px]">
                                        {deal.contact.email}
                                    </div>
                                )}
                            </TableCell>

                            <TableCell className="py-3.5 px-5 text-xs font-semibold text-emerald-400">
                                {formatCurrency(deal.amount)}
                            </TableCell>

                            <TableCell className="py-3.5 px-5 text-xs">
                                <div className="flex items-center space-x-2">
                                    <span className="text-zinc-300 font-mono text-[11px]">
                                        {deal.probability || 0}%
                                    </span>
                                    <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${Math.min(100, Math.max(0, deal.probability || 0))}%` }}
                                        />
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className="py-3.5 px-5 text-xs">
                                <Badge tone={getStageBadgeTone(deal.stage)}>
                                    {deal.stage}
                                </Badge>
                            </TableCell>

                            <TableCell className="py-3.5 px-5 text-zinc-300 text-xs">
                                {ownerName}
                            </TableCell>

                            <TableCell className="py-3.5 px-5 text-zinc-400 text-xs font-mono text-[11px]">
                                {deal.expectedCloseDate
                                    ? new Date(deal.expectedCloseDate).toLocaleDateString()
                                    : '—'}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </>
        );
    };

    return (
        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
                <Table>
                    <TableHead>
                        <TableRow className="border-b border-zinc-800/80 bg-zinc-900/90">
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Deal Title
                            </TableHeaderCell>
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Contact
                            </TableHeaderCell>
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Value
                            </TableHeaderCell>
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Probability
                            </TableHeaderCell>
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Stage
                            </TableHeaderCell>
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Owner
                            </TableHeaderCell>
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Expected Close
                            </TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{renderTableBody()}</TableBody>
                </Table>
            </div>

            {/* Pagination Bar */}
            {!loading && deals.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-zinc-800/60 bg-zinc-900/40 text-xs text-zinc-400">
                    <div>
                        Showing {deals.length} of {total} deals (Page {page} of {totalPages})
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            disabled={page <= 1}
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            className="text-xs px-3 py-1.5"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="secondary"
                            disabled={page >= totalPages}
                            onClick={() => onPageChange(page + 1)}
                            className="text-xs px-3 py-1.5"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
