import type { UnitTestResult } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dateFormat(date: string | Date) {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getRatingInfo(rating: string) {
  const ratingNum = parseInt(rating);
  switch (ratingNum) {
    case 1:
      return { text: 'A', color: 'bg-green-500' };
    case 2:
      return { text: 'B', color: 'bg-yellow-500' };
    case 3:
      return { text: 'C', color: 'bg-orange-500' };
    case 4:
      return { text: 'D', color: 'bg-red-400' };
    case 5:
      return { text: 'E', color: 'bg-red-600' };
    default:
      return { text: '?', color: 'bg-gray-500' };
  }
}

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
