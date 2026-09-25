export interface AppConfig {
  /** Public read-only demo: every write and every integration route is refused. */
  demoMode: boolean;
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
    demoMode: env.DEMO_MODE?.trim().toLowerCase() === 'true',
    // Local development gets the Vite/Nest defaults; production must be explicit.
    allowedOrigins:
      allowedOrigins.length > 0 || isProduction ? allowedOrigins : DEV_ORIGINS,
  };
}

/**
 * Refuses to boot a production deployment that has not decided how it is
 * protected. Returns warnings for the caller to log.
 */
export function assertSafeForProduction(config: AppConfig, env: Env): string[] {
  if (env.NODE_ENV !== 'production') return [];

  const demoSetting = env.DEMO_MODE?.trim().toLowerCase();
  if (demoSetting !== 'true' && demoSetting !== 'false') {
    throw new Error(
      'DEMO_MODE must be set to "true" or "false" in production. Public deployments need true; ' +
        'false is only for deployments behind an IP allow-list, VPN or SSO proxy.',
    );
  }
  if (
    config.allowedOrigins.length === 0 ||
    config.allowedOrigins.includes('*')
  ) {
    throw new Error(
      'ALLOWED_ORIGINS must list the frontend origin(s) explicitly in production; "*" is not allowed.',
    );
  }

  return config.demoMode
    ? []
    : [
        'DEMO_MODE=false: this API has no authentication. Keep it behind an IP allow-list, VPN or SSO proxy; never expose it to the public internet.',
      ];
}
