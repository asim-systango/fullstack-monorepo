import { unwrapData, type createApiClient } from '@shared/api-client';
import type { MessageResult, WatchlistItem } from '../schemas/auction';

type ApiClient = ReturnType<typeof createApiClient>;

export function createWatchlistApi(client: ApiClient) {
  return {
    async list(): Promise<WatchlistItem[]> {
      const { data } = await client.get('/users/me/watchlist');
      return unwrapData<WatchlistItem[]>(data);
    },

    async add(auctionId: string): Promise<{ message: string; watchlist: WatchlistItem }> {
      const { data } = await client.post(`/auctions/${auctionId}/watch`);
      return unwrapData(data);
    },

    async remove(auctionId: string): Promise<MessageResult & { auctionId?: string }> {
      const { data } = await client.delete(`/auctions/${auctionId}/watch`);
      return unwrapData(data);
    },
  };
}
