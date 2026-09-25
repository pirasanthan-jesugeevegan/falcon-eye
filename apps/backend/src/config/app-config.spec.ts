import { assertSafeForProduction, getAppConfig } from './app-config';

describe('getAppConfig', () => {
  it('reads the demo flag and origins, trimming blanks', () => {
    const config = getAppConfig({
      DEMO_MODE: ' TRUE ',
      ALLOWED_ORIGINS: ' https://falcon-eye.example , ',
    });

    expect(config.demoMode).toBe(true);
    expect(config.allowedOrigins).toEqual(['https://falcon-eye.example']);
  });

  it('is not a demo unless DEMO_MODE is exactly true', () => {
    expect(getAppConfig({}).demoMode).toBe(false);
    expect(getAppConfig({ DEMO_MODE: 'yes' }).demoMode).toBe(false);
    expect(getAppConfig({ DEMO_MODE: '1' }).demoMode).toBe(false);
  });

  it('falls back to the local dev origins outside production only', () => {
    expect(getAppConfig({ NODE_ENV: 'development' }).allowedOrigins).toEqual([
      'http://localhost:5173',
      'http://localhost:3000',
    ]);
    expect(getAppConfig({ NODE_ENV: 'production' }).allowedOrigins).toEqual([]);
  });
});

describe('assertSafeForProduction', () => {
  const origins = ['https://falcon-eye.example'];

  it('accepts a public demo with no warnings', () => {
    const env = { NODE_ENV: 'production', DEMO_MODE: 'true' };
    const config = { demoMode: true, allowedOrigins: origins };
    expect(assertSafeForProduction(config, env)).toEqual([]);
  });

  it('accepts a private deployment but warns that it has no authentication', () => {
    const env = { NODE_ENV: 'production', DEMO_MODE: 'false' };
    const config = { demoMode: false, allowedOrigins: origins };

    const warnings = assertSafeForProduction(config, env);

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/no authentication/);
    expect(warnings[0]).toMatch(/allow-list, VPN or SSO proxy/);
  });

  it('refuses to start when DEMO_MODE has not been decided', () => {
    const config = { demoMode: false, allowedOrigins: origins };
    for (const DEMO_MODE of [undefined, '', 'yes', '1']) {
      expect(() =>
        assertSafeForProduction(config, { NODE_ENV: 'production', DEMO_MODE }),
      ).toThrow(/DEMO_MODE must be set/);
    }
  });

  it('refuses a wildcard or empty origin list', () => {
    const env = { NODE_ENV: 'production', DEMO_MODE: 'true' };
    expect(() =>
      assertSafeForProduction({ demoMode: true, allowedOrigins: ['*'] }, env),
    ).toThrow(/ALLOWED_ORIGINS/);
    expect(() =>
      assertSafeForProduction({ demoMode: true, allowedOrigins: [] }, env),
    ).toThrow(/ALLOWED_ORIGINS/);
  });

  it('does not block local development', () => {
    expect(
      assertSafeForProduction(
        { demoMode: false, allowedOrigins: [] },
        { NODE_ENV: 'development' },
      ),
    ).toEqual([]);
  });
});
