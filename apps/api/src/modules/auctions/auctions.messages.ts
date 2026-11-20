export const auctionsMessages = {
  END_TIME_MUST_BE_FUTURE: 'End time must be in the future',
  NOT_AUTHORIZED_UPDATE: 'You are not authorized to update this auction',
  NOT_AUTHORIZED_DELETE: 'You are not authorized to delete this auction',
  NOT_AUTHORIZED_CLOSE: 'You are not authorized to close this auction',
  ONLY_OPEN_CAN_UPDATE: 'Only open auctions can be updated',
  ONLY_OPEN_CAN_CANCEL: 'Only open auctions can be cancelled',
  ALREADY_HAS_BIDS: 'This auction already has bids',
  ALREADY_CLOSED_OR_CANCELLED: 'This auction is already closed or cancelled.',
  UPDATED_SUCCESS: 'Auction updated successfully',
  DELETED_SUCCESS: 'Auction deleted successfully',
  CLOSED_SUCCESS: 'Auction Closed Successfully',
  CANCELLED_SUCCESS: 'Auction cancelled successfully',
} as const;
