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
export declare function parsePaginationParams(page?: number, pageSize?: number, defaults?: PaginationDefaults): PaginationParams;
export declare function buildPaginationMeta(total: number, page: number, pageSize: number): {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};
