import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JiraConfig } from '../src/modules/jira/entities/jira-config.entity';
import { Product } from '../src/modules/products/entities/product.entity';
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

  beforeEach(async () => {
    ({ app, repo } = await createTestApp({ demoMode: true }));
  });
  afterEach(() => app.close());

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

  it('switches every integration route off', async () => {
    const server = () => request(app.getHttpServer());

    await server().get('/jira/config').expect(403);
    await server().get('/sonarcloud/config').expect(403);
    await server().get('/github/config').expect(403);
    await server().post(`/github/config/${ID}/trigger`).send({}).expect(403);
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
