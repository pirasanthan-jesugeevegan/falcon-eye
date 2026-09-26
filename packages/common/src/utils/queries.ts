export interface FailedQuery {
  name: string;
  message: string;
}

/**
 * Run `run` for every active saved query (isActive missing counts as active),
 * concurrently. A query that throws is reported in `failed` instead of
 * rejecting the whole batch, so one broken integration cannot blank a page.
 */
export async function runActiveQueries<
  Q extends { name: string; isActive?: boolean },
  R,
>(
  queries: Q[],
  run: (query: Q) => Promise<R>,
): Promise<{ results: { query: Q; value: R }[]; failed: FailedQuery[] }> {
  const active = queries.filter(query => query.isActive !== false);
  const settled = await Promise.allSettled(active.map(run));

  const results: { query: Q; value: R }[] = [];
  const failed: FailedQuery[] = [];
  settled.forEach((outcome, i) => {
    if (outcome.status === 'fulfilled') {
      results.push({ query: active[i], value: outcome.value });
    } else {
      const reason = outcome.reason;
      failed.push({
        name: active[i].name,
        message: reason instanceof Error ? reason.message : String(reason),
      });
    }
  });
  return { results, failed };
}
