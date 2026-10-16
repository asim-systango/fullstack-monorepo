import type { AxiosInstance } from 'axios';
import {
  fineWithLoanSchema,
  listFinesParamsSchema,
  paginatedFinesSchema,
  waiveFineInputSchema,
  type FineWithLoan,
  type ListFinesParams,
  type PaginatedFines,
  type WaiveFineInput,
} from '@shared/types';
import { unwrapData } from '../unwrap';
import { buildQueryParams } from '../query-params';

export function createFinesApi(client: AxiosInstance) {
  return {
    async list(params?: ListFinesParams): Promise<PaginatedFines> {
      const parsed = listFinesParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/fines', { params: buildQueryParams(parsed) });
      return paginatedFinesSchema.parse(unwrapData(data));
    },

    async listMine(params?: ListFinesParams): Promise<PaginatedFines> {
      const parsed = listFinesParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/my/fines', {
        params: buildQueryParams(parsed),
      });
      return paginatedFinesSchema.parse(unwrapData(data));
    },

    async getById(id: string): Promise<FineWithLoan> {
      const { data } = await client.get(`/fines/${id}`);
      return fineWithLoanSchema.parse(unwrapData(data));
    },

    async pay(id: string): Promise<FineWithLoan> {
      const { data } = await client.patch(`/fines/${id}/pay`);
      return fineWithLoanSchema.parse(unwrapData(data));
    },

    async waive(id: string, input: WaiveFineInput): Promise<FineWithLoan> {
      const body = waiveFineInputSchema.parse(input);
      const { data } = await client.patch(`/fines/${id}/waive`, body);
      return fineWithLoanSchema.parse(unwrapData(data));
    },
  };
}
