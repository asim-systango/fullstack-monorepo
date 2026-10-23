import { Contact } from './contacts.types';

export enum DealStage {
    OPEN = 'OPEN',
    DEMO = 'DEMO',
    PROPOSAL = 'PROPOSAL',
    NEGOTIATION = 'NEGOTIATION',
    WON = 'WON',
    LOST = 'LOST',
}

export interface DealOwner {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface DealLead {
    id: string;
    title: string;
    description?: string;
    source?: string;
    stage?: string;
}

export interface Deal {
    id: string;
    organizationId: string;
    leadId: string;
    lead?: DealLead;
    contactId: string;
    contact?: Contact;
    ownerId: string;
    owner?: DealOwner;
    title: string;
    description?: string;
    amount: number;
    probability: number;
    stage: DealStage;
    expectedCloseDate?: string;
    wonAt?: number;
    lostAt?: number;
    lostReason?: string;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
}

export interface GetDealsParams {
    page?: number;
    limit?: number;
    search?: string;
    stage?: DealStage | 'ALL';
    ownerId?: string;
}

export interface CreateDealPayload {
    leadId: string;
    title: string;
    description?: string;
    amount: number;
    probability?: number;
    expectedCloseDate?: string;
    ownerId?: string;
}

export interface UpdateDealPayload {
    title?: string;
    description?: string;
    amount?: number;
    probability?: number;
    expectedCloseDate?: string;
    ownerId?: string;
}

export interface UpdateDealStagePayload {
    stage: DealStage;
}
