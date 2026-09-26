import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import axios from 'axios';
import { encrypt } from '../../crypto.util';
import { SonarCloudService } from './sonarcloud.service';
import { CreateSonarCloudQueryDto } from './dto/create-sonarcloud-query.dto';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const CONFIG_ID = '11111111-1111-4111-8111-111111111111';

describe('SonarCloudService', () => {
  const originalKey = process.env.ENCRYPTION_KEY;
  let service: SonarCloudService;
  let queryRepo: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  let configRepo: { findOne: jest.Mock };

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
  });
  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalKey;
  });

  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.get.mockResolvedValue({ status: 200, data: { ok: true } });
    queryRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'q1',
        name: 'Web',
        project: 'org_web',
        metric: ['project_status'],
        sonarCloudConfigId: CONFIG_ID,
      }),
      save: jest.fn(async (q) => q),
      create: jest.fn((q) => q),
    };
    configRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: CONFIG_ID,
        baseUrl: 'https://sonarcloud.io',
        encryptedApiToken: encrypt('token'),
      }),
    };
    service = new SonarCloudService(configRepo as any, queryRepo as any, {
      demoMode: false,
      allowedOrigins: [],
    });
  });

  describe('updateSonarCloudQuery', () => {
    it('re-verifies the stored metrics when only the project changes', async () => {
      await service.updateSonarCloudQuery('q1', { project: 'org_other' });

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get.mock.calls[0][0]).toContain(
        'api/qualitygates/project_status?projectKey=org_other',
      );
      expect(queryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ project: 'org_other' }),
      );
    });
  });

  describe('CreateSonarCloudQueryDto', () => {
    it('rejects a query with no metric', async () => {
      const dto = plainToInstance(CreateSonarCloudQueryDto, {
        name: 'Web',
        project: 'org_web',
        sonarCloudConfigId: CONFIG_ID,
      });

      const errors = await validate(dto);

      expect(errors.map((e) => e.property)).toContain('metric');
    });
  });
});
