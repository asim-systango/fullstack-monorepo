'use client';

import React from 'react';
import { Badge, Button } from '@shared/ui';
import { LeadStage } from '@/lib/api';

type LeadStageStepperProps = Readonly<{
    currentStage: LeadStage;
    updating: boolean;
    onStageChange: (newStage: LeadStage) => void;
}>;

interface StageStep {
    stage: LeadStage;
    label: string;
    stepNumber: number;
}

const STAGES: StageStep[] = [
    { stage: LeadStage.NEW, label: 'NEW', stepNumber: 1 },
    { stage: LeadStage.CONTACTED, label: 'CONTACTED', stepNumber: 2 },
    { stage: LeadStage.QUALIFIED, label: 'QUALIFIED', stepNumber: 3 },
    { stage: LeadStage.CONVERTED, label: 'CONVERTED', stepNumber: 4 },
];

export function LeadStageStepper({
    currentStage,
    updating,
    onStageChange,
}: LeadStageStepperProps) {
    const getStageIndex = (stage: LeadStage) => {
        switch (stage) {
            case LeadStage.NEW:
                return 0;
            case LeadStage.CONTACTED:
                return 1;
            case LeadStage.QUALIFIED:
                return 2;
            case LeadStage.CONVERTED:
                return 3;
            default:
                return -1; // LOST or unknown
        }
    };

    const currentIndex = getStageIndex(currentStage);

    return (
        <div className="space-y-6">
            {/* Horizontal Visual Pipeline Progress Tracker */}
            <div className="relative py-4 px-2">
                <div className="flex items-center justify-between relative z-10">
                    {STAGES.map((s, idx) => {
                        const isCompleted = currentIndex > idx;
                        const isCurrent = currentIndex === idx;
                        const isLocked = (currentStage === LeadStage.CONVERTED || currentStage === LeadStage.LOST) && idx < 3;

                        return (
                            <button
                                key={s.stage}
                                type="button"
                                disabled={updating || isLocked}
                                onClick={() => !isLocked && onStageChange(s.stage)}
                                className={`flex flex-col items-center group focus:outline-none ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                            >
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${isCompleted
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : isCurrent
                                            ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20 shadow-md shadow-indigo-500/40'
                                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    {isCompleted ? '✓' : s.stepNumber}
                                </div>
                                <span
                                    className={`text-[10px] font-bold tracking-wider mt-2 transition ${isCurrent
                                        ? 'text-indigo-400 font-extrabold'
                                        : isCompleted
                                            ? 'text-white'
                                            : 'text-zinc-500 group-hover:text-zinc-300'
                                        }`}
                                >
                                    {s.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Progress Background Connector Line */}
                <div className="absolute top-8 left-8 right-8 h-0.5 bg-zinc-800 -z-0">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{
                            width: `${currentIndex <= 0
                                ? 0
                                : Math.min(100, (currentIndex / (STAGES.length - 1)) * 100)
                                }%`,
                        }}
                    />
                </div>
            </div>

            {/* Quick Stage Action Buttons */}
            <div className="pt-3 border-t border-zinc-800/80">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                    Quick Stage Actions
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    {currentStage === LeadStage.CONVERTED ? (
                        <>
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={true}
                                className="text-xs px-3 py-1.5 opacity-90 cursor-default bg-emerald-600 border-emerald-500 text-white"
                            >
                                💼 Mark as Deal (Converted)
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={updating}
                                onClick={() => onStageChange(LeadStage.LOST)}
                                className="text-xs px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/40"
                            >
                                Mark Lost
                            </Button>
                        </>
                    ) : currentStage === LeadStage.LOST ? (
                        <>
                            <Badge tone="danger" className="py-1 px-3 text-xs">
                                ❌ Lead Marked as Lost
                            </Badge>
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={updating}
                                onClick={() => onStageChange(LeadStage.CONVERTED)}
                                className="text-xs px-3 py-1.5"
                            >
                                Mark Converted
                            </Button>
                        </>
                    ) : (
                        <>
                            {currentStage !== LeadStage.CONTACTED && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    disabled={updating}
                                    onClick={() => onStageChange(LeadStage.CONTACTED)}
                                    className="text-xs px-3 py-1.5"
                                >
                                    Mark Contacted
                                </Button>
                            )}

                            {currentStage !== LeadStage.QUALIFIED && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    disabled={updating}
                                    onClick={() => onStageChange(LeadStage.QUALIFIED)}
                                    className="text-xs px-3 py-1.5 font-medium"
                                >
                                    Mark Qualified
                                </Button>
                            )}

                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={updating}
                                onClick={() => onStageChange(LeadStage.CONVERTED)}
                                className="text-xs px-3 py-1.5"
                            >
                                Mark Converted
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={updating}
                                onClick={() => onStageChange(LeadStage.LOST)}
                                className="text-xs px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/40"
                            >
                                Mark Lost
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
