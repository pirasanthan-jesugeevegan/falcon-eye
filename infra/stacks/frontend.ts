import { Input } from '.sst/platform/src/components/input';

export function createFrontendStack(backendUrl: Input<string>) {
  const site = new sst.aws.StaticSite('FrontendSite', {
    path: '../apps/frontend',
    build: {
      command: 'pnpm run build',
      output: 'dist',
    },
    environment: {
      NODE_ENV: 'production',
      VITE_API_BASE_URL: backendUrl,
    },
  });

  return {
    url: site.url,
  };
}
