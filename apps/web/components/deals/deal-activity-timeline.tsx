'use client';

import React, { useState, type SyntheticEvent } from 'react';
import { Card, Badge, Button, TextInput, Select, Alert, type BadgeTone } from '@shared/ui';
import {
    activitiesService,
    ActivityType,
    type Activity,
} from '@/lib/api';

type DealActivityTimelineProps = Readonly<{
    dealId: string;
    activities: Activity[];
    loading: boolean;
    onRefresh: () => void;
}>;

export function DealActivityTimeline({
    dealId,
    activities,
    loading,
    onRefresh,
}: DealActivityTimelineProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activityType, setActivityType] = useState<ActivityType>(ActivityType.MEETING);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDateStr, setDueDateStr] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const getActivityTypeBadgeTone = (type: ActivityType): BadgeTone => {
        switch (type) {
            case ActivityType.CALL:
                return 'accent';
            case ActivityType.MEETING:
                return 'accent';
            case ActivityType.FOLLOW_UP:
                return 'accent';
            case ActivityType.EMAIL:
                return 'neutral';
            case ActivityType.TASK:
                return 'neutral';
            case ActivityType.NOTE:
                return 'neutral';
            default:
                return 'neutral';
        }
    };

    const getActivityIcon = (type: ActivityType) => {
        switch (type) {
            case ActivityType.CALL:
                return '📞';
            case ActivityType.MEETING:
                return '📅';
            case ActivityType.EMAIL:
                return '📧';
            case ActivityType.FOLLOW_UP:
                return '🔄';
            case ActivityType.TASK:
                return '☑️';
            case ActivityType.NOTE:
                return '📝';
            default:
                return '📌';
        }
    };

    const handleCreateActivity = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title.trim()) {
            setFormError('Activity title is required.');
            return;
        }

        setSubmitting(true);
        setFormError(null);

        try {
            let dueAt: number | undefined;
            if (dueDateStr) {
                dueAt = new Date(dueDateStr).getTime();
            }

            await activitiesService.createActivity({
                dealId,
                activityType,
                title: title.trim(),
                description: description.trim() || undefined,
                dueAt,
            });

            setTitle('');
            setDescription('');
            setDueDateStr('');
            setIsModalOpen(false);
            onRefresh();
        } catch (err: unknown) {
            console.error('Failed to create deal activity:', err);
            const apiError = err as { response?: { data?: { message?: string } }; message?: string };
            setFormError(apiError?.response?.data?.message || apiError?.message || 'Failed to create activity.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleComplete = async (activity: Activity) => {
        try {
            setActionError(null);
            const newCompletedAt = activity.completedAt ? undefined : Date.now();
            await activitiesService.updateActivity(activity.id, {
                completedAt: newCompletedAt,
            });
            onRefresh();
        } catch (err: unknown) {
            console.error('Failed to update activity:', err);
            setActionError('Failed to update activity status.');
        }
    };

    return (
        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                    <h3 className="text-sm font-bold text-white">Deal Activity Timeline</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                        Log calls, demo meetings, proposal notes, and tasks for this deal.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs px-3 py-1.5"
                >
                    + Log activity
                </Button>
            </div>

            {actionError && (
                <Alert tone="danger" className="text-xs py-2">
                    {actionError}
                </Alert>
            )}

            {/* Activity List Timeline */}
            {loading ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                    Loading activities...
                </div>
            ) : activities.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                    No activities logged for this deal yet. Click "+ Log activity" above.
                </div>
            ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                    {activities.map((act) => {
                        const creatorName = act.creator
                            ? `${act.creator.firstName || ''} ${act.creator.lastName || ''}`.trim() || act.creator.email
                            : 'User';

                        const formattedDate = act.dueAt
                            ? `due ${new Date(Number(act.dueAt)).toLocaleDateString()}`
                            : `created ${new Date(Number(act.createdAt)).toLocaleDateString()}`;

                        const isDone = Boolean(act.completedAt);

                        return (
                            <div key={act.id} className="relative group">
                                {/* Timeline Dot */}
                                <div
                                    className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 transition ${isDone
                                            ? 'bg-emerald-500 border-emerald-400'
                                            : 'bg-indigo-600 border-zinc-900 ring-2 ring-indigo-500/40'
                                        }`}
                                />

                                <div className="bg-zinc-900 border border-zinc-800/90 rounded-xl p-4 space-y-2 hover:border-zinc-700 transition shadow-md">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Badge tone={getActivityTypeBadgeTone(act.activityType)}>
                                                {getActivityIcon(act.activityType)} {act.activityType}
                                            </Badge>
                                            <span className={`text-xs font-semibold ${isDone ? 'line-through text-zinc-500' : 'text-white'}`}>
                                                {act.title}
                                            </span>
                                        </div>

                                        <span className="text-[10px] text-zinc-500">
                                            {new Date(Number(act.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {act.description && (
                                        <p className="text-xs text-zinc-300 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800">
                                            {act.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                                        <div>
                                            by <span className="text-zinc-300 font-medium">{creatorName}</span> · {formattedDate}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleToggleComplete(act)}
                                            className={`font-semibold transition hover:underline cursor-pointer ${isDone ? 'text-zinc-500 hover:text-zinc-400' : 'text-indigo-400 hover:text-indigo-300'
                                                }`}
                                        >
                                            {isDone ? 'Completed ✓' : 'Mark complete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Log Activity Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                            <h3 className="text-sm font-bold text-white">+ Log Activity on Deal</h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-zinc-500 hover:text-white text-xs"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <Alert tone="danger" className="text-xs py-2">
                                {formError}
                            </Alert>
                        )}

                        <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-zinc-300 block">Activity Type</label>
                                <Select
                                    value={activityType}
                                    onChange={(e) => setActivityType(e.target.value as ActivityType)}
                                    className="w-full text-xs"
                                >
                                    <option value={ActivityType.MEETING}>📅 Demo / Meeting</option>
                                    <option value={ActivityType.CALL}>📞 Call</option>
                                    <option value={ActivityType.FOLLOW_UP}>🔄 Follow-Up</option>
                                    <option value={ActivityType.EMAIL}>📧 Email</option>
                                    <option value={ActivityType.NOTE}>📝 Note</option>
                                    <option value={ActivityType.TASK}>☑️ Task</option>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-zinc-300 block">
                                    Title <span className="text-red-400">*</span>
                                </label>
                                <TextInput
                                    placeholder="e.g. Conduct technical demo with VP Engineering"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-zinc-300 block">Description / Notes</label>
                                <TextInput
                                    placeholder="Key takeaways, questions asked, or next steps..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-zinc-300 block">Due / Scheduled Date</label>
                                <input
                                    type="date"
                                    value={dueDateStr}
                                    onChange={(e) => setDueDateStr(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={submitting}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={submitting}
                                    className="text-xs"
                                >
                                    {submitting ? 'Saving...' : 'Save Activity'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
}
