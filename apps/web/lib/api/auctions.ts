import { unwrapData, type createApiClient } from '@shared/api-client';

type ApiClient = ReturnType<typeof createApiClient>;
import type {
  Auction,
  AuctionListParams,
  AuctionListResponse,
  AuctionMutationResult,
  CreateAuctionInput,
  MessageResult,
  SellerDashboard,
  UpdateAuctionInput,
} from '../schemas/auction';

function toQuery(params: AuctionListParams = {}): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.page !== undefined) query.page = params.page;
  if (params.limit !== undefined) query.limit = params.limit;
  if (params.q) query.q = params.q;
  if (params.category) query.category = params.category;
  if (params.status) query.status = params.status;
  if (params.sellerId) query.sellerId = params.sellerId;
  if (params.minPrice !== undefined) query.minPrice = params.minPrice;
  if (params.maxPrice !== undefined) query.maxPrice = params.maxPrice;
  return query;
}

export function createAuctionsApi(client: ApiClient) {
  return {
    async list(params?: AuctionListParams): Promise<AuctionListResponse> {
      const { data } = await client.get('/auctions', { params: toQuery(params) });
      return unwrapData<AuctionListResponse>(data);
    },

    async getById(id: string): Promise<Auction> {
      const { data } = await client.get(`/auctions/${id}`);
      return unwrapData<Auction>(data);
    },

    async create(input: CreateAuctionInput): Promise<Auction> {
      const { data } = await client.post('/auctions', input);
      return unwrapData<Auction>(data);
    },

    async update(id: string, input: UpdateAuctionInput): Promise<AuctionMutationResult> {
      const { data } = await client.patch(`/auctions/${id}`, input);
      return unwrapData<AuctionMutationResult>(data);
    },

    async softDelete(id: string): Promise<MessageResult> {
      const { data } = await client.delete(`/auctions/${id}`);
      return unwrapData<MessageResult>(data);
    },

    async close(id: string): Promise<AuctionMutationResult> {
      const { data } = await client.post(`/auctions/${id}/close`);
      return unwrapData<AuctionMutationResult>(data);
    },

    async cancel(id: string): Promise<AuctionMutationResult> {
      const { data } = await client.post(`/auctions/${id}/cancel`);
      return unwrapData<AuctionMutationResult>(data);
    },

    async dashboard(): Promise<SellerDashboard> {
      const { data } = await client.get('/auctions/me/dashboard');
      return unwrapData<SellerDashboard>(data);
    },
  };
}
