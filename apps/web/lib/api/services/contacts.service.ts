import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import { extractData } from '../utils/extract-data';
import type {
    GetContactsParams,
    GetContactsResponse,
    CreateContactPayload,
    CreateContactResponse,
    UpdateContactPayload,
    UpdateContactResponse,
} from '../types/contacts.types';

export class ContactsService {
    async getContacts(params?: GetContactsParams): Promise<GetContactsResponse> {
        const response = await apiClient.get<GetContactsResponse>(
            API_ENDPOINTS.CONTACTS.GET_ALL,
            { params },
        );
        return extractData<GetContactsResponse>(response.data);
    }

    async createContact(payload: CreateContactPayload): Promise<CreateContactResponse> {
        const response = await apiClient.post<CreateContactResponse>(
            API_ENDPOINTS.CONTACTS.CREATE,
            payload,
        );
        return extractData<CreateContactResponse>(response.data);
    }

    async updateContact(id: string, payload: UpdateContactPayload): Promise<UpdateContactResponse> {
        const response = await apiClient.patch<UpdateContactResponse>(
            API_ENDPOINTS.CONTACTS.UPDATE(id),
            payload,
        );
        return extractData<UpdateContactResponse>(response.data);
    }
}

export const contactsService = new ContactsService();
