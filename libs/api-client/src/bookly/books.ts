import type { AxiosInstance } from 'axios';
import {
  bookCopySchema,
  bookDetailSchema,
  bookSchema,
  bookViewerActionsSchema,
  createBookCopyInputSchema,
  createBookInputSchema,
  listBookCopiesParamsSchema,
  listBooksParamsSchema,
  paginatedBooksSchema,
  updateBookCopyInputSchema,
  updateBookInputSchema,
  type Book,
  type BookCopy,
  type BookDetail,
  type BookViewerActions,
  type CreateBookCopyInput,
  type CreateBookInput,
  type ListBookCopiesParams,
  type ListBooksParams,
  type PaginatedBooks,
  type UpdateBookCopyInput,
  type UpdateBookInput,
} from '@shared/types';
import { unwrapData } from '../unwrap';
import { buildQueryParams } from '../query-params';

export function createBooksApi(client: AxiosInstance) {
  return {
    async list(params?: ListBooksParams, signal?: AbortSignal): Promise<PaginatedBooks> {
      const parsed = listBooksParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/books', {
        params: buildQueryParams(parsed),
        signal,
      });
      return paginatedBooksSchema.parse(unwrapData(data));
    },

    async listDeleted(params?: ListBooksParams): Promise<PaginatedBooks> {
      const parsed = listBooksParamsSchema.partial().parse(params ?? {});
      const { data } = await client.get('/books/deleted', {
        params: buildQueryParams(parsed),
      });
      return paginatedBooksSchema.parse(unwrapData(data));
    },

    async getById(id: string): Promise<BookDetail> {
      const { data } = await client.get(`/books/${id}`);
      return bookDetailSchema.parse(unwrapData(data));
    },

    async getMyActions(id: string): Promise<BookViewerActions> {
      const { data } = await client.get(`/my/books/${id}/actions`);
      return bookViewerActionsSchema.parse(unwrapData(data));
    },

    async create(input: CreateBookInput): Promise<Book> {
      const body = createBookInputSchema.parse(input);
      const { data } = await client.post('/books', body);
      return bookSchema.parse(unwrapData(data));
    },

    async update(id: string, input: UpdateBookInput): Promise<Book> {
      const body = updateBookInputSchema.parse(input);
      const { data } = await client.patch(`/books/${id}`, body);
      return bookSchema.parse(unwrapData(data));
    },

    async remove(id: string): Promise<void> {
      await client.delete(`/books/${id}`);
    },

    async restore(id: string): Promise<Book> {
      const { data } = await client.post(`/books/${id}/restore`);
      return bookSchema.parse(unwrapData(data));
    },
  };
}

export function createBookCopiesApi(client: AxiosInstance) {
  return {
    async list(bookId: string, params?: ListBookCopiesParams): Promise<BookCopy[]> {
      const parsed = listBookCopiesParamsSchema.parse(params ?? {});
      const { data } = await client.get(`/books/${bookId}/copies`, {
        params: buildQueryParams(parsed),
      });
      return bookCopySchema.array().parse(unwrapData(data));
    },

    async create(bookId: string, input: CreateBookCopyInput): Promise<BookCopy> {
      const body = createBookCopyInputSchema.parse(input);
      const { data } = await client.post(`/books/${bookId}/copies`, body);
      return bookCopySchema.parse(unwrapData(data));
    },

    async update(id: string, input: UpdateBookCopyInput): Promise<BookCopy> {
      const body = updateBookCopyInputSchema.parse(input);
      const { data } = await client.patch(`/copies/${id}`, body);
      return bookCopySchema.parse(unwrapData(data));
    },

    async remove(id: string): Promise<void> {
      await client.delete(`/copies/${id}`);
    },
  };
}
