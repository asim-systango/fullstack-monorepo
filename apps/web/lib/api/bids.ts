import { unwrapData, type createApiClient } from '@shared/api-client';
import type {
  Bid,
  BidListResponse,
  BidMutationResult,
  MyBid,
  MyBidListResponse,
  PaginationParams,
} from '../schemas/auction';

type ApiClient = ReturnType<typeof createApiClient>;

function paginationQuery(params?: PaginationParams): Record<string, number> {
  const query: Record<string, number> = {};
  if (params?.page != null) query.page = params.page;
  if (params?.limit != null) query.limit = params.limit;
  return query;
}

export function createBidsApi(client: ApiClient) {
  return {
    async listForAuction(auctionId: string, params?: PaginationParams): Promise<Bid[]> {
      const { data } = await client.get(`/auctions/${auctionId}/bids`, {
        params: paginationQuery(params),
      });
      const envelope = unwrapData<BidListResponse>(data);
      return envelope.items;
    },

    async place(auctionId: string, bidAmount: number): Promise<BidMutationResult> {
      const { data } = await client.post(`/auctions/${auctionId}/bids`, { bidAmount });
      return unwrapData<BidMutationResult>(data);
    },

    async me(params?: PaginationParams): Promise<MyBid[]> {
      const { data } = await client.get('/bids/me', {
        params: paginationQuery(params),
      });
      const envelope = unwrapData<MyBidListResponse>(data);
      return envelope.items;
    },
  };
}
