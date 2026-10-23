import { Contact } from './contacts.types';

export enum LeadSource {
    WEBSITE = 'WEBSITE',
    MANUAL = 'MANUAL',
    IMPORT = 'IMPORT',
    API = 'API',
    REFERRAL = 'REFERRAL',
}

export enum LeadStage {
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    QUALIFIED = 'QUALIFIED',
    CONVERTED = 'CONVERTED',
    LOST = 'LOST',
}

export interface LeadOwner {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface Lead {
    id: string;
    organizationId: string;
    contactId: string;
    contact?: Contact;
    ownerId?: string;
    owner?: LeadOwner;
    assignedBy?: string;
    title: string;
    description?: string;
    source: LeadSource;
    stage: LeadStage;
    qualifiedAt?: number;
    convertedAt?: number;
    lostReason?: string;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
}

export interface GetLeadsParams {
    page?: number;
    limit?: number;
    search?: string;
    stage?: LeadStage | 'ALL';
    source?: LeadSource | 'ALL';
    ownerId?: string;
}

export interface CreateLeadPayload {
    contactId: string;
    title: string;
    description?: string;
    source?: LeadSource;
    ownerId?: string;
}

export interface UpdateLeadPayload {
    contactId?: string;
    title?: string;
    description?: string;
    source?: LeadSource;
    ownerId?: string;
}

export interface UpdateLeadStagePayload {
    stage: LeadStage;
}
