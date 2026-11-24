import { unwrapData, type createApiClient } from '@shared/api-client';
import type {
  MessageResult,
  PaginationParams,
  WatchlistItem,
  WatchlistListResponse,
} from '../schemas/auction';

type ApiClient = ReturnType<typeof createApiClient>;

function paginationQuery(params?: PaginationParams): Record<string, number> {
  const query: Record<string, number> = {};
  if (params?.page != null) query.page = params.page;
  if (params?.limit != null) query.limit = params.limit;
  return query;
}

export function createWatchlistApi(client: ApiClient) {
  return {
    async list(params?: PaginationParams): Promise<WatchlistItem[]> {
      const { data } = await client.get('/users/me/watchlist', {
        params: paginationQuery(params),
      });
      const envelope = unwrapData<WatchlistListResponse>(data);
      return envelope.items;
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
