import type { AuctionListParams } from './schemas/auction';

/** Shared homepage list params — one Query cache entry for Featured / Ending Soon / Recent. */
export const HOME_OPEN_AUCTIONS_PARAMS: AuctionListParams = {
  status: 'open',
  page: 1,
  limit: 24,
};

export const HOME_SECTION_LIMIT = 6;
