import type { AxiosInstance } from 'axios';
import {
  checkoutLoanInputSchema,
  listLoansParamsSchema,
  loanWithRelationsSchema,
  lookupLoanParamsSchema,
  paginatedLoansSchema,
  paginatedOverdueLoansSchema,
  type CheckoutLoanInput,
  type ListLoansParams,
  type LoanWithRelations,
  type LookupLoanParams,
  type PaginatedLoans,
  type PaginatedOverdueLoans,
} from '@shared/types';
import { unwrapData } from '../unwrap';
import { buildQueryParams } from '../query-params';

export function createLoansApi(client: AxiosInstance) {
  return {
    async list(params?: ListLoansParams): Promise<PaginatedLoans> {
      const parsed = listLoansParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/loans', { params: buildQueryParams(parsed) });
      return paginatedLoansSchema.parse(unwrapData(data));
    },

    async listOverdue(params?: ListLoansParams): Promise<PaginatedOverdueLoans> {
      const parsed = listLoansParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/loans/overdue', {
        params: buildQueryParams(parsed),
      });
      return paginatedOverdueLoansSchema.parse(unwrapData(data));
    },

    async lookup(params: LookupLoanParams): Promise<LoanWithRelations> {
      const parsed = lookupLoanParamsSchema.parse(params);
      const { data } = await client.get('/loans/lookup', {
        params: buildQueryParams(parsed),
      });
      return loanWithRelationsSchema.parse(unwrapData(data));
    },

    async getById(id: string): Promise<LoanWithRelations> {
      const { data } = await client.get(`/loans/${id}`);
      return loanWithRelationsSchema.parse(unwrapData(data));
    },

    async checkout(input: CheckoutLoanInput): Promise<LoanWithRelations> {
      const body = checkoutLoanInputSchema.parse(input);
      const { data } = await client.post('/loans/checkout', body);
      return loanWithRelationsSchema.parse(unwrapData(data));
    },

    async returnLoan(id: string): Promise<LoanWithRelations> {
      const { data } = await client.post(`/loans/${id}/return`);
      return loanWithRelationsSchema.parse(unwrapData(data));
    },

    async listMine(params?: ListLoansParams): Promise<PaginatedLoans> {
      const parsed = listLoansParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/my/loans', {
        params: buildQueryParams(parsed),
      });
      return paginatedLoansSchema.parse(unwrapData(data));
    },
  };
}
