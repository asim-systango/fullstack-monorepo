'use client';

import React from 'react';
import { Card, TextInput, Select, Button } from '@shared/ui';
import { DealStage } from '@/lib/api';

type DealsFilterBarProps = Readonly<{
    search: string;
    onSearchChange: (value: string) => void;
    stageFilter: string;
    onStageFilterChange: (stage: string) => void;
    viewMode: 'list' | 'kanban';
    onViewModeChange: (mode: 'list' | 'kanban') => void;
}>;

export function DealsFilterBar({
    search,
    onSearchChange,
    stageFilter,
    onStageFilterChange,
    viewMode,
    onViewModeChange,
}: DealsFilterBarProps) {
    return (
        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 mb-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search & Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <TextInput
                        placeholder="Search deals by title or contact..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full text-xs"
                    />

                    <Select
                        value={stageFilter}
                        onChange={(e) => onStageFilterChange(e.target.value)}
                        className="w-full text-xs"
                    >
                        <option value="ALL">All Deal Stages</option>
                        <option value={DealStage.OPEN}>Open</option>
                        <option value={DealStage.DEMO}>Demo</option>
                        <option value={DealStage.PROPOSAL}>Proposal</option>
                        <option value={DealStage.NEGOTIATION}>Negotiation</option>
                        <option value={DealStage.WON}>Won 🏆</option>
                        <option value={DealStage.LOST}>Lost ❌</option>
                    </Select>
                </div>

                {/* View Mode Toggle Switcher */}
                <div className="flex items-center space-x-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start md:self-auto">
                    <Button
                        type="button"
                        variant={viewMode === 'list' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('list')}
                        className="text-xs px-3 py-1.5"
                    >
                        📋 List
                    </Button>
                    <Button
                        type="button"
                        variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('kanban')}
                        className="text-xs px-3 py-1.5"
                    >
                        📊 Kanban
                    </Button>
                </div>
            </div>
        </Card>
    );
}
