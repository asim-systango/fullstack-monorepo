import { z } from 'zod';
import { bookCopyStatusSchema, bookSortSchema } from './enums';
import { paginatedSchema, paginationParamsSchema } from './pagination';

export const bookSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  author: z.string(),
  isbn: z.string(),
  description: z.string().nullable(),
  publishedYear: z.number().int().nullable(),
  createdBy: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  totalCopies: z.number().int().nonnegative().optional(),
  availableCopies: z.number().int().nonnegative().optional(),
});
export type Book = z.infer<typeof bookSchema>;

export const bookDetailSchema = bookSchema.extend({
  totalCopies: z.number().int().nonnegative(),
  availableCopies: z.number().int().nonnegative(),
  onLoanCopies: z.number().int().nonnegative(),
});
export type BookDetail = z.infer<typeof bookDetailSchema>;

export const paginatedBooksSchema = paginatedSchema(bookSchema);
export type PaginatedBooks = z.infer<typeof paginatedBooksSchema>;

export const bookCopySchema = z.object({
  id: z.string().uuid(),
  bookId: z.string().uuid(),
  barcode: z.string(),
  status: bookCopyStatusSchema,
  acquiredAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});
export type BookCopy = z.infer<typeof bookCopySchema>;

export const listBooksParamsSchema = paginationParamsSchema.extend({
  q: z.string().optional(),
  author: z.string().optional(),
  isbn: z.string().optional(),
  availableOnly: z.boolean().optional(),
  sort: bookSortSchema.optional(),
});
export type ListBooksParams = z.infer<typeof listBooksParamsSchema>;

export const createBookInputSchema = z.object({
  title: z.string().min(1).max(300),
  author: z.string().min(1).max(200),
  isbn: z.string().min(1).max(20),
  description: z.string().max(2000).optional(),
  publishedYear: z.number().int().min(1000).max(9999).optional(),
});
export type CreateBookInput = z.infer<typeof createBookInputSchema>;

export const updateBookInputSchema = createBookInputSchema.partial();
export type UpdateBookInput = z.infer<typeof updateBookInputSchema>;

export const listBookCopiesParamsSchema = z.object({
  status: bookCopyStatusSchema.optional(),
});
export type ListBookCopiesParams = z.infer<typeof listBookCopiesParamsSchema>;

export const createBookCopyInputSchema = z.object({
  barcode: z.string().min(1).max(50),
  acquiredAt: z.string().optional(),
});
export type CreateBookCopyInput = z.infer<typeof createBookCopyInputSchema>;

export const updateBookCopyInputSchema = z.object({
  barcode: z.string().min(1).max(50).optional(),
  status: z.enum(['available', 'lost']).optional(),
});
export type UpdateBookCopyInput = z.infer<typeof updateBookCopyInputSchema>;

export const bookViewerActionsSchema = z.object({
  available: z.boolean(),
  availableCopies: z.number().int().nonnegative(),
  totalCopies: z.number().int().nonnegative(),
  maxActiveLoans: z.number().int().positive(),
  activeLoanCount: z.number().int().nonnegative(),
  atBorrowLimit: z.boolean(),
  ownLoan: z
    .object({
      id: z.string().uuid(),
      dueDate: z.string(),
    })
    .nullable(),
  ownReservation: z
    .object({
      id: z.string().uuid(),
      queuePosition: z.number().int().nullable(),
    })
    .nullable(),
  pendingRequest: z
    .object({
      id: z.string().uuid(),
    })
    .nullable(),
  canRequestCheckout: z.boolean(),
  canReserve: z.boolean(),
});
export type BookViewerActions = z.infer<typeof bookViewerActionsSchema>;
