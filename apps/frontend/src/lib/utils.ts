import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Re-export shared utilities from common package
export {
  dateFormat,
  getRatingInfo,
  calculateAverageTestCoverage,
  summariseLatestE2E,
} from '@falcon-eye/common';

// UI-specific utility (stays in frontend)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
