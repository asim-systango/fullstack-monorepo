import { createApiClient, createAuthApi, createHealthApi } from '@shared/api-client';
import { resolveApiBaseUrl } from './api-base-url';
import { createAuctionsApi } from './api/auctions';
import { createBidsApi } from './api/bids';
import { createWatchlistApi } from './api/watchlist';

const baseURL = resolveApiBaseUrl();

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: () => {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      const next = `${window.location.pathname}${window.location.search}`;
      const params = new URLSearchParams({ next });
      window.location.assign(`/login?${params.toString()}`);
    }
  },
});

export const authApi = createAuthApi(apiClient);
export const healthApi = createHealthApi(apiClient);
export const auctionsApi = createAuctionsApi(apiClient);
export const bidsApi = createBidsApi(apiClient);
export const watchlistApi = createWatchlistApi(apiClient);

export { auctionQueryKeys, bidQueryKeys, watchlistQueryKeys } from './api/index';
