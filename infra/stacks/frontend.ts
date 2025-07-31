export function createFrontendStack() {
  const site = new sst.aws.StaticSite('FrontendSite', {
    path: '../apps/frontend',
    build: {
      command: 'pnpm run build',
      output: 'dist',
    },
    environment: {
      NODE_ENV: 'production',
    },
  });

  return {
    url: site.url,
  };
}
