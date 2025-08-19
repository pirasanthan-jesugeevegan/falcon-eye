// UI and responsive design constants
export const MOBILE_BREAKPOINT = 768;

// Cache/Stale time constants (in milliseconds)
export const CACHE_TIMES = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
} as const;

// Default values
export const DEFAULT_VALUES = {
  PORT: 3000,
  API_PREFIX: 'api',
  DATABASE_PORT: 5432,
} as const;
