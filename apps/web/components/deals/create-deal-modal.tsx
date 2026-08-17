'use client';

import React, { useState, useEffect, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { Alert, Button, TextInput, Select } from '@shared/ui';
import {
    dealsService,
    LeadStage,
    type Lead,
    type UserResult,
    type Deal,
} from '@/lib/api';

type CreateDealModalProps = Readonly<{
    isOpen: boolean;
    onClose: () => void;
    leads: Lead[];
    users: UserResult[];
    initialLeadId?: string;
    onSuccess: (createdDeal: Deal) => void;
}>;

export function CreateDealModal({
    isOpen,
    onClose,
    leads,
    users,
    initialLeadId,
    onSuccess,
}: CreateDealModalProps) {
    const [leadId, setLeadId] = useState(initialLeadId || '');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | string>('');
    const [probability, setProbability] = useState<number>(50);
    const [expectedCloseDate, setExpectedCloseDate] = useState('');
    const [ownerId, setOwnerId] = useState('');

    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Filter leads to only show CONVERTED leads (and include initialLeadId if present)
    const eligibleLeads = leads.filter(
        (l) => l.stage === LeadStage.CONVERTED || l.id === initialLeadId
    );

    useEffect(() => {
        if (initialLeadId) {
            setLeadId(initialLeadId);
            const selected = leads.find((l) => l.id === initialLeadId);
            if (selected) {
                setTitle(`${selected.title} Deal`);
                setDescription(selected.description || '');
                if (selected.ownerId) {
                    setOwnerId(selected.ownerId);
                }
            }
        } else if (eligibleLeads.length === 1 && !leadId) {
            // Auto-select if only 1 converted lead
            const single = eligibleLeads[0];
            if (single) {
                setLeadId(single.id);
                setTitle(`${single.title} Deal`);
                setDescription(single.description || '');
                if (single.ownerId) setOwnerId(single.ownerId);
            }
        }
    }, [initialLeadId, leads, eligibleLeads, leadId]);

    if (!isOpen) return null;

    const resetForm = () => {
        setLeadId('');
        setTitle('');
        setDescription('');
        setAmount('');
        setProbability(50);
        setExpectedCloseDate('');
        setOwnerId('');
        setFormError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleLeadChange = (selectedLeadId: string) => {
        setLeadId(selectedLeadId);
        const selected = leads.find((l) => l.id === selectedLeadId);
        if (selected) {
            if (!title || title.endsWith(' Deal')) {
                setTitle(`${selected.title} Deal`);
            }
            if (selected.description && !description) {
                setDescription(selected.description);
            }
            if (selected.ownerId && !ownerId) {
                setOwnerId(selected.ownerId);
            }
        }
    };

    const handleAddSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!leadId) {
            setFormError('Please select a converted Lead to create this Deal.');
            return;
        }
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
            const newDeal = await dealsService.createDeal({
                leadId,
                title: title.trim(),
                description: description.trim() || undefined,
                amount: numericAmount,
                probability: Number(probability) || 0,
                expectedCloseDate: expectedCloseDate || undefined,
                ownerId: ownerId || undefined,
            });

            resetForm();
            onSuccess(newDeal);
            onClose();
        } catch (error: unknown) {
            console.error('Failed to create deal:', error);
            const apiError = error as { response?: { data?: { message?: string } }; message?: string };
            setFormError(apiError?.response?.data?.message || apiError?.message || 'Failed to create deal.');
        } finally {
            setFormSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <div>
                        <h3 className="text-base font-bold text-white">Create New Deal</h3>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                            Create an active revenue deal opportunity for a converted sales lead.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
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

                {eligibleLeads.length === 0 ? (
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center space-y-3 text-xs">
                        <p className="text-zinc-300">
                            No converted leads found. Deals are created from converted sales leads.
                        </p>
                        <Link
                            href="/leads"
                            onClick={handleClose}
                            className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-semibold underline"
                        >
                            Go to Leads Directory to convert a lead →
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        {/* Associated Converted Lead Selector */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-zinc-300 block">
                                Converted Lead <span className="text-red-400">*</span>
                            </label>
                            <Select
                                value={leadId}
                                onChange={(e) => handleLeadChange(e.target.value)}
                                className="w-full text-xs"
                            >
                                <option value="">-- Select Converted Lead --</option>
                                {eligibleLeads.map((l) => {
                                    const contactName = l.contact
                                        ? `${l.contact.firstName || ''} ${l.contact.lastName || ''}`.trim() || l.contact.email
                                        : 'No contact';
                                    const company = l.contact?.companyName ? ` • ${l.contact.companyName}` : '';
                                    return (
                                        <option key={l.id} value={l.id}>
                                            {l.title} — {contactName}{company} [{l.stage}]
                                        </option>
                                    );
                                })}
                            </Select>
                        </div>

                        {/* Title */}
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
                                    <option value="">Lead Owner / Default</option>
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
                                placeholder="Key requirements, scope, or timeline notes..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full text-xs"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-800">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}
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
                                {formSubmitting ? 'Creating Deal...' : 'Create Deal'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
