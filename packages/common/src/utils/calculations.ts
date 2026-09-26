import type { UnitCoverageRow } from '../types';

/**
 * Average of each product's most recent unit coverage. `/unit-results` returns
 * one row per commit, so pick the latest row per product before averaging.
 */
export function calculateAverageTestCoverage(rows: UnitCoverageRow[]) {
  if (!rows || rows.length === 0) return 0;

  const latestByProduct = new Map<string, UnitCoverageRow>();
  for (const row of rows) {
    const key = row.product?.id ?? row.id;
    const current = latestByProduct.get(key);
    if (!current || new Date(row.date) > new Date(current.date)) {
      latestByProduct.set(key, row);
    }
  }

  let total = 0;
  let count = 0;
  for (const row of latestByProduct.values()) {
    const coverage = parseFloat(row.percentage);
    if (!isNaN(coverage)) {
      total += coverage;
      count++;
    }
  }

  return count > 0 ? total / count : 0;
}
