'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateBookCopyInput,
  CreateBookInput,
  ListBookCopiesParams,
  ListBooksParams,
} from '@shared/types';
import { useAuth } from '@/components/auth';
import { bookCopiesApi, booksApi } from '@/lib/api';
import { canManageBooks, hasRole, ROLES } from '@/lib/auth/roles';
import { INSUFFICIENT_PERMISSIONS } from '@/lib/bookly/constants';
import { invalidateBookQueries } from '@/lib/bookly/invalidate';
import { queryKeys } from '@/lib/query-keys';

function useIsStaffOrAdmin() {
  const { user } = useAuth();
  return canManageBooks(user);
}

export function useBooks(
  params?: ListBooksParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: ({ signal }) => booksApi.list(params, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useBook(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.books.detail(id ?? ''),
    queryFn: () => booksApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useBookActions(id: string | undefined) {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.user]) && Boolean(id);
  return useQuery({
    queryKey: queryKeys.books.actions(id ?? ''),
    queryFn: () => booksApi.getMyActions(id!),
    enabled,
  });
}

export function useDeletedBooks(
  params?: ListBooksParams,
  options?: { enabled?: boolean },
) {
  const enabled = useIsStaffOrAdmin() && (options?.enabled ?? true);
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
