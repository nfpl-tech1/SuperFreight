"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationParams = parsePaginationParams;
exports.buildPaginationMeta = buildPaginationMeta;
function parsePaginationParams(page, pageSize, defaults = {}) {
    const normalizedPage = Math.max(page ?? defaults.page ?? 1, 1);
    const normalizedPageSize = Math.min(Math.max(pageSize ?? defaults.pageSize ?? 25, 1), defaults.maxPageSize ?? 100);
    return {
        page: normalizedPage,
        pageSize: normalizedPageSize,
    };
}
function buildPaginationMeta(total, page, pageSize) {
    return {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };
}
//# sourceMappingURL=pagination.helpers.js.map