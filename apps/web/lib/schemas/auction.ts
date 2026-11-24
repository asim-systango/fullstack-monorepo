export type AuctionStatus = 'open' | 'closed' | 'cancelled';

export type Auction = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  startingPrice: string;
  minIncrement: string;
  currentPrice: string;
  endsAt: string;
  status: AuctionStatus;
  sellerId: string;
  winnerId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuctionListResponse = {
  items: Auction[];
  total: number;
  page: number;
  limit: number;
};

export type AuctionListParams = {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  status?: AuctionStatus;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type CreateAuctionInput = {
  title: string;
  description?: string;
  category: string;
  startingPrice: number;
  minIncrement: number;
  endsAt: string;
};

export type UpdateAuctionInput = Partial<CreateAuctionInput>;

export type SellerDashboard = {
  openAuctions: number;
  totalBids: number;
  itemsSold: number;
};

export type Bid = {
  id: string;
  auctionId: string;
  bidderId: string;
  bidAmount: string;
  createdAt: string;
  /** Present on auction bid history (`GET /auctions/:id/bids`). */
  bidderName?: string;
};

export type MyBidStatus = 'Winning' | 'Outbid' | 'Won' | 'Lost' | 'Pending';

export type MyBid = Bid & {
  auction: Auction;
  status: MyBidStatus | string;
};

export type WatchlistItem = {
  id: string;
  userId: string;
  auctionId: string;
  createdAt: string;
  auction: Auction;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type BidListResponse = {
  items: Bid[];
  total: number;
  page: number;
  limit: number;
};

export type MyBidListResponse = {
  items: MyBid[];
  total: number;
  page: number;
  limit: number;
};

export type WatchlistListResponse = {
  items: WatchlistItem[];
  total: number;
  page: number;
  limit: number;
};

export type AuctionMutationResult = {
  message: string;
  auction: Auction;
};

export type BidMutationResult = {
  message: string;
  bid: Bid;
};

export type MessageResult = {
  message: string;
};
