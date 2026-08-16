'use client';

import React from 'react';
import { Card } from '@shared/ui';
import type { Contact } from '@/lib/api';

type LeadContactCardProps = Readonly<{
    contact?: Contact;
}>;

export function LeadContactCard({ contact }: LeadContactCardProps) {
    if (!contact) {
        return (
            <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Contact Info
                </h3>
                <p className="text-xs text-zinc-500 italic">No contact assigned to this lead.</p>
            </Card>
        );
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact';

    return (
        <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2.5">
                Contact Info
            </h3>

            <div className="space-y-3 text-xs">
                <div>
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Name
                    </div>
                    <div className="text-white font-medium mt-0.5">{fullName}</div>
                </div>

                {contact.phone && (
                    <div>
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                            Phone
                        </div>
                        <div className="text-zinc-300 font-mono mt-0.5">{contact.phone}</div>
                    </div>
                )}

                <div>
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Email
                    </div>
                    <div className="text-indigo-400 font-mono text-[11px] mt-0.5 truncate">
                        {contact.email}
                    </div>
                </div>

                {contact.companyName && (
                    <div className="pt-2 border-t border-zinc-850">
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                            Company
                        </div>
                        <div className="text-white font-medium mt-0.5">{contact.companyName}</div>
                    </div>
                )}
            </div>
        </Card>
    );
}
