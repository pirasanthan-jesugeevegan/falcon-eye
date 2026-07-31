# Falcon Eye

Falcon Eye is a QA monitoring dashboard for products, test results, Jira,
SonarCloud, GitHub Actions, and infrastructure dashboards.

## Stack

- NestJS, TypeORM, and PostgreSQL
- React, Vite, TanStack Router, and TanStack Query
- SST v3 on AWS
- pnpm workspaces and Node.js 20

## Use this template

1. Select **Use this template** on GitHub and create a repository.
2. Clone the new repository.
3. Replace the project name, package scope, branding, and license if needed.
4. Follow the local setup below.
5. Configure AWS only if you want SST deployments.

Repositories created from this template have independent history, issues,
secrets, and deployment configuration.

## Local setup

### Prerequisites

- Node.js 20 (see `.nvmrc`)
- pnpm 10
- PostgreSQL

### Install

```bash
pnpm install
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env.local
```

Fill in the database credentials in `.env`, then generate a unique encryption
key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Store the output as `ENCRYPTION_KEY` in `.env`. Never reuse the example or
commit this value.

### Database

Create the database named by `DB_NAME`, then run:

```bash
pnpm backend:migration:run
pnpm backend:seed # optional example data
```

`DB_SSL=false` works for a typical local PostgreSQL server. Set it to `true`
for providers that require TLS. Schema synchronization is disabled by default;
use migrations, or set `DB_SYNCHRONIZE=true` only for a disposable local
database.

### Run

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

The local backend has no `/api` prefix. The deployed Lambda uses `/api`, so a
deployed frontend base URL must include that prefix.

## Environment variables

Backend variables live in the root `.env`; see `.env.example`.

| Variable                                                      | Purpose                                                               |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| `NODE_ENV`                                                    | Runtime environment                                                   |
| `PORT`                                                        | Local API port                                                        |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection                                                 |
| `DB_SSL`                                                      | Enable PostgreSQL TLS                                                 |
| `DB_SYNCHRONIZE`                                              | Optional TypeORM schema sync; keep false outside disposable databases |
| `ENCRYPTION_KEY`                                              | Base64-encoded 32-byte key for stored integration credentials         |
| `ALLOWED_ORIGINS`                                             | Comma-separated browser origins accepted by the API                   |
| `LOG_LEVEL`                                                   | Backend log level                                                     |

Frontend variables live in `apps/frontend/.env.local`; see
`apps/frontend/.env.example`.

| Variable            | Purpose                                |
| ------------------- | -------------------------------------- |
| `VITE_API_BASE_URL` | API base URL, without a trailing slash |

## Commands

```bash
pnpm dev                 # frontend and backend
pnpm build               # all workspace packages
pnpm lint                # lint the monorepo
pnpm backend:test        # backend unit tests
pnpm backend:migration:run
pnpm backend:migration:generate src/database/migrations/Name
pnpm backend:migration:revert
pnpm backend:seed
```

## AWS deployment (optional)

SST deploys a VPC, PostgreSQL database, Lambda API, and static frontend. AWS
resources can incur charges.

Authenticate the AWS CLI, then set stage-specific SST secrets:

```bash
cd infra
pnpm exec sst secret set EncryptionKey '<generated-key>' --stage dev
pnpm exec sst secret set AllowedOrigins 'https://your-frontend.example.com' --stage dev
pnpm run deploy:sst --stage dev
```

Set `SST_APP_NAME` to customize the default `falcon-eye` AWS resource prefix.
The default AWS region is `eu-west-2`; change it in `infra/sst.config.ts` if
needed.

If you use the generated SST frontend URL rather than a known custom domain,
deploy once with a temporary origin, copy the `frontendUrl` output, update the
`AllowedOrigins` secret to that exact origin, and deploy again.

To remove a stage:

```bash
cd infra
STAGE=dev ./remove-all.sh
```

`sst remove` alone often stalls on VPC/RDS/NAT dependency chains. `remove-all.sh`
tries SST first, then deletes only resources tagged for that app and stage.
Set `SST_APP_NAME` if you customized the stack name.

The GitHub deployment workflows are manual by design, so a repository created
from this template does not deploy automatically. Before using them, configure
the `preview` and `production` GitHub environments with:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ENCRYPTION_KEY`
- `ALLOWED_ORIGINS`

Both workflows set `SST_APP_NAME=falcon-eye`. If you change the SST app name,
update that value in the workflow files, `infra/sst.config.ts`, and
`infra/remove-all.sh` together. Existing stacks named `pj-falcon-eye-stack`
need `SST_APP_NAME=pj-falcon-eye-stack` until they are rebuilt.

## Security

- Never commit `.env`, `.env.local`, API tokens, or generated encryption keys.
- Rotate credentials immediately if they appear in git history or logs.
- The API currently has no authentication layer. Do not expose it publicly
  without adding authentication and authorization.
- Restrict `ALLOWED_ORIGINS` to trusted frontend origins.

## Project structure

```text
apps/backend/       NestJS API
apps/frontend/      React application
packages/common/    Shared types and utilities
infra/              SST infrastructure
docs/               Project documentation
```

## Contributing

Run `pnpm lint`, `pnpm backend:test`, and `pnpm build` before opening a pull
request. Commit messages follow Conventional Commits.

## License

Copyright (c) 2026 Pirasanthan Jesugeevegan. All rights reserved.

See [LICENSE](LICENSE). Use of this repository, including as a GitHub template,
is governed by that license.
