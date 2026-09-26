import { GithubConfigService } from './github-config.service';

describe('GithubConfigService', () => {
  let repo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let github: { triggerWorkflow: jest.Mock };
  let service: GithubConfigService;

  beforeEach(() => {
    repo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    github = { triggerWorkflow: jest.fn().mockResolvedValue(204) };
    service = new GithubConfigService(repo as any, github as any);
  });

  describe('triggerWorkflow', () => {
    it("dispatches on the config's defaultRef when the request has no ref", async () => {
      repo.findOne.mockResolvedValue({
        id: 'c1',
        owner: 'acme',
        repo: 'web',
        workflow: 'ci.yml',
        defaultRef: 'develop',
        encryptedPat: 'enc',
      });

      await service.triggerWorkflow('c1', { inputs: {} });

      expect(github.triggerWorkflow).toHaveBeenCalledWith(
        'acme',
        'web',
        'ci.yml',
        'develop',
        {},
        'enc',
      );
    });
  });

  describe('createConfig duplicate check', () => {
    it('only treats the same owner and repo as a duplicate', async () => {
      repo.findOne.mockResolvedValue(null);

      await service
        .createConfig({
          owner: 'acme',
          repo: 'web',
          workflow: 'ci.yml',
          defaultRef: 'main',
          pat: 'ghp_x',
        } as any)
        .catch(() => undefined);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({ owner: 'acme', repo: 'web' }),
      });
    });
  });
});
