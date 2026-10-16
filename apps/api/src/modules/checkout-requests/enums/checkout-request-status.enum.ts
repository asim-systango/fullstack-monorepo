/** Member checkout-request lifecycle. Fulfilled means a loan was issued. */
export enum CheckoutRequestStatus {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Cancelled = 'cancelled',
  Rejected = 'rejected',
}
