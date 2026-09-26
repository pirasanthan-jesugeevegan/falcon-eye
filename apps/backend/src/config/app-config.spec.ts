import { assertSafeForProduction, getAppConfig } from './app-config';

describe('getAppConfig', () => {
  it('reads the allowed origins, trimming blanks', () => {
    const config = getAppConfig({
      ALLOWED_ORIGINS: ' https://falcon-eye.example , ',
    });

    expect(config.allowedOrigins).toEqual(['https://falcon-eye.example']);
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
  const production = { NODE_ENV: 'production' };

  it('does nothing outside production', () => {
    expect(
      assertSafeForProduction(
        { allowedOrigins: ['*'] },
        { NODE_ENV: 'development' },
      ),
    ).toEqual([]);
  });

  it('refuses a production deployment with no allowed origins', () => {
    expect(() =>
      assertSafeForProduction({ allowedOrigins: [] }, production),
    ).toThrow(/ALLOWED_ORIGINS/);
  });

  it('refuses a wildcard origin in production', () => {
    expect(() =>
      assertSafeForProduction({ allowedOrigins: ['*'] }, production),
    ).toThrow(/ALLOWED_ORIGINS/);
  });

  it('warns that the API has no authentication until login exists', () => {
    const warnings = assertSafeForProduction(
      { allowedOrigins: ['https://falcon-eye.example'] },
      production,
    );

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/no authentication/i);
  });
});
