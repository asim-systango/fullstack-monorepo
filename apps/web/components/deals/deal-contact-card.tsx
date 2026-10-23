'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@shared/ui';
import type { Contact, DealLead } from '@/lib/api';

type DealContactCardProps = Readonly<{
    contact?: Contact;
    lead?: DealLead;
    leadId?: string;
}>;

export function DealContactCard({ contact, lead, leadId }: DealContactCardProps) {
    const fullName = contact
        ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email || 'Unnamed Contact'
        : 'No Contact Assigned';

    return (
        <div className="space-y-6">
            {/* Contact Details Card */}
            <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-lg">
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2.5">
                    Contact Information
                </h3>

                {contact ? (
                    <div className="space-y-3 text-xs">
                        <div>
                            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                Name
                            </div>
                            <div className="text-white font-semibold mt-0.5">{fullName}</div>
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
                            <div className="pt-2 border-t border-zinc-800">
                                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                    Company
                                </div>
                                <div className="text-white font-medium mt-0.5">{contact.companyName}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-xs text-zinc-500 italic">No contact assigned to this deal.</p>
                )}
            </Card>

            {/* Converted From Lead Card */}
            {leadId && (
                <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">
                        Origin Lead
                    </h3>
                    <div className="text-xs space-y-1.5">
                        <div className="text-white font-semibold">{lead?.title || 'Associated Lead'}</div>
                        {lead?.description && (
                            <p className="text-zinc-400 text-[11px] line-clamp-2">{lead.description}</p>
                        )}
                        <div className="pt-2">
                            <Link
                                href={`/leads/${leadId}`}
                                className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition"
                            >
                                View original lead →
                            </Link>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
