'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateBookCopyInput,
  CreateBookInput,
  ListBookCopiesParams,
  ListBooksParams,
  UpdateBookCopyInput,
  UpdateBookInput,
} from '@shared/types';
import { useAuth } from '@/components/auth';
import { bookCopiesApi, booksApi } from '@/lib/api';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { INSUFFICIENT_PERMISSIONS } from '@/lib/bookly/constants';
import { invalidateBookQueries } from '@/lib/bookly/invalidate';
import { queryKeys } from '@/lib/query-keys';

function useIsStaffOrAdmin() {
  const { user } = useAuth();
  return hasRole(user, LIBRARIAN_ROLES);
}

export function useBooks(params?: ListBooksParams) {
  return useQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => booksApi.list(params),
  });
}

export function useBook(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.books.detail(id ?? ''),
    queryFn: () => booksApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useDeletedBooks(params?: ListBooksParams) {
  const enabled = useIsStaffOrAdmin();
  return useQuery({
    queryKey: queryKeys.books.deleted(params),
    queryFn: () => booksApi.listDeleted(params),
    enabled,
  });
}

export function useBookCopies(bookId: string | undefined, params?: ListBookCopiesParams) {
  const enabled = useIsStaffOrAdmin() && Boolean(bookId);
  return useQuery({
    queryKey: queryKeys.bookCopies.list(bookId ?? '', params),
    queryFn: () => bookCopiesApi.list(bookId!, params),
    enabled,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  const enabled = useIsStaffOrAdmin();
  return useMutation({
    mutationFn: (input: CreateBookInput) => {
      if (!enabled) throw new Error(INSUFFICIENT_PERMISSIONS);
      return booksApi.create(input);
    },
    onSuccess: () => invalidateBookQueries(queryClient),
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  const enabled = useIsStaffOrAdmin();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBookInput }) => {
      if (!enabled) throw new Error(INSUFFICIENT_PERMISSIONS);
      return booksApi.update(id, input);
    },
    onSuccess: (book) => invalidateBookQueries(queryClient, book.id),
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  const enabled = useIsStaffOrAdmin();
  return useMutation({
    mutationFn: (id: string) => {
      if (!enabled) throw new Error(INSUFFICIENT_PERMISSIONS);
      return booksApi.remove(id);
    },
    onSuccess: (_void, id) => invalidateBookQueries(queryClient, id),
  });
}

export function useRestoreBook() {
  const queryClient = useQueryClient();
  const enabled = useIsStaffOrAdmin();
  return useMutation({
    mutationFn: (id: string) => {
      if (!enabled) throw new Error(INSUFFICIENT_PERMISSIONS);
      return booksApi.restore(id);
    },
    onSuccess: (book) => invalidateBookQueries(queryClient, book.id),
  });
}

export function useCreateBookCopy() {
  const queryClient = useQueryClient();
  const enabled = useIsStaffOrAdmin();
  return useMutation({
    mutationFn: ({ bookId, input }: { bookId: string; input: CreateBookCopyInput }) => {
      if (!enabled) throw new Error(INSUFFICIENT_PERMISSIONS);
      return bookCopiesApi.create(bookId, input);
    },
    onSuccess: (copy) => invalidateBookQueries(queryClient, copy.bookId),
  });
}

export function useUpdateBookCopy() {
  const queryClient = useQueryClient();
  const enabled = useIsStaffOrAdmin();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBookCopyInput }) => {
      if (!enabled) throw new Error(INSUFFICIENT_PERMISSIONS);
      return bookCopiesApi.update(id, input);
    },
    onSuccess: (copy) => invalidateBookQueries(queryClient, copy.bookId),
  });
}

export function useDeleteBookCopy() {
  const queryClient = useQueryClient();
  const enabled = useIsStaffOrAdmin();
  return useMutation({
    mutationFn: ({ id, bookId }: { id: string; bookId: string }) => {
      if (!enabled) throw new Error(INSUFFICIENT_PERMISSIONS);
      return bookCopiesApi.remove(id).then(() => bookId);
    },
    onSuccess: (bookId) => invalidateBookQueries(queryClient, bookId),
  });
}

export function useCanManageBooks() {
  const { user } = useAuth();
  return hasRole(user, [ROLES.staff, ROLES.admin]);
}
