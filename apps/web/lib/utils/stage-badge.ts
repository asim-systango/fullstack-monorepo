import type { LeadStage } from '@/lib/api/types/leads.types';
import type { DealStage } from '@/lib/api/types/deals.types';

export function getLeadStageBadgeClass(stage: LeadStage): string {
    const map: Record<string, string> = {
        NEW: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        CONTACTED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        QUALIFIED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        CONVERTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        LOST: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    };
    return map[stage] ?? 'bg-zinc-800 text-zinc-300 border-zinc-700';
}

export function getDealStageBadgeClass(stage: DealStage): string {
    const map: Record<string, string> = {
        OPEN: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        DEMO: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        PROPOSAL: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        NEGOTIATION: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        WON: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        LOST: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    };
    return map[stage] ?? 'bg-zinc-800 text-zinc-300 border-zinc-700';
}
