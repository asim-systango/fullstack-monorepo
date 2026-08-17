'use client';

import React, { useState } from 'react';
import { Card } from '@shared/ui';
import { activitiesService, type Activity } from '@/lib/api';

type DashboardUpcomingTasksProps = Readonly<{
    tasks: Activity[];
    loading?: boolean;
    onRefresh?: () => void;
}>;

export function DashboardUpcomingTasks({ tasks, loading, onRefresh }: DashboardUpcomingTasksProps) {
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const formatDueRelative = (dueAt?: number | string, createdAt?: number | string) => {
        const timestamp = dueAt || createdAt;
        if (!timestamp) return 'No due date';

        const dueDate = new Date(Number(timestamp));
        const now = new Date();
        const diffMs = dueDate.getTime() - now.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        let relative = '';
        if (dueAt) {
            if (diffHours > 0 && diffHours < 48) {
                relative = `(in ${diffHours}h)`;
            } else if (diffDays >= 2) {
                relative = `(in ${diffDays}d)`;
            } else if (diffHours <= 0 && diffHours > -24) {
                relative = '(today / soon)';
            } else if (diffDays < 0) {
                relative = `(${Math.abs(diffDays)}d overdue)`;
            }
        }

        const dateFormatted = dueDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

        return `${dueAt ? 'due ' : 'created '}${dateFormatted} ${relative}`.trim();
    };

    const handleToggleTask = async (task: Activity) => {
        try {
            setTogglingId(task.id);
            const newCompletedAt = task.completedAt ? undefined : Date.now();
            await activitiesService.updateActivity(task.id, {
                completedAt: newCompletedAt,
            });
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Failed to toggle task:', err);
        } finally {
            setTogglingId(null);
        }
    };

    const formatTypeLabel = (type: string) => {
        switch (type) {
            case 'FOLLOW_UP':
                return 'Follow-up';
            case 'CALL':
                return 'Call';
            case 'MEETING':
                return 'Meeting';
            case 'EMAIL':
                return 'Email';
            case 'NOTE':
                return 'Note';
            case 'TASK':
                return 'Task';
            default:
                return type;
        }
    };

    return (
        <Card className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4 h-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
                <h3 className="text-sm font-bold text-white tracking-tight">Upcoming tasks</h3>
                <span className="text-[11px] font-medium text-zinc-500">
                    {tasks.filter((t) => !t.completedAt).length} pending
                </span>
            </div>

            {/* Task List */}
            {loading ? (
                <div className="py-8 text-center text-xs text-zinc-500">Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                    No upcoming tasks. Log activities from leads or deals.
                </div>
            ) : (
                <div className="divide-y divide-zinc-800/50">
                    {tasks.map((task) => {
                        const isDone = Boolean(task.completedAt);
                        const isBusy = togglingId === task.id;

                        return (
                            <div
                                key={task.id}
                                className="py-3.5 first:pt-1 last:pb-1 flex items-start space-x-3 group"
                            >
                                {/* Checkbox */}
                                <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => handleToggleTask(task)}
                                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer shrink-0 ${isDone
                                        ? 'bg-indigo-600 border-indigo-500 text-white'
                                        : 'bg-zinc-950 border-zinc-700 hover:border-indigo-400 group-hover:border-zinc-500'
                                        }`}
                                >
                                    {isDone && (
                                        <svg
                                            className="w-2.5 h-2.5 stroke-current"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="2.5 6 5 8.5 9.5 3.5" />
                                        </svg>
                                    )}
                                </button>

                                {/* Task Details */}
                                <div className="space-y-0.5 min-w-0 flex-1">
                                    <div
                                        className={`text-xs font-semibold tracking-tight transition ${isDone ? 'line-through text-zinc-500' : 'text-white'
                                            }`}
                                    >
                                        {task.title}
                                    </div>
                                    <div className="text-[11px] text-zinc-400 font-normal">
                                        <span className="text-zinc-300 font-medium">
                                            {formatTypeLabel(task.activityType)}
                                        </span>{' '}
                                        · {formatDueRelative(task.dueAt, task.createdAt)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
