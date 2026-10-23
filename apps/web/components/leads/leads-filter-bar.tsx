'use client';

import React from 'react';
import { Card, TextInput, Select, Button } from '@shared/ui';
import { LeadStage, LeadSource } from '@/lib/api';

type LeadsFilterBarProps = Readonly<{
    search: string;
    onSearchChange: (value: string) => void;
    stageFilter: string;
    onStageFilterChange: (stage: string) => void;
    sourceFilter: string;
    onSourceFilterChange: (source: string) => void;
    viewMode: 'list' | 'kanban';
    onViewModeChange: (mode: 'list' | 'kanban') => void;
}>;

export function LeadsFilterBar({
    search,
    onSearchChange,
    stageFilter,
    onStageFilterChange,
    sourceFilter,
    onSourceFilterChange,
    viewMode,
    onViewModeChange,
}: LeadsFilterBarProps) {
    return (
        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 mb-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search & Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <TextInput
                        placeholder="Search leads by title or contact..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full text-xs"
                    />

                    <Select
                        value={stageFilter}
                        onChange={(e) => onStageFilterChange(e.target.value)}
                        className="w-full text-xs"
                    >
                        <option value="ALL">All Stages</option>
                        <option value={LeadStage.NEW}>New</option>
                        <option value={LeadStage.CONTACTED}>Contacted</option>
                        <option value={LeadStage.QUALIFIED}>Qualified</option>
                        <option value={LeadStage.CONVERTED}>Converted</option>
                        <option value={LeadStage.LOST}>Lost</option>
                    </Select>

                    <Select
                        value={sourceFilter}
                        onChange={(e) => onSourceFilterChange(e.target.value)}
                        className="w-full text-xs"
                    >
                        <option value="ALL">All Sources</option>
                        <option value={LeadSource.MANUAL}>Manual</option>
                        <option value={LeadSource.WEBSITE}>Website</option>
                        <option value={LeadSource.REFERRAL}>Referral</option>
                        <option value={LeadSource.API}>API</option>
                        <option value={LeadSource.IMPORT}>Import</option>
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
