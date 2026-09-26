import * as request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { ALLOWED_ORIGIN, createTestApp } from './helpers/create-test-app';
import { JiraConfig } from '../src/modules/jira/entities/jira-config.entity';
import { SonarCloudConfig } from '../src/modules/sonarcloud/entities/sonarcloud-config.entity';
import { GithubConfig } from '../src/modules/github/entities/github-config.entity';

const SECRET = 'ciphertext-that-must-never-leave-the-api';

describe('HTTP hardening (e2e)', () => {
  let app: INestApplication;
  let repo: Awaited<ReturnType<typeof createTestApp>>['repo'];

  beforeEach(async () => {
    ({ app, repo } = await createTestApp());
  });
  afterEach(() => app.close());

  it('serves a health check', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('sets security headers', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('allows CORS only for the configured origin', async () => {
    const allowed = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', ALLOWED_ORIGIN);
    expect(allowed.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);

    const other = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'https://evil.example');
    expect(other.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects unknown properties and missing required fields', async () => {
    const unknown = {
      productName: 'Web',
      icon: 'x',
      path: '/web',
      isActive: true,
      admin: true,
    };
    await request(app.getHttpServer())
      .post('/products')
      .send(unknown)
      .expect(400);
    await request(app.getHttpServer()).post('/products').send({}).expect(400);
  });

  describe('encrypted tokens never appear in a response', () => {
    it('jira configs', async () => {
      repo(JiraConfig).find.mockResolvedValue([
        Object.assign(new JiraConfig(), {
          id: 'c1',
          instanceName: 'acme',
          encryptedApiToken: SECRET,
        }),
      ]);
      const res = await request(app.getHttpServer())
        .get('/jira/config')
        .expect(200);
      expect(JSON.stringify(res.body)).not.toContain(SECRET);
      expect(res.body[0].instanceName).toBe('acme');
    });

    it('sonarcloud configs', async () => {
      repo(SonarCloudConfig).find.mockResolvedValue([
        Object.assign(new SonarCloudConfig(), {
          id: 'c1',
          instanceName: 'acme',
          encryptedApiToken: SECRET,
        }),
      ]);
      const res = await request(app.getHttpServer())
        .get('/sonarcloud/config')
        .expect(200);
      expect(JSON.stringify(res.body)).not.toContain(SECRET);
      expect(res.body[0].instanceName).toBe('acme');
    });

    it('github configs', async () => {
      repo(GithubConfig).find.mockResolvedValue([
        Object.assign(new GithubConfig(), {
          id: 'c1',
          owner: 'acme',
          repo: 'web',
          encryptedPat: SECRET,
        }),
      ]);
      const res = await request(app.getHttpServer())
        .get('/github/config')
        .expect(200);
      expect(JSON.stringify(res.body)).not.toContain(SECRET);
      expect(res.body[0].owner).toBe('acme');
    });
  });
});
