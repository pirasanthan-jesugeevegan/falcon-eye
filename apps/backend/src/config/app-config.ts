export interface AppConfig {
  /** Browser origins allowed by CORS. */
  allowedOrigins: string[];
}

type Env = Record<string, string | undefined>;

const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

const splitList = (value?: string): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export function getAppConfig(env: Env): AppConfig {
  const isProduction = env.NODE_ENV === 'production';
  const allowedOrigins = splitList(env.ALLOWED_ORIGINS);

  return {
    // Local development gets the Vite/Nest defaults; production must be explicit.
    allowedOrigins:
      allowedOrigins.length > 0 || isProduction ? allowedOrigins : DEV_ORIGINS,
  };
}

/**
 * Refuses to boot a production deployment with unsafe settings. Returns
 * warnings for the caller to log.
 */
export function assertSafeForProduction(config: AppConfig, env: Env): string[] {
  if (env.NODE_ENV !== 'production') return [];

  if (
    config.allowedOrigins.length === 0 ||
    config.allowedOrigins.includes('*')
  ) {
    throw new Error(
      'ALLOWED_ORIGINS must list the frontend origin(s) explicitly in production; "*" is not allowed.',
    );
  }

  return [
    'This API has no authentication. Keep it behind an IP allow-list, VPN or SSO proxy; never expose it to the public internet.',
  ];
}
