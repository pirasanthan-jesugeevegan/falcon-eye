# Deployment (`demo` branch)

`master` is the template and creates no cloud resources. This branch is the public,
read-only demo (`DEMO_MODE=true`, see `adr/0001-public-demo-mode.md`).

Stack: Lambda + S3/CloudFront (AWS, SST) and Postgres on Neon. No VPC, RDS or NAT,
so it stays within free tiers. One CloudFront distribution serves the site at `/`
and the API at `/api`, so the browser sees one origin (no CORS). The URL is the
generated `*.cloudfront.net` address printed as `url` at the end of the deploy.

## Pipeline

`.github/workflows/deploy-demo.yml` runs on push to `demo`, manually, and weekly
(reseeds so the sample data stays within "last 30 days"). It builds the backend,
migrates and reseeds Neon, then runs `sst deploy --stage demo`.

## GitHub `demo` environment secrets

| Secret                                             | Notes                          |
| -------------------------------------------------- | ------------------------------ |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`       | Deploy credentials             |
| `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Neon, direct (non-pooled) host |
| `ENCRYPTION_KEY`                                   | `openssl rand -base64 32`      |

Also set an AWS budget alert (e.g. $1); AWS has no hard spending cap.

## Custom domain later

Add `domain` to the `Router` in `infra/sst.config.ts` (SST supports Route 53 and
Cloudflare DNS adapters).

## Teardown

`cd infra && pnpm exec sst remove --stage demo`, then delete the Neon project.
