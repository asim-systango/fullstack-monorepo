import type { AxiosInstance } from 'axios';
import {
  createReservationInputSchema,
  listReservationsParamsSchema,
  paginatedReservationsSchema,
  reservationSchema,
  type CreateReservationInput,
  type ListReservationsParams,
  type PaginatedReservations,
  type Reservation,
} from '@shared/types';
import { unwrapData } from '../unwrap';
import { buildQueryParams } from '../query-params';

export function createReservationsApi(client: AxiosInstance) {
  return {
    async list(params?: ListReservationsParams): Promise<PaginatedReservations> {
      const parsed = listReservationsParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/reservations', {
        params: buildQueryParams(parsed),
      });
      return paginatedReservationsSchema.parse(unwrapData(data));
    },

    async listMine(params?: ListReservationsParams): Promise<PaginatedReservations> {
      const parsed = listReservationsParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/my/reservations', {
        params: buildQueryParams(parsed),
      });
      return paginatedReservationsSchema.parse(unwrapData(data));
    },

    async listByBook(bookId: string): Promise<Reservation[]> {
      const { data } = await client.get(`/books/${bookId}/reservations`);
      return reservationSchema.array().parse(unwrapData(data));
    },

    async create(input: CreateReservationInput): Promise<Reservation> {
      const body = createReservationInputSchema.parse(input);
      const { data } = await client.post('/reservations', body);
      return reservationSchema.parse(unwrapData(data));
    },

    async cancel(id: string): Promise<void> {
      await client.delete(`/reservations/${id}`);
    },
  };
}
