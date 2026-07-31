# Deployment strategy

Deployment is optional and manual so repositories created from this template
do not create AWS resources unexpectedly.

## GitHub workflows

### Continuous Integration

`.github/workflows/ci.yml` runs installation, linting, backend tests, frontend
builds, and a critical-level dependency audit on pushes and pull requests.

### Preview environments

Run **Manage Preview Environment** from GitHub Actions.

- Choose a unique stage such as `preview-123`.
- Choose `deploy` to create or update the stage.
- Choose `remove` to destroy that same stage.

### Production

Run **Deploy to Production** from GitHub Actions. Configure protection and
required reviewers on the `production` GitHub environment before using it.

## Required GitHub environment secrets

Configure these in both `preview` and `production` as appropriate:

| Secret                  | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | AWS deployment credential                                |
| `AWS_SECRET_ACCESS_KEY` | AWS deployment credential                                |
| `ENCRYPTION_KEY`        | 32-byte base64 key for encrypted integration credentials |
| `ALLOWED_ORIGINS`       | Frontend origin allowed by the API                       |

Prefer replacing static AWS keys with GitHub OIDC for long-lived production
use.

Both workflows set `SST_APP_NAME=falcon-eye` so deploy and `remove-all.sh`
target the same resource prefix. Change that value in the workflows if you
customize the SST app name. Existing stacks created as `pj-falcon-eye-stack`
must use `SST_APP_NAME=pj-falcon-eye-stack` until rebuilt.

## Local deployment

```bash
cd infra
pnpm exec sst secret set EncryptionKey '<generated-key>' --stage dev
pnpm exec sst secret set AllowedOrigins 'https://frontend.example.com' --stage dev
pnpm run deploy:sst --stage dev
```

When using SST's generated frontend URL, update `AllowedOrigins` with the
`frontendUrl` output and deploy the stage a second time.

To remove the stage:

```bash
STAGE=dev ./remove-all.sh
```

`sst remove` alone often fails partway through VPC, RDS, and NAT dependency
chains. `remove-all.sh` tries SST first, then deletes only resources tagged for
that app and stage. It does not sweep the whole AWS account. Set `SST_APP_NAME`
if you customized the stack name.

## Cost warning

This stack creates resources including a VPC and PostgreSQL database. Review
the generated plan and AWS pricing before deploying previews or production.
