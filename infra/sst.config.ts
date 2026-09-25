/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path=".sst/platform/config.d.ts" />

// Public demo deployment (the `demo` branch): Lambda + S3/CloudFront on AWS,
// Postgres on Neon. No VPC/RDS/NAT, so it stays in free tiers. One CloudFront
// distribution serves the site at / and the API at /api, so the browser sees a
// single origin (no CORS, and no frontend<->API URL cycle).
export default $config({
  app(_input) {
    return {
      name: process.env.SST_APP_NAME || 'falcon-eye',
      region: 'eu-west-2',
      home: 'aws',
    };
  },
  async run() {
    const { createBackendStack } = await import('./stacks/backend');
    const { createFrontendStack } = await import('./stacks/frontend');

    const router = new sst.aws.Router('Web');
    createBackendStack(router);
    const { url } = createFrontendStack(router);

    return { url };
  },
});
