'use client';

import React from 'react';
import { Badge, Button } from '@shared/ui';
import { LeadStage } from '@/lib/api';

type LeadStageStepperProps = Readonly<{
    currentStage: LeadStage;
    updating: boolean;
    onStageChange: (newStage: LeadStage) => void;
    onConvertToDeal?: () => void;
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
    onConvertToDeal,
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

    const handleStepClick = (stage: LeadStage, isLocked: boolean) => {
        if (isLocked || updating) return;
        if (stage === LeadStage.CONVERTED && onConvertToDeal) {
            onConvertToDeal();
        } else {
            onStageChange(stage);
        }
    };

    const getStepCircleClass = (isConverted: boolean, isCompleted: boolean, isCurrent: boolean) => {
        if (isConverted) return 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/30';
        if (isCompleted) return 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30';
        if (isCurrent) return 'bg-indigo-500 text-white ring-4 ring-indigo-500/20 shadow-md shadow-indigo-500/40';
        return 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300';
    };

    const getStepLabelClass = (isConverted: boolean, isCurrent: boolean, isCompleted: boolean) => {
        if (isConverted) return 'text-emerald-400 font-extrabold';
        if (isCurrent) return 'text-indigo-400 font-extrabold';
        if (isCompleted) return 'text-white';
        return 'text-zinc-500 group-hover:text-zinc-300';
    };

    const renderActionButtons = () => {
        if (currentStage === LeadStage.CONVERTED) {
            return (
                <>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={updating}
                        onClick={() => {
                            if (onConvertToDeal) onConvertToDeal();
                        }}
                        className="text-xs px-3.5 py-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    >
                        💼 Convert to Deal / View Deals →
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
            );
        }

        if (currentStage === LeadStage.LOST) {
            return (
                <>
                    <Badge tone="danger" className="py-1 px-3 text-xs">
                        ❌ Lead Marked as Lost
                    </Badge>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={updating}
                        onClick={() => {
                            if (onConvertToDeal) {
                                onConvertToDeal();
                            } else {
                                onStageChange(LeadStage.CONVERTED);
                            }
                        }}
                        className="text-xs px-3 py-1.5"
                    >
                        Mark Converted
                    </Button>
                </>
            );
        }

        return (
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
                    onClick={() => {
                        if (onConvertToDeal) {
                            onConvertToDeal();
                        } else {
                            onStageChange(LeadStage.CONVERTED);
                        }
                    }}
                    className="text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20"
                >
                    💼 Mark Converted (Create Deal)
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
                        const isLocked = (currentStage === LeadStage.CONVERTED || currentStage === LeadStage.LOST) && idx < 3;
                        const isConverted = currentStage === LeadStage.CONVERTED && idx === 3;

                        return (
                            <button
                                key={s.stage}
                                type="button"
                                disabled={updating || isLocked}
                                onClick={() => handleStepClick(s.stage, isLocked)}
                                className={`flex flex-col items-center group focus:outline-none ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                            >
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${getStepCircleClass(
                                        isConverted,
                                        isCompleted,
                                        isCurrent,
                                    )}`}
                                >
                                    {isCompleted || isConverted ? '✓' : s.stepNumber}
                                </div>
                                <span
                                    className={`text-[10px] font-bold tracking-wider mt-2 transition ${getStepLabelClass(
                                        isConverted,
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
                        className={`h-full transition-all duration-300 ${currentStage === LeadStage.CONVERTED ? 'bg-emerald-500' : 'bg-indigo-500'}`}
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
                    {renderActionButtons()}
                </div>
            </div>
        </div>
    );
}
