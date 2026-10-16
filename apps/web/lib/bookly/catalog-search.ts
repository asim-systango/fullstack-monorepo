export type CatalogAppliedFilters = {
  q: string;
  author: string;
  isbn: string;
  availableOnly: boolean;
  page: number;
};

export function normalizeIsbn(value: string): string {
  return value.trim().replace(/[-\s]/g, '');
}

export function parseCatalogSearchParams(params: {
  get: (key: string) => string | null;
}): CatalogAppliedFilters {
  const page = Math.max(1, Number(params.get('page') || '1') || 1);
  return {
    q: (params.get('q') ?? '').trim(),
    author: (params.get('author') ?? '').trim(),
    isbn: normalizeIsbn(params.get('isbn') ?? ''),
    availableOnly: params.get('availableOnly') === 'true',
    page,
  };
}

export function catalogSearchQueryString(filters: CatalogAppliedFilters): string {
  const next = new URLSearchParams();
  if (filters.q) next.set('q', filters.q);
  if (filters.author) next.set('author', filters.author);
  if (filters.isbn) next.set('isbn', filters.isbn);
  if (filters.availableOnly) next.set('availableOnly', 'true');
  if (filters.page > 1) next.set('page', String(filters.page));
  return next.toString();
}
