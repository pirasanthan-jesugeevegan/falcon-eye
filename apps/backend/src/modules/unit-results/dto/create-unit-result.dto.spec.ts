import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUnitResultDto } from './create-unit-result.dto';

const valid = {
  productName: 'Web',
  date: '2026-01-01T00:00:00Z',
  percentage: 80,
  commit: 'abc123',
  pullRequest: '42',
  statementCoverage: 80,
  functionCoverage: 75,
  branchCoverage: 70,
  lineCoverage: 82,
  author: 'dev',
};

const invalidProps = async (overrides: Record<string, unknown>) =>
  (
    await validate(
      plainToInstance(CreateUnitResultDto, { ...valid, ...overrides }),
    )
  ).map((e) => e.property);

describe('CreateUnitResultDto', () => {
  it('accepts a well-formed payload', async () => {
    expect(await invalidProps({})).toEqual([]);
  });

  it.each([
    'percentage',
    'statementCoverage',
    'functionCoverage',
    'branchCoverage',
    'lineCoverage',
  ])('rejects %s outside 0-100', async (field) => {
    expect(await invalidProps({ [field]: -1 })).toContain(field);
    expect(await invalidProps({ [field]: 101 })).toContain(field);
  });
});
