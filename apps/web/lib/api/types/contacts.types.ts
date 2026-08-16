export enum ContactSource {
    WEBSITE = 'WEBSITE',
    MANUAL = 'MANUAL',
    IMPORT = 'IMPORT',
    API = 'API',
    REFERRAL = 'REFERRAL',
}

export enum ContactStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export interface Contact {
    id: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    companyName?: string;
    designation?: string;
    source: ContactSource;
    status: ContactStatus;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
}

export interface GetContactsParams {
    search?: string;
    source?: ContactSource;
    status?: ContactStatus;
    page?: number;
    limit?: number;
    organizationId?: string;
}

export interface GetContactsMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface GetContactsResponse {
    message: string;
    data: Contact[];
    meta: GetContactsMeta;
}

export interface CreateContactPayload {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    companyName?: string;
    designation?: string;
    source?: ContactSource;
    status?: ContactStatus;
}

export interface CreateContactResponse {
    message: string;
    data: Contact;
}

export interface UpdateContactPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    designation?: string;
    source?: ContactSource;
    status?: ContactStatus;
}

export interface UpdateContactResponse {
    message: string;
    data: Contact;
}
