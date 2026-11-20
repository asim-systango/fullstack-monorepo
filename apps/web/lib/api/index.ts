export { createAuctionsApi } from './auctions';
export { createBidsApi } from './bids';
export { createWatchlistApi } from './watchlist';

export const auctionQueryKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionQueryKeys.all, 'list'] as const,
  list: (params: unknown) => [...auctionQueryKeys.lists(), params] as const,
  details: () => [...auctionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...auctionQueryKeys.details(), id] as const,
  dashboard: () => [...auctionQueryKeys.all, 'dashboard'] as const,
};

export const bidQueryKeys = {
  all: ['bids'] as const,
  forAuction: (auctionId: string) => [...bidQueryKeys.all, 'auction', auctionId] as const,
  me: () => [...bidQueryKeys.all, 'me'] as const,
};

export const watchlistQueryKeys = {
  all: ['watchlist'] as const,
  me: () => [...watchlistQueryKeys.all, 'me'] as const,
};
