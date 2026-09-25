export function createFrontendStack(router: sst.aws.Router) {
  const site = new sst.aws.StaticSite('FrontendSite', {
    path: '../apps/frontend',
    build: {
      command: 'pnpm run build',
      output: 'dist',
    },
    router: { instance: router },
    // Client-side routing: deep links and refreshes fall back to index.html.
    errorPage: 'redirect_to_index_page',
    environment: {
      NODE_ENV: 'production',
      // Same origin: the router forwards /api to the Lambda.
      VITE_API_BASE_URL: '/api',
    },
  });

  return { url: router.url, site };
}
