import type {
  ListBooksParams,
  ListFinesParams,
  ListLoansParams,
  ListMembersParams,
  ListReservationsParams,
  ListCheckoutRequestsParams,
  LookupLoanParams,
  ListBookCopiesParams,
} from '@shared/types';

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: ['auth', 'me'] as const,
  },
  books: {
    all: ['books'] as const,
    lists: () => [...queryKeys.books.all, 'list'] as const,
    list: (params?: ListBooksParams) =>
      [...queryKeys.books.lists(), params ?? {}] as const,
    deleted: (params?: ListBooksParams) =>
      [...queryKeys.books.all, 'deleted', params ?? {}] as const,
    details: () => [...queryKeys.books.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.books.details(), id] as const,
  },
  bookCopies: {
    all: ['bookCopies'] as const,
    list: (bookId: string, params?: ListBookCopiesParams) =>
      [...queryKeys.bookCopies.all, bookId, params ?? {}] as const,
  },
  loans: {
    all: ['loans'] as const,
    lists: () => [...queryKeys.loans.all, 'list'] as const,
    list: (params?: ListLoansParams) =>
      [...queryKeys.loans.lists(), params ?? {}] as const,
    overdue: (params?: ListLoansParams) =>
      [...queryKeys.loans.all, 'overdue', params ?? {}] as const,
    lookup: (params: LookupLoanParams) =>
      [...queryKeys.loans.all, 'lookup', params] as const,
    details: () => [...queryKeys.loans.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.loans.details(), id] as const,
    mine: (params?: ListLoansParams) =>
      [...queryKeys.loans.all, 'mine', params ?? {}] as const,
  },
  reservations: {
    all: ['reservations'] as const,
    list: (params?: ListReservationsParams) =>
      [...queryKeys.reservations.all, 'list', params ?? {}] as const,
    mine: (params?: ListReservationsParams) =>
      [...queryKeys.reservations.all, 'mine', params ?? {}] as const,
    byBook: (bookId: string) => [...queryKeys.reservations.all, 'book', bookId] as const,
  },
  checkoutRequests: {
    all: ['checkoutRequests'] as const,
    list: (params?: ListCheckoutRequestsParams) =>
      [...queryKeys.checkoutRequests.all, 'list', params ?? {}] as const,
    mine: (params?: ListCheckoutRequestsParams) =>
      [...queryKeys.checkoutRequests.all, 'mine', params ?? {}] as const,
    details: () => [...queryKeys.checkoutRequests.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.checkoutRequests.details(), id] as const,
  },
  fines: {
    all: ['fines'] as const,
    list: (params?: ListFinesParams) =>
      [...queryKeys.fines.all, 'list', params ?? {}] as const,
    mine: (params?: ListFinesParams) =>
      [...queryKeys.fines.all, 'mine', params ?? {}] as const,
    details: () => [...queryKeys.fines.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.fines.details(), id] as const,
  },
  members: {
    all: ['members'] as const,
    list: (params?: ListMembersParams) =>
      [...queryKeys.members.all, 'list', params ?? {}] as const,
    search: (q: string) => [...queryKeys.members.all, 'search', q] as const,
    details: () => [...queryKeys.members.all, 'detail'] as const,
    detail: (userId: string) => [...queryKeys.members.details(), userId] as const,
    loanSummary: (userId: string) =>
      [...queryKeys.members.all, 'loanSummary', userId] as const,
  },
  settings: {
    all: ['settings'] as const,
    list: () => [...queryKeys.settings.all, 'list'] as const,
    detail: (key: string) => [...queryKeys.settings.all, 'detail', key] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    public: ['dashboard', 'public'] as const,
    member: ['dashboard', 'member'] as const,
    librarian: ['dashboard', 'librarian'] as const,
    admin: ['dashboard', 'admin'] as const,
  },
} as const;
