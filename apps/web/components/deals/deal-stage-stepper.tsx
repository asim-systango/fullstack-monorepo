'use client';

import React from 'react';
import { Badge, Button } from '@shared/ui';
import { DealStage } from '@/lib/api';

type DealStageStepperProps = Readonly<{
    currentStage: DealStage;
    updating: boolean;
    onStageChange: (newStage: DealStage) => void;
}>;

interface StageStep {
    stage: DealStage;
    label: string;
    stepNumber: number;
}

const STAGES: StageStep[] = [
    { stage: DealStage.OPEN, label: 'OPEN', stepNumber: 1 },
    { stage: DealStage.DEMO, label: 'DEMO', stepNumber: 2 },
    { stage: DealStage.PROPOSAL, label: 'PROPOSAL', stepNumber: 3 },
    { stage: DealStage.NEGOTIATION, label: 'NEGOTIATION', stepNumber: 4 },
    { stage: DealStage.WON, label: 'WON', stepNumber: 5 },
];

export function DealStageStepper({
    currentStage,
    updating,
    onStageChange,
}: DealStageStepperProps) {
    const getStageIndex = (stage: DealStage) => {
        switch (stage) {
            case DealStage.OPEN:
                return 0;
            case DealStage.DEMO:
                return 1;
            case DealStage.PROPOSAL:
                return 2;
            case DealStage.NEGOTIATION:
                return 3;
            case DealStage.WON:
                return 4;
            default:
                return -1; // LOST or unknown
        }
    };

    const currentIndex = getStageIndex(currentStage);

    const getStepCircleClass = (isWon: boolean, isCompleted: boolean, isCurrent: boolean) => {
        if (isWon) return 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/30';
        if (isCompleted) return 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30';
        if (isCurrent) return 'bg-indigo-500 text-white ring-4 ring-indigo-500/20 shadow-md shadow-indigo-500/40';
        return 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300';
    };

    const getStepLabelClass = (isWon: boolean, isCurrent: boolean, isCompleted: boolean) => {
        if (isWon) return 'text-emerald-400 font-extrabold';
        if (isCurrent) return 'text-indigo-400 font-extrabold';
        if (isCompleted) return 'text-white';
        return 'text-zinc-500 group-hover:text-zinc-300';
    };

    const renderActionButtons = () => {
        if (currentStage === DealStage.WON) {
            return (
                <>
                    <Badge tone="success" className="py-1 px-3 text-xs">
                        🏆 Deal Closed Won
                    </Badge>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={updating}
                        onClick={() => onStageChange(DealStage.OPEN)}
                        className="text-xs px-3 py-1.5 text-zinc-400 hover:text-white"
                    >
                        Reopen Deal
                    </Button>
                </>
            );
        }

        if (currentStage === DealStage.LOST) {
            return (
                <>
                    <Badge tone="danger" className="py-1 px-3 text-xs">
                        ❌ Deal Marked as Lost
                    </Badge>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={updating}
                        onClick={() => onStageChange(DealStage.OPEN)}
                        className="text-xs px-3 py-1.5"
                    >
                        Reopen Deal
                    </Button>
                </>
            );
        }

        return (
            <>
                {currentStage !== DealStage.DEMO && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={updating}
                        onClick={() => onStageChange(DealStage.DEMO)}
                        className="text-xs px-3 py-1.5"
                    >
                        Move to Demo
                    </Button>
                )}

                {currentStage !== DealStage.PROPOSAL && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={updating}
                        onClick={() => onStageChange(DealStage.PROPOSAL)}
                        className="text-xs px-3 py-1.5"
                    >
                        Move to Proposal
                    </Button>
                )}

                {currentStage !== DealStage.NEGOTIATION && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={updating}
                        onClick={() => onStageChange(DealStage.NEGOTIATION)}
                        className="text-xs px-3 py-1.5 font-medium"
                    >
                        Move to Negotiation
                    </Button>
                )}

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={updating}
                    onClick={() => onStageChange(DealStage.WON)}
                    className="text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 border-emerald-500 font-semibold text-white shadow-md shadow-emerald-600/20"
                >
                    🏆 Mark Closed Won
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={updating}
                    onClick={() => onStageChange(DealStage.LOST)}
                    className="text-xs px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/40"
                >
                    Mark Lost
                </Button>
            </>
        );
    };

    return (
        <div className="space-y-6">
            {/* Horizontal Visual Pipeline Progress Tracker */}
            <div className="relative py-4 px-2">
                <div className="flex items-center justify-between relative z-10">
                    {STAGES.map((s, idx) => {
                        const isCompleted = currentIndex > idx;
                        const isCurrent = currentIndex === idx;
                        const isWon = currentStage === DealStage.WON && idx === 4;

                        return (
                            <button
                                key={s.stage}
                                type="button"
                                disabled={updating}
                                onClick={() => onStageChange(s.stage)}
                                className="flex flex-col items-center group focus:outline-none cursor-pointer"
                            >
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${getStepCircleClass(
                                        isWon,
                                        isCompleted,
                                        isCurrent,
                                    )}`}
                                >
                                    {isCompleted || isWon ? '✓' : s.stepNumber}
                                </div>
                                <span
                                    className={`text-[10px] font-bold tracking-wider mt-2 transition ${getStepLabelClass(
                                        isWon,
                                        isCurrent,
                                        isCompleted,
                                    )}`}
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
                        className={`h-full transition-all duration-300 ${currentStage === DealStage.WON ? 'bg-emerald-500' : 'bg-indigo-500'}`}
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
                    Pipeline Stage Actions
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    {renderActionButtons()}
                </div>
            </div>
        </div>
    );
}
