import { describe, expect, it } from 'vitest';
import { runActiveQueries } from './queries';

const q = (name: string, isActive?: boolean) => ({ name, isActive });

describe('runActiveQueries', () => {
  it('runs only active queries; a missing isActive counts as active', async () => {
    const ran: string[] = [];
    const { results } = await runActiveQueries(
      [q('a', true), q('b', false), q('c')],
      async query => {
        ran.push(query.name);
        return query.name.toUpperCase();
      },
    );

    expect(ran.sort()).toEqual(['a', 'c']);
    expect(results.map(r => r.value).sort()).toEqual(['A', 'C']);
  });

  it('keeps the results that succeed and names the queries that failed', async () => {
    const { results, failed } = await runActiveQueries(
      [q('good'), q('bad')],
      async query => {
        if (query.name === 'bad') throw new Error('Jira returned 404');
        return 1;
      },
    );

    expect(results.map(r => r.query.name)).toEqual(['good']);
    expect(failed).toEqual([{ name: 'bad', message: 'Jira returned 404' }]);
  });

  it('returns nothing for no queries', async () => {
    expect(await runActiveQueries([], async () => 1)).toEqual({
      results: [],
      failed: [],
    });
  });
});
