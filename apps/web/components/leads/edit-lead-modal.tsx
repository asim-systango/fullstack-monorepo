'use client';

import React, { useState, useEffect, type SyntheticEvent } from 'react';
import { Alert, Button, TextInput, Select } from '@shared/ui';
import {
    leadsService,
    LeadSource,
    type Lead,
    type Contact,
    type UserResult,
} from '@/lib/api';

type EditLeadModalProps = Readonly<{
    isOpen: boolean;
    onClose: () => void;
    lead: Lead;
    contacts: Contact[];
    users: UserResult[];
    onSuccess: (updatedLead: Lead) => void;
}>;

export function EditLeadModal({
    isOpen,
    onClose,
    lead,
    contacts,
    users,
    onSuccess,
}: EditLeadModalProps) {
    const [title, setTitle] = useState(lead.title || '');
    const [contactId, setContactId] = useState(lead.contactId || '');
    const [description, setDescription] = useState(lead.description || '');
    const [source, setSource] = useState<LeadSource>(lead.source || LeadSource.MANUAL);
    const [ownerId, setOwnerId] = useState(lead.ownerId || '');

    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (lead) {
            setTitle(lead.title || '');
            setContactId(lead.contactId || '');
            setDescription(lead.description || '');
            setSource(lead.source || LeadSource.MANUAL);
            setOwnerId(lead.ownerId || '');
            setFormError(null);
        }
    }, [lead]);

    if (!isOpen) return null;

    const handleEditSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title.trim()) {
            setFormError('Lead Title is required.');
            return;
        }
        if (!contactId) {
            setFormError('Please select a Contact for this lead.');
            return;
        }

        setFormSubmitting(true);
        setFormError(null);

        try {
            const updated = await leadsService.updateLead(lead.id, {
                title: title.trim(),
                contactId,
                description: description.trim() || undefined,
                source,
                ownerId: ownerId || undefined,
            });

            onSuccess(updated);
            onClose();
        } catch (error: unknown) {
            console.error('Failed to update lead:', error);
            const apiError = error as { response?: { data?: { message?: string } }; message?: string };
            setFormError(apiError?.response?.data?.message || apiError?.message || 'Failed to update lead details.');
        } finally {
            setFormSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <div>
                        <h3 className="text-base font-bold text-white">Edit Lead Details</h3>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                            Update information, contact, or owner for this lead.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-550 hover:text-white transition cursor-pointer text-sm font-semibold"
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
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-350 block">
                            Lead Title <span className="text-red-400">*</span>
                        </label>
                        <TextInput
                            placeholder="e.g. Enterprise Software Deal"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-xs"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-350 block">
                            Contact <span className="text-red-400">*</span>
                        </label>
                        <Select
                            value={contactId}
                            onChange={(e) => setContactId(e.target.value)}
                            className="w-full text-xs"
                        >
                            <option value="">-- Select Contact --</option>
                            {contacts.map((c) => {
                                const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email;
                                return (
                                    <option key={c.id} value={c.id}>
                                        {name} {c.companyName ? `(${c.companyName})` : ''}
                                    </option>
                                );
                            })}
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-350 block">
                            Description
                        </label>
                        <TextInput
                            placeholder="Additional notes or details about the opportunity..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-zinc-350 block">Source</label>
                            <Select
                                value={source}
                                onChange={(e) => setSource(e.target.value as LeadSource)}
                                className="w-full text-xs"
                            >
                                <option value={LeadSource.MANUAL}>Manual</option>
                                <option value={LeadSource.WEBSITE}>Website</option>
                                <option value={LeadSource.REFERRAL}>Referral</option>
                                <option value={LeadSource.API}>API</option>
                                <option value={LeadSource.IMPORT}>Import</option>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-zinc-350 block">Assign Owner</label>
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

                    <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-850">
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
