'use client';

import React, { useState, useEffect, type SyntheticEvent } from 'react';
import { Alert, Button, TextInput, Select } from '@shared/ui';
import {
    dealsService,
    type Deal,
    type UserResult,
} from '@/lib/api';

type EditDealModalProps = Readonly<{
    isOpen: boolean;
    onClose: () => void;
    deal: Deal;
    users: UserResult[];
    onSuccess: (updatedDeal: Deal) => void;
}>;

export function EditDealModal({
    isOpen,
    onClose,
    deal,
    users,
    onSuccess,
}: EditDealModalProps) {
    const [title, setTitle] = useState(deal.title || '');
    const [description, setDescription] = useState(deal.description || '');
    const [amount, setAmount] = useState<number | string>(deal.amount ?? '');
    const [probability, setProbability] = useState<number>(deal.probability ?? 50);
    const [expectedCloseDate, setExpectedCloseDate] = useState(deal.expectedCloseDate || '');
    const [ownerId, setOwnerId] = useState(deal.ownerId || '');

    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (deal) {
            setTitle(deal.title || '');
            setDescription(deal.description || '');
            setAmount(deal.amount ?? '');
            setProbability(deal.probability ?? 50);
            setExpectedCloseDate(deal.expectedCloseDate || '');
            setOwnerId(deal.ownerId || '');
            setFormError(null);
        }
    }, [deal]);

    if (!isOpen) return null;

    const handleEditSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title.trim()) {
            setFormError('Deal Title is required.');
            return;
        }
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount < 0) {
            setFormError('Please enter a valid Deal Amount.');
            return;
        }

        setFormSubmitting(true);
        setFormError(null);

        try {
            const updated = await dealsService.updateDeal(deal.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                amount: numericAmount,
                probability: Number(probability) || 0,
                expectedCloseDate: expectedCloseDate || undefined,
                ownerId: ownerId || undefined,
            });

            onSuccess(updated);
            onClose();
        } catch (error: unknown) {
            console.error('Failed to update deal:', error);
            const apiError = error as { response?: { data?: { message?: string } }; message?: string };
            setFormError(apiError?.response?.data?.message || apiError?.message || 'Failed to update deal details.');
        } finally {
            setFormSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <div>
                        <h3 className="text-base font-bold text-white">Edit Deal Details</h3>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                            Update deal parameters, value, close date, or assigned owner.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition cursor-pointer text-sm font-semibold"
                    >
                        ✕
                    </button>
                </div>

                {formError && (
                    <Alert tone="danger" className="text-xs py-2">
                        {formError}
                    </Alert>
                )}

                <form onSubmit={handleEditSubmit} className="space-y-4">
                    {/* Deal Title */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-300 block">
                            Deal Title <span className="text-red-400">*</span>
                        </label>
                        <TextInput
                            placeholder="e.g. Enterprise License Expansion"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-xs"
                        />
                    </div>

                    {/* Amount & Probability */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-zinc-300 block">
                                Deal Value ($ USD) <span className="text-red-400">*</span>
                            </label>
                            <TextInput
                                type="number"
                                min={0}
                                placeholder="50000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-zinc-300 block">
                                Win Probability ({probability}%)
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={probability}
                                onChange={(e) => setProbability(Number(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                            />
                        </div>
                    </div>

                    {/* Expected Close Date & Owner */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-zinc-300 block">
                                Expected Close Date
                            </label>
                            <TextInput
                                type="date"
                                value={expectedCloseDate}
                                onChange={(e) => setExpectedCloseDate(e.target.value)}
                                className="w-full text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-zinc-300 block">
                                Assign Owner
                            </label>
                            <Select
                                value={ownerId}
                                onChange={(e) => setOwnerId(e.target.value)}
                                className="w-full text-xs"
                            >
                                <option value="">Unassigned</option>
                                {users.map((usr) => {
                                    const name = `${usr.firstName || ''} ${usr.lastName || ''}`.trim() || usr.email;
                                    return (
                                        <option key={usr.id} value={usr.id}>
                                            {name}
                                        </option>
                                    );
                                })}
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-300 block">
                            Deal Notes / Description
                        </label>
                        <TextInput
                            placeholder="Additional notes or scope details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full text-xs"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-800">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={formSubmitting}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={formSubmitting}
                            className="text-xs"
                        >
                            {formSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
