export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginationDefaults = {
  page?: number;
  pageSize?: number;
  maxPageSize?: number;
};

export type PaginatedResult<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function parsePaginationParams(
  page?: number,
  pageSize?: number,
  defaults: PaginationDefaults = {},
): PaginationParams {
  const normalizedPage = Math.max(page ?? defaults.page ?? 1, 1);
  const normalizedPageSize = Math.min(
    Math.max(pageSize ?? defaults.pageSize ?? 25, 1),
    defaults.maxPageSize ?? 100,
  );

  return {
    page: normalizedPage,
    pageSize: normalizedPageSize,
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    page,
    pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}
