// HTTP Status codes commonly used
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API timeout constants (in milliseconds)
export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  JIRA: 30000, // 30 seconds
  GITHUB: 30000, // 30 seconds
  SONARCLOUD: 30000, // 30 seconds
} as const;

// Environment constants
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];
