# Falcon Eye Backend

NestJS and TypeORM API for Falcon Eye.

Use the repository-level [README](../../README.md) for installation, database,
environment, migration, testing, and deployment instructions.

From the repository root:

```bash
pnpm backend:start
pnpm backend:test
pnpm backend:build
pnpm backend:migration:run
pnpm backend:seed
```

The local API defaults to `http://localhost:3000`. The Lambda entrypoint adds
the `/api` prefix for deployed environments.
