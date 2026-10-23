export enum ActivityType {
    NOTE = 'NOTE',
    TASK = 'TASK',
    CALL = 'CALL',
    MEETING = 'MEETING',
    EMAIL = 'EMAIL',
    FOLLOW_UP = 'FOLLOW_UP',
}

export interface Activity {
    id: string;
    organizationId: string;
    leadId?: string;
    dealId?: string;
    stage: string;
    activityType: ActivityType;
    title: string;
    description?: string;
    dueAt?: number;
    completedAt?: number;
    createdBy: string;
    creator?: {
        id: string;
        firstName?: string;
        lastName?: string;
        email: string;
    };
    createdAt: number;
    updatedAt: number;
}

export interface CreateActivityPayload {
    leadId?: string;
    dealId?: string;
    activityType: ActivityType;
    title: string;
    description?: string;
    dueAt?: number;
}

export interface UpdateActivityPayload {
    title?: string;
    description?: string;
    dueAt?: number;
    completedAt?: number;
}
