import { buildQueryParams } from './query-params';

describe('buildQueryParams', () => {
  it('returns undefined for missing input', () => {
    expect(buildQueryParams(undefined)).toBeUndefined();
  });

  it('drops empty, null, and undefined values', () => {
    expect(
      buildQueryParams({
        q: 'dune',
        page: 1,
        available: true,
        empty: '',
        missing: undefined,
        gone: null,
      }),
    ).toEqual({ q: 'dune', page: 1, available: true });
  });

  it('returns undefined when every value is dropped', () => {
    expect(buildQueryParams({ q: '', missing: undefined, gone: null })).toBeUndefined();
  });
});
