import { INestApplication } from '@nestjs/common';
import axios from 'axios';
import { randomBytes } from 'crypto';
import * as request from 'supertest';
import { encrypt } from '../src/crypto.util';
import { GithubConfig } from '../src/modules/github/entities/github-config.entity';
import { JiraConfig } from '../src/modules/jira/entities/jira-config.entity';
import { JiraQuery } from '../src/modules/jira/entities/jira-query.entity';
import { Product } from '../src/modules/products/entities/product.entity';
import { SonarCloudQuery } from '../src/modules/sonarcloud/entities/sonarcloud-query.entity';
import { ALLOWED_ORIGIN, createTestApp } from './helpers/create-test-app';

const product = {
  productName: 'Checkout Web',
  icon: 'https://cdn.northwind.example/checkout.svg',
  path: '/checkout',
  isActive: true,
};
const ID = '3f1d5c1e-8c1b-4f7e-9a53-2d0a8f1b7c11';

type TestApp = Awaited<ReturnType<typeof createTestApp>>;

describe('Public demo mode (e2e)', () => {
  let app: INestApplication;
  let repo: TestApp['repo'];
  // Any HTTP call the server makes to Jira, SonarCloud or GitHub lands here.
  let outbound: jest.Mock;

  beforeEach(async () => {
    outbound = jest.fn(async () => {
      throw new Error('demo mode must not make outbound calls');
    });
    jest.spyOn(axios, 'get').mockImplementation(outbound);
    // GithubService builds its own client with axios.create() at start-up.
    jest
      .spyOn(axios, 'create')
      .mockReturnValue({ get: outbound, post: outbound } as never);
    ({ app, repo } = await createTestApp({ demoMode: true }));
  });
  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  it('reports that it is a demo', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200, { status: 'ok', demoMode: true });
  });

  it('serves dashboard reads to anyone', async () => {
    for (const path of [
      '/products',
      '/e2e-results',
      '/unit-results',
      '/infrastructure',
    ]) {
      await request(app.getHttpServer()).get(path).expect(200);
    }
  });

  it('refuses every write and never touches the database', async () => {
    const server = () => request(app.getHttpServer());

    await server().post('/products').send(product).expect(403);
    await server()
      .patch(`/products/${ID}`)
      .send({ isActive: false })
      .expect(403);
    await server().delete(`/products/${ID}`).expect(403);
    await server().post('/e2e-results').send({}).expect(403);

    expect(repo(Product).save).not.toHaveBeenCalled();
    expect(repo(Product).delete).not.toHaveBeenCalled();
  });

  it('lists the integration configs and queries', async () => {
    const server = () => request(app.getHttpServer());

    await server().get('/jira/config').expect(200);
    await server().get('/jira/query').expect(200);
    await server().get('/sonarcloud/config').expect(200);
    await server().get('/sonarcloud/query').expect(200);
    await server().get('/github/config').expect(200);
  });

  it('refuses every integration write', async () => {
    const server = () => request(app.getHttpServer());

    await server().post('/jira/query').send({}).expect(403);
    await server().delete(`/sonarcloud/config/${ID}`).expect(403);
    await server().post(`/github/config/${ID}/trigger`).send({}).expect(403);
  });

  it('answers Jira queries from sample data, never from Jira', async () => {
    repo(JiraQuery).findOne.mockResolvedValue({
      id: ID,
      name: 'Open bugs',
      jiraConfigId: ID,
    });

    const response = await request(app.getHttpServer())
      .get(`/jira/query/${ID}/execute`)
      .expect(200);

    expect(response.body.issues.length).toBeGreaterThan(0);
    expect(response.body.issues[0].fields.priority.name).toBeTruthy();
    expect(outbound).not.toHaveBeenCalled();
  });

  it('answers SonarCloud queries from sample data, never from SonarCloud', async () => {
    repo(SonarCloudQuery).findOne.mockResolvedValue({
      id: ID,
      name: 'Payments API',
      project: 'northwind_payments-api',
      metric: ['project_status', 'pull_request'],
      sonarCloudConfigId: ID,
    });

    const response = await request(app.getHttpServer())
      .get(`/sonarcloud/query/${ID}/execute`)
      .expect(200);

    expect(response.body.project_status.projectStatus.status).toBe('ERROR');
    expect(response.body.pull_request.pullRequests.length).toBeGreaterThan(0);
    expect(outbound).not.toHaveBeenCalled();
  });

  it('answers GitHub workflow runs from sample data, never from GitHub', async () => {
    repo(GithubConfig).findOne.mockResolvedValue({
      id: ID,
      owner: 'northwind',
      repo: 'storefront-web',
      workflow: 'e2e-nightly.yml',
      encryptedPat: 'not-decryptable',
      isActive: true,
    });
    const server = () => request(app.getHttpServer());

    const list = await server().get(`/github/config/${ID}/runs`).expect(200);
    expect(list.body.runs).toHaveLength(10);

    const runId = list.body.runs[0].id;
    const one = await server()
      .get(`/github/config/${ID}/runs/${runId}`)
      .expect(200);
    expect(one.body.run.id).toBe(runId);
    expect(outbound).not.toHaveBeenCalled();
  });

  it('cannot be used to make the server call a caller-supplied URL', async () => {
    // POST /jira/config verifies credentials by calling `${baseUrl}/rest/api/3/myself`.
    await request(app.getHttpServer())
      .post('/jira/config')
      .send({
        instanceName: 'x',
        baseUrl: 'http://169.254.169.254',
        email: 'a@b.co',
        apiToken: 'x',
      })
      .expect(403);
  });
});

describe('Private deployment (e2e)', () => {
  let app: INestApplication;
  let repo: TestApp['repo'];

  beforeEach(async () => {
    ({ app, repo } = await createTestApp({ demoMode: false }));
  });
  afterEach(() => app.close());

  it('allows writes, because protection there is the network perimeter', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send(product)
      .expect(201);
    expect(repo(Product).save).toHaveBeenCalledTimes(1);
  });

  it('still asks the real Jira for issues, not the sample data', async () => {
    process.env.ENCRYPTION_KEY = randomBytes(32).toString('base64');
    const get = jest
      .spyOn(axios, 'get')
      .mockResolvedValue({ status: 200, data: { issues: [] } });
    repo(JiraQuery).findOne.mockResolvedValue({
      id: ID,
      name: 'Open bugs',
      jqlQuery: 'project = NW',
      jiraConfigId: ID,
    });
    repo(JiraConfig).findOne.mockResolvedValue({
      id: ID,
      baseUrl: 'https://northwind.atlassian.net',
      email: 'qa-bot@northwind.example',
      encryptedApiToken: encrypt('real-token'),
    });

    await request(app.getHttpServer())
      .get(`/jira/query/${ID}/execute`)
      .expect(200);

    expect(get).toHaveBeenCalledTimes(1);
    get.mockRestore();
  });

  it('reports that it is not a demo', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200, { status: 'ok', demoMode: false });
  });

  it('never returns an encrypted integration token', async () => {
    const stored = Object.assign(new JiraConfig(), {
      id: ID,
      instanceName: 'northwind',
      baseUrl: 'https://northwind.atlassian.net',
      email: 'qa-bot@northwind.example',
      encryptedApiToken: 'ciphertext-that-must-not-leak',
      projectKey: 'CHK',
      isActive: true,
    });
    repo(JiraConfig).find.mockResolvedValue([stored]);

    const response = await request(app.getHttpServer())
      .get('/jira/config')
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].instanceName).toBe('northwind');
    expect(response.body[0]).not.toHaveProperty('encryptedApiToken');
    expect(JSON.stringify(response.body)).not.toContain(
      'ciphertext-that-must-not-leak',
    );
  });
});

describe('HTTP hardening (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    ({ app } = await createTestApp({ demoMode: false }));
  });
  afterEach(() => app.close());

  it('answers CORS only for the configured frontend origin', async () => {
    const allowed = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', ALLOWED_ORIGIN);
    expect(allowed.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);

    const other = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'https://evil.example');
    expect(other.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('sends security headers', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('rejects an ingest payload with required fields missing', async () => {
    // The Lambda handler used to allow this (skipMissingProperties: true).
    await request(app.getHttpServer())
      .post('/e2e-results')
      .send({ productName: 'Checkout Web' })
      .expect(400);
  });

  it('rejects unknown properties instead of silently storing them', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({ ...product, isAdmin: true })
      .expect(400);
  });

  it('starts answering 429 once a client goes over the rate limit', async () => {
    await app.listen(0);
    const url = await app.getUrl();

    const statuses = await Promise.all(
      Array.from(
        { length: 125 },
        async () => (await request(url).get('/health')).status,
      ),
    );

    expect(statuses.filter((status) => status === 429).length).toBeGreaterThan(
      0,
    );
    expect(
      statuses.filter((status) => status === 200).length,
    ).toBeLessThanOrEqual(120);
  }, 30_000);
});
