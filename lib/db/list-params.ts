/**
 * Shared parsing for the admin list endpoints (search, filter, sort, paginate).
 *
 * Sort columns are matched against an explicit allow-list before being
 * interpolated into SQL — nothing user-supplied reaches the query text.
 */
export type ListParams = {
  search: string;
  status: string;
  page: number;
  pageSize: number;
  offset: number;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
};

export function parseListParams(
  url: URL,
  options: { sortable: readonly string[]; defaultSort: string; defaultDirection?: 'asc' | 'desc' }
): ListParams {
  const requestedSort = url.searchParams.get('sort') ?? '';
  const sortColumn = options.sortable.includes(requestedSort) ? requestedSort : options.defaultSort;

  const requestedDirection = (url.searchParams.get('dir') ?? '').toLowerCase();
  const sortDirection: 'asc' | 'desc' =
    requestedDirection === 'asc' || requestedDirection === 'desc'
      ? requestedDirection
      : (options.defaultDirection ?? 'desc');

  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
  const pageSize = Math.min(100, Math.max(5, Number(url.searchParams.get('pageSize') ?? '20') || 20));

  return {
    search: (url.searchParams.get('q') ?? '').trim(),
    status: (url.searchParams.get('status') ?? '').trim(),
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    sortColumn,
    sortDirection,
  };
}

export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function paginated<T>(data: T[], total: number, params: ListParams): Paginated<T> {
  return {
    data,
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  };
}
