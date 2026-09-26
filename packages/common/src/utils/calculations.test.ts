import { describe, expect, it } from 'vitest';
import {
  calculateAverageTestCoverage,
  summariseLatestE2E,
} from './calculations';
import type { E2ETestResult, UnitCoverageRow } from '../types';

const unit = (
  productId: string,
  date: string,
  percentage: string,
): UnitCoverageRow => ({
  id: `${productId}-${date}`,
  date,
  percentage,
  product: { id: productId, productName: productId },
});

const e2e = (
  productId: string,
  timestamp: string,
  status: E2ETestResult['status'],
): E2ETestResult => ({
  id: `${productId}-${timestamp}`,
  timestamp,
  status,
  pass: 0,
  fail: status === 'failed' ? 1 : 0,
  skip: 0,
  duration: '1',
  reportUrl: 'https://ci.test/r',
  tag: 'smoke',
  environment: 'staging',
  product: { id: productId, productName: productId },
});

describe('calculateAverageTestCoverage', () => {
  it('returns 0 for no rows', () => {
    expect(calculateAverageTestCoverage([])).toBe(0);
  });

  it("averages each product's latest row, not every commit", () => {
    const rows = [
      unit('p1', '2026-01-01', '50'),
      unit('p1', '2026-02-01', '80'),
      unit('p2', '2026-01-15', '60'),
    ];
    expect(calculateAverageTestCoverage(rows)).toBe(70);
  });
});

describe('summariseLatestE2E', () => {
  it('returns zeros for no rows', () => {
    expect(summariseLatestE2E([])).toEqual({ failing: 0, total: 0 });
  });

  it('judges each product by its most recent run only', () => {
    const rows = [
      // p1 failed long ago but is green now
      e2e('p1', '2026-01-01T00:00:00Z', 'failed'),
      e2e('p1', '2026-02-01T00:00:00Z', 'passed'),
      // p2 passed before but is red now
      e2e('p2', '2026-01-01T00:00:00Z', 'passed'),
      e2e('p2', '2026-02-01T00:00:00Z', 'failed'),
      // p3 has only a green run
      e2e('p3', '2026-01-10T00:00:00Z', 'passed'),
    ];
    expect(summariseLatestE2E(rows)).toEqual({ failing: 1, total: 3 });
  });
});
