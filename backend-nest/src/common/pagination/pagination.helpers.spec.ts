import {
  buildPaginationMeta,
  parsePaginationParams,
} from './pagination.helpers';

describe('pagination.helpers', () => {
  it('normalizes page and pageSize within configured bounds', () => {
    expect(
      parsePaginationParams(0, 999, { pageSize: 20, maxPageSize: 100 }),
    ).toEqual({
      page: 1,
      pageSize: 100,
    });
  });

  it('falls back to defaults when values are omitted', () => {
    expect(parsePaginationParams(undefined, undefined, { pageSize: 20 })).toEqual(
      {
        page: 1,
        pageSize: 20,
      },
    );
  });

  it('builds pagination metadata including zero-total handling', () => {
    expect(buildPaginationMeta(0, 1, 25)).toEqual({
      page: 1,
      pageSize: 25,
      total: 0,
      totalPages: 0,
    });
    expect(buildPaginationMeta(51, 2, 25)).toEqual({
      page: 2,
      pageSize: 25,
      total: 51,
      totalPages: 3,
    });
  });
});
