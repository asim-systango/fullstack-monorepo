import { unwrapData, type createApiClient } from '@shared/api-client';
import type { Bid, BidMutationResult, MyBid } from '../schemas/auction';

type ApiClient = ReturnType<typeof createApiClient>;

export function createBidsApi(client: ApiClient) {
  return {
    async listForAuction(auctionId: string): Promise<Bid[]> {
      const { data } = await client.get(`/auctions/${auctionId}/bids`);
      return unwrapData<Bid[]>(data);
    },

    async place(auctionId: string, bidAmount: number): Promise<BidMutationResult> {
      const { data } = await client.post(`/auctions/${auctionId}/bids`, { bidAmount });
      return unwrapData<BidMutationResult>(data);
    },

    async me(): Promise<MyBid[]> {
      const { data } = await client.get('/bids/me');
      return unwrapData<MyBid[]>(data);
    },
  };
}
