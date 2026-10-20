export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export function paginate<T>(
  items: T[],
  total: number,
  page = 1,
  limit = 20,
): Paginated<T> {
  return {
    items,
    total,
    page,
    limit,
  };
}

export function getSkip(page = 1, limit = 20): number {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  return (safePage - 1) * safeLimit;
}
