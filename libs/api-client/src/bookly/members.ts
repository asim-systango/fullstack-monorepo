import type { AxiosInstance } from 'axios';
import {
  listMembersParamsSchema,
  memberDetailSchema,
  memberLoanSummarySchema,
  memberProfileSchema,
  memberSearchHitSchema,
  paginatedMembersSchema,
  searchMembersParamsSchema,
  suspendMemberInputSchema,
  type ListMembersParams,
  type MemberDetail,
  type MemberLoanSummary,
  type MemberProfile,
  type MemberSearchHit,
  type PaginatedMembers,
  type SearchMembersParams,
  type SuspendMemberInput,
} from '@shared/types';
import { unwrapData } from '../unwrap';
import { buildQueryParams } from '../query-params';

export function createMembersApi(client: AxiosInstance) {
  return {
    async list(params?: ListMembersParams, signal?: AbortSignal): Promise<PaginatedMembers> {
      const parsed = listMembersParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/members', {
        params: buildQueryParams(parsed),
        signal,
      });
      return paginatedMembersSchema.parse(unwrapData(data));
    },

    async search(params: SearchMembersParams, signal?: AbortSignal): Promise<MemberSearchHit[]> {
      const parsed = searchMembersParamsSchema.parse(params);
      const { data } = await client.get('/members/search', {
        params: buildQueryParams(parsed),
        signal,
      });
      return memberSearchHitSchema.array().parse(unwrapData(data));
    },

    async getByUserId(userId: string): Promise<MemberDetail> {
      const { data } = await client.get(`/members/${userId}`);
      const raw = unwrapData(data);
      const parsed = memberDetailSchema.safeParse(raw);
      if (parsed.success) return parsed.data;
      const fallback = memberDetailSchema.safeParse({
        ...(raw && typeof raw === 'object' ? raw : {}),
        loans: [],
      });
      if (fallback.success) return fallback.data;
      throw parsed.error;
    },

    async loanSummary(userId: string): Promise<MemberLoanSummary> {
      const { data } = await client.get(`/members/${userId}/loan-summary`);
      return memberLoanSummarySchema.parse(unwrapData(data));
    },

    async suspend(userId: string, input: SuspendMemberInput): Promise<MemberProfile> {
      const body = suspendMemberInputSchema.parse(input);
      const { data } = await client.post(`/members/${userId}/suspend`, body);
      return memberProfileSchema.parse(unwrapData(data));
    },

    async reinstate(userId: string): Promise<MemberProfile> {
      const { data } = await client.post(`/members/${userId}/reinstate`);
      return memberProfileSchema.parse(unwrapData(data));
    },
  };
}
