'use client';

import React from 'react';
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
import { LeadStage, type Lead } from '@/lib/api';

type LeadsTableProps = Readonly<{
    leads: Lead[];
    loading: boolean;
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (newPage: number) => void;
}>;

export function LeadsTable({
    leads,
    loading,
    page,
    totalPages,
    total,
    onPageChange,
}: LeadsTableProps) {
    const getStageBadgeTone = (stage: LeadStage): BadgeTone => {
        switch (stage) {
            case LeadStage.NEW:
                return 'neutral';
            case LeadStage.CONTACTED:
                return 'accent';
            case LeadStage.QUALIFIED:
                return 'accent';
            case LeadStage.CONVERTED:
                return 'success';
            case LeadStage.LOST:
                return 'danger';
            default:
                return 'neutral';
        }
    };

    const renderTableBody = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500 text-xs">
                        Loading leads list...
                    </TableCell>
                </TableRow>
            );
        }

        if (leads.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500 text-xs">
                        No leads found.
                    </TableCell>
                </TableRow>
            );
        }

        return (
            <>
                {leads.map((lead) => {
                    const contactName = lead.contact
                        ? `${lead.contact.firstName || ''} ${lead.contact.lastName || ''}`.trim() || lead.contact.email
                        : 'Unassigned Contact';

                    const ownerName = lead.owner
                        ? `${lead.owner.firstName || ''} ${lead.owner.lastName || ''}`.trim() || lead.owner.email
                        : 'Unassigned';

                    return (
                        <TableRow key={lead.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-all cursor-pointer">
                            <TableCell className="py-3.5 px-5 text-white font-medium text-xs">
                                <a
                                    href={`/leads/${lead.id}`}
                                    className="hover:underline text-indigo-400 hover:text-indigo-300 font-semibold"
                                >
                                    {lead.title}
                                </a>
                                {lead.description && (
                                    <div className="text-zinc-500 text-[10px] font-normal truncate max-w-xs">
                                        {lead.description}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="py-3.5 px-5 text-zinc-300 text-xs">
                                <div>{contactName}</div>
                                {lead.contact?.email && (
                                    <div className="text-zinc-500 text-[10px]">{lead.contact.email}</div>
                                )}
                            </TableCell>
                            <TableCell className="py-3.5 px-5 text-xs">
                                <Badge tone={getStageBadgeTone(lead.stage)}>
                                    {lead.stage}
                                </Badge>
                            </TableCell>
                            <TableCell className="py-3.5 px-5 text-xs">
                                <Badge tone="neutral">
                                    {lead.source}
                                </Badge>
                            </TableCell>
                            <TableCell className="py-3.5 px-5 text-zinc-300 text-xs">
                                {ownerName}
                            </TableCell>
                            <TableCell className="py-3.5 px-5 text-zinc-450 text-xs">
                                {new Date(Number(lead.createdAt)).toLocaleDateString()}
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
                                Lead Title
                            </TableHeaderCell>
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Contact
                            </TableHeaderCell>
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Stage
                            </TableHeaderCell>
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Source
                            </TableHeaderCell>
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Owner
                            </TableHeaderCell>
                            <TableHeaderCell className="py-3 px-5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Created Date
                            </TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{renderTableBody()}</TableBody>
                </Table>
            </div>

            {/* Pagination Bar */}
            {!loading && leads.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-zinc-800/60 bg-zinc-900/40 text-xs text-zinc-400">
                    <div>
                        Showing {leads.length} of {total} leads (Page {page} of {totalPages})
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
