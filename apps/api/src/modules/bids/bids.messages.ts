export const bidsMessages = {
  ONLY_OPEN_ACCEPT_BIDS: 'Only open auctions accept bids',
  AUCTION_HAS_ENDED: 'This auction has ended',
  CANNOT_BID_OWN: 'You cannot bid on your own auction',
  CREATED_SUCCESS: 'Bid created successfully!',
  bidTooLow: (minAmount: string) => `Bid must be at least ${minAmount}`,
} as const;
