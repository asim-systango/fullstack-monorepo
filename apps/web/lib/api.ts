import {
  createApiClient,
  createAuthApi,
  createHealthApi,
  unwrapData,
} from '@shared/api-client';
import { resolveApiBaseUrl } from './api-base-url';

const baseURL = resolveApiBaseUrl();

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: () => {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  },
});

export const authApi = createAuthApi(apiClient);
export const healthApi = createHealthApi(apiClient);

export interface Hotel {
  id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  imageUrl: string | null;
  managerId: string;
  rooms?: Room[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type RoomType = 'single' | 'double' | 'suite';

export interface Room {
  id: string;
  hotelId: string;
  hotel?: Hotel;
  name: string;
  type: RoomType;
  pricePerNight: number; // in cents
  capacity: number;
  amenities: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  roomId: string;
  room?: Room;
  userId: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  totalPrice: number; // in cents
  paymentIntent?: PaymentIntent;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  hotelId: string;
  hotel?: Hotel;
  userId: string;
  bookingId: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaymentIntent {
  id: string;
  bookingId: string;
  amount: number; // in cents
  status: 'pending' | 'paid' | 'refunded';
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const hotelApi = {
  async getHotels(params: {
    city?: string;
    q?: string;
    page?: number;
    limit?: number;
    withDeleted?: boolean;
  }): Promise<PaginatedResponse<Hotel>> {
    const url = params.withDeleted ? '/hotels/manage' : '/hotels';
    const { data } = await apiClient.get(url, { params });
    return unwrapData(data);
  },

  async getHotel(id: string): Promise<Hotel> {
    const { data } = await apiClient.get(`/hotels/${id}`);
    return unwrapData(data);
  },

  async createHotel(dto: {
    name: string;
    description: string;
    city: string;
    address: string;
    imageUrl?: string | null;
    managerId?: string;
  }): Promise<Hotel> {
    const { data } = await apiClient.post('/hotels', dto);
    return unwrapData(data);
  },

  async updateHotel(
    id: string,
    dto: {
      name?: string;
      description?: string;
      city?: string;
      address?: string;
      imageUrl?: string | null;
      managerId?: string;
    },
  ): Promise<Hotel> {
    const { data } = await apiClient.patch(`/hotels/${id}`, dto);
    return unwrapData(data);
  },

  async deleteHotel(id: string): Promise<{ deleted: boolean }> {
    const { data } = await apiClient.delete(`/hotels/${id}`);
    return unwrapData(data);
  },
};

export const roomApi = {
  async getRooms(hotelId: string): Promise<Room[]> {
    const { data } = await apiClient.get(`/hotels/${hotelId}/rooms`);
    return unwrapData(data);
  },

  async createRoom(
    hotelId: string,
    dto: {
      name: string;
      type: 'single' | 'double' | 'suite';
      pricePerNight: number;
      capacity?: number;
      amenities?: string;
      isActive?: boolean;
    },
  ): Promise<Room> {
    const { data } = await apiClient.post(`/hotels/${hotelId}/rooms`, dto);
    return unwrapData(data);
  },

  async updateRoom(
    id: string,
    dto: {
      name?: string;
      type?: 'single' | 'double' | 'suite';
      pricePerNight?: number;
      capacity?: number;
      amenities?: string;
      isActive?: boolean;
    },
  ): Promise<Room> {
    const { data } = await apiClient.patch(`/rooms/${id}`, dto);
    return unwrapData(data);
  },

  async deleteRoom(id: string): Promise<{ deleted: boolean }> {
    const { data } = await apiClient.delete(`/rooms/${id}`);
    return unwrapData(data);
  },
};

export const availabilityApi = {
  async checkAvailability(params: {
    hotelId?: string;
    checkIn: string;
    checkOut: string;
  }): Promise<Room[]> {
    const { data } = await apiClient.get('/availability', { params });
    return unwrapData(data);
  },
};

export const bookingApi = {
  async getBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Booking>> {
    const { data } = await apiClient.get('/bookings', { params });
    return unwrapData(data);
  },

  async getBooking(id: string): Promise<Booking> {
    const { data } = await apiClient.get(`/bookings/${id}`);
    return unwrapData(data);
  },

  async createBooking(dto: {
    roomId: string;
    checkIn: string;
    checkOut: string;
  }): Promise<Booking> {
    const { data } = await apiClient.post('/bookings', dto);
    return unwrapData(data);
  },

  async cancelBooking(id: string): Promise<Booking> {
    const { data } = await apiClient.patch(`/bookings/${id}/cancel`);
    return unwrapData(data);
  },
};

export const reviewApi = {
  async getReviews(hotelId: string): Promise<Review[]> {
    const { data } = await apiClient.get(`/hotels/${hotelId}/reviews`);
    return unwrapData(data);
  },

  async createReview(dto: {
    hotelId: string;
    bookingId?: string | null;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const { data } = await apiClient.post('/reviews', dto);
    return unwrapData(data);
  },
};

export const paymentApi = {
  async getPayment(bookingId: string): Promise<PaymentIntent> {
    const { data } = await apiClient.get(`/bookings/${bookingId}/payment`);
    return unwrapData(data);
  },
};
