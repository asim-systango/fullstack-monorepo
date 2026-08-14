import { z } from 'zod';
import { bookSchema } from './books';
import { reservationStatusSchema } from './enums';
import { paginatedSchema, paginationParamsSchema } from './pagination';

export const reservationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bookId: z.string().uuid(),
  status: reservationStatusSchema,
  queuePosition: z.number().int().nullable(),
  createdAt: z.string(),
  fulfilledAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
});
export type Reservation = z.infer<typeof reservationSchema>;

export const reservationWithBookSchema = reservationSchema.extend({
  book: bookSchema,
});
export type ReservationWithBook = z.infer<typeof reservationWithBookSchema>;

export const paginatedReservationsSchema = paginatedSchema(reservationWithBookSchema);
export type PaginatedReservations = z.infer<typeof paginatedReservationsSchema>;

export const listReservationsParamsSchema = paginationParamsSchema.extend({
  userId: z.string().uuid().optional(),
  bookId: z.string().uuid().optional(),
  status: reservationStatusSchema.optional(),
});
export type ListReservationsParams = z.infer<typeof listReservationsParamsSchema>;

export const createReservationInputSchema = z.object({
  bookId: z.string().uuid(),
});
export type CreateReservationInput = z.infer<typeof createReservationInputSchema>;
