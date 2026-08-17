'use client';

import React from 'react';
import { Card } from '@shared/ui';
import type { WorkspaceKpis } from '@/lib/api';

type DashboardKpiCardsProps = Readonly<{
    kpis: WorkspaceKpis | null;
    loading?: boolean;
}>;

export function formatCurrencyINR(val: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(val || 0);
}

export function DashboardKpiCards({ kpis, loading }: DashboardKpiCardsProps) {
    const openLeads = kpis ? kpis.openLeadsCount : 0;
    const totalLeads = kpis ? kpis.totalLeadsCount : 0;
    const openPipelineAmount = kpis ? kpis.openPipelineAmount : 0;
    const activeDeals = kpis ? kpis.activeDealsCount : 0;
    const wonAmount = kpis ? kpis.wonAmount : 0;
    const wonDeals = kpis ? kpis.wonDealsCount : 0;
    const contactsCount = kpis ? kpis.contactsCount : 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Open leads */}
            <Card className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:border-zinc-700 transition">
                <div className="text-xs font-semibold text-zinc-400">
                    Open leads
                </div>
                <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                    {loading ? '...' : openLeads}
                </div>
                <div className="text-xs text-zinc-500 mt-1 font-medium">
                    {loading ? 'Loading...' : `${totalLeads} total`}
                </div>
            </Card>

            {/* Card 2: Open pipeline */}
            <Card className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:border-zinc-700 transition">
                <div className="text-xs font-semibold text-zinc-400">
                    Open pipeline
                </div>
                <div className="text-3xl font-extrabold text-white mt-2 tracking-tight font-mono">
                    {loading ? '...' : formatCurrencyINR(openPipelineAmount)}
                </div>
                <div className="text-xs text-zinc-500 mt-1 font-medium">
                    {loading ? 'Loading...' : `${activeDeals} active deals`}
                </div>
            </Card>

            {/* Card 3: Won this period */}
            <Card className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:border-zinc-700 transition">
                <div className="text-xs font-semibold text-zinc-400">
                    Won this period
                </div>
                <div className="text-3xl font-extrabold text-white mt-2 tracking-tight font-mono">
                    {loading ? '...' : formatCurrencyINR(wonAmount)}
                </div>
                <div className="text-xs text-zinc-500 mt-1 font-medium">
                    {loading ? 'Loading...' : `${wonDeals} deals closed`}
                </div>
            </Card>

            {/* Card 4: Contacts */}
            <Card className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:border-zinc-700 transition">
                <div className="text-xs font-semibold text-zinc-400">
                    Contacts
                </div>
                <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                    {loading ? '...' : contactsCount}
                </div>
                <div className="text-xs text-zinc-500 mt-1 font-medium">
                    In your organization
                </div>
            </Card>
        </div>
    );
}
