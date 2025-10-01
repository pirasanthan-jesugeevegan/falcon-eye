import type { UnitTestResult } from '../types';

export function calculateAverageTestCoverage(allUnitResults: UnitTestResult[]) {
  if (!allUnitResults || allUnitResults.length === 0) return 0;

  let totalCoverage = 0;
  let coverageCount = 0;

  allUnitResults.forEach(unitResult => {
    if (unitResult.result && unitResult.result.length > 0) {
      const latestResult = unitResult.result[0]; // Get the latest result
      const coverage = parseFloat(latestResult.percentage);
      if (!isNaN(coverage)) {
        totalCoverage += coverage;
        coverageCount++;
      }
    }
  });

  return coverageCount > 0 ? totalCoverage / coverageCount : 0;
}
