import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateE2EResultDto } from './create-e2e-result.dto';

const valid = {
  productName: 'Web',
  timestamp: '2026-01-01T00:00:00Z',
  pass: 10,
  fail: 0,
  skip: 1,
  reportUrl: 'https://ci.example.com/report/1',
  environment: 'staging',
  duration: '60000',
  tag: 'smoke',
};

const invalidProps = async (overrides: Record<string, unknown>) =>
  (
    await validate(
      plainToInstance(CreateE2EResultDto, { ...valid, ...overrides }),
    )
  ).map((e) => e.property);

describe('CreateE2EResultDto', () => {
  it('accepts a well-formed payload', async () => {
    expect(await invalidProps({})).toEqual([]);
  });

  it.each(['pass', 'fail', 'skip'])(
    'rejects a negative %s count',
    async (field) => {
      expect(await invalidProps({ [field]: -1 })).toContain(field);
    },
  );

  it('rejects a reportUrl that is not a URL', async () => {
    expect(await invalidProps({ reportUrl: 'not a url' })).toContain(
      'reportUrl',
    );
  });
});
