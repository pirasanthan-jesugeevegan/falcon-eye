/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path=".sst/platform/config.d.ts" />

export default $config({
  // Your app's config
  app(_input) {
    return {
      name: 'pj-falcon-eye-stack',
      region: 'eu-west-2',
      home: 'aws',
    };
  },
  // Your app's resources
  async run() {
    const { createDatabaseStack } = await import('./stacks/database');
    const { createBackendStack } = await import('./stacks/backend');
    const { createFrontendStack } = await import('./stacks/frontend');

    const { db, vpc } = createDatabaseStack();
    const { url: backendUrl } = createBackendStack(db, vpc);
    const { url: frontendUrl } = createFrontendStack(backendUrl);

    // Your app's outputs
    return {
      frontendUrl,
      backendUrl,
    };
  },
});
