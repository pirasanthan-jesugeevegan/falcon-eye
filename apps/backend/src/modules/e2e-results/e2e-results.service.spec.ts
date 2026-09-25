import { NotFoundException } from '@nestjs/common';
import { E2EResultsService } from './e2e-results.service';
import type { CreateE2EResultDto } from './dto/create-e2e-result.dto';

const payload = (
  overrides: Partial<CreateE2EResultDto> = {},
): CreateE2EResultDto => ({
  productName: 'Checkout Web',
  timestamp: new Date('2026-09-22T06:14:00Z'),
  pass: 118,
  fail: 0,
  skip: 2,
  reportUrl: 'https://reports.example.com/checkout-web/4812',
  environment: 'staging',
  duration: '6m 42s',
  tag: '@regression',
  ...overrides,
});

describe('E2EResultsService', () => {
  const product = { id: 'p1', productName: 'Checkout Web' };
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
  };
  let products: { findByName: jest.Mock };
  let service: E2EResultsService;

  beforeEach(() => {
    repository = {
      create: jest.fn((entity) => entity),
      save: jest.fn(async (entity) => ({ id: 'r1', ...entity })),
      find: jest.fn(async () => []),
      findOne: jest.fn(),
    };
    products = { findByName: jest.fn(async () => product) };
    service = new E2EResultsService(repository as never, products as never);
  });

  describe('create', () => {
    it('marks a run as passed when nothing failed', async () => {
      const saved = await service.create(payload({ fail: 0 }));
      expect(saved.status).toBe('passed');
    });

    it('marks a run as failed as soon as one test failed', async () => {
      const saved = await service.create(payload({ fail: 1 }));
      expect(saved.status).toBe('failed');
    });

    it('attaches the resolved product to the stored result', async () => {
      await service.create(payload());
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ product }),
      );
    });

    it('rejects a result for a product that does not exist, without saving', async () => {
      products.findByName.mockResolvedValue(null);
      await expect(
        service.create(payload({ productName: 'Unknown' })),
      ).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('reads', () => {
    it('lists newest first', async () => {
      await service.findAll();
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ order: { timestamp: 'DESC' } }),
      );
    });

    it('filters by product name', async () => {
      await service.findByProductName('Checkout Web');
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { product: { productName: 'Checkout Web' } },
        }),
      );
    });

    it('reports a missing result as 404', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
