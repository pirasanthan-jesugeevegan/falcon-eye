import axios from 'axios';
import { encrypt } from '../../crypto.util';
import { JiraService } from './jira.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const issues = (n: number, from = 0) =>
  Array.from({ length: n }, (_, i) => ({ id: String(from + i) }));

describe('JiraService.executeQuery', () => {
  const originalKey = process.env.ENCRYPTION_KEY;
  let service: JiraService;

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
  });
  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalKey;
  });

  beforeEach(() => {
    mockedAxios.get.mockReset();
    const queryRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'q1',
        jqlQuery: 'project = X',
        jiraConfigId: 'c1',
      }),
    };
    const configRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'c1',
        baseUrl: 'https://acme.atlassian.net/',
        email: 'qa@acme.test',
        encryptedApiToken: encrypt('token'),
      }),
    };
    service = new JiraService(configRepo as any, queryRepo as any);
  });

  it('follows nextPageToken until the last page', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: { issues: issues(100), nextPageToken: 'p2', isLast: false },
      })
      .mockResolvedValueOnce({
        data: { issues: issues(50, 100), isLast: true },
      });

    const result = await service.executeQuery('q1');

    expect(result.issues).toHaveLength(150);
    expect(result.truncated).toBe(false);
    expect(mockedAxios.get.mock.calls[1][1]?.params).toMatchObject({
      nextPageToken: 'p2',
    });
  });

  it('stops at 500 issues and reports the result as truncated', async () => {
    mockedAxios.get.mockImplementation(async () => ({
      data: { issues: issues(100), nextPageToken: 'more', isLast: false },
    }));

    const result = await service.executeQuery('q1');

    expect(result.issues).toHaveLength(500);
    expect(result.truncated).toBe(true);
    expect(mockedAxios.get).toHaveBeenCalledTimes(5);
  });
});
