import { catalogSearchQueryString, parseCatalogSearchParams } from './catalog-search';

describe('catalog search URL helpers', () => {
  it('parses applied filters from the query string', () => {
    const params = new URLSearchParams(
      'q=clean&author=Martin&isbn=978-1&availableOnly=true&page=2',
    );
    expect(parseCatalogSearchParams(params)).toEqual({
      q: 'clean',
      author: 'Martin',
      isbn: '9781',
      availableOnly: true,
      page: 2,
    });
  });

  it('omits empty defaults from the query string', () => {
    expect(
      catalogSearchQueryString({
        q: '',
        author: '',
        isbn: '',
        availableOnly: false,
        page: 1,
      }),
    ).toBe('');
  });

  it('round-trips applied filters', () => {
    const applied = {
      q: 'clean',
      author: '',
      isbn: '',
      availableOnly: true,
      page: 2,
    };
    const parsed = parseCatalogSearchParams(new URLSearchParams(catalogSearchQueryString(applied)));
    expect(parsed).toEqual(applied);
  });
});
