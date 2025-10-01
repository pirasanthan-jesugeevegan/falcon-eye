# Falcon Eye

A comprehensive QA Monitoring Tool for tracking test results, integrating with Jira, SonarCloud, and GitHub workflows.

## Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL
- **Frontend**: React, Vite, TanStack Router, TanStack Query
- **Infrastructure**: SST (Serverless Stack)
- **Package Manager**: pnpm (monorepo workspace)
- **Node Version**: 20.x

## Prerequisites

- Node.js 20.x (see `.nvmrc`)
- pnpm 10.x or higher
- PostgreSQL database (local or remote)

## Project Structure

```
falcon-eye/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # React frontend
├── infra/                # SST infrastructure configuration
├── packages/
│   └── common/           # Shared utilities
├── .env                  # Environment variables (root level)
└── package.json          # Root workspace configuration
```

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the **root directory** with the following variables:

```bash
# Environment
NODE_ENV=development

# Server
PORT=3000

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=your-database

# Encryption Key (32 bytes base64 encoded)
ENCRYPTION_KEY=your-base64-encoded-key
```

**Important**: The `.env` file must be at the root level, not in `apps/backend/`.

#### Generating an Encryption Key

To generate a secure encryption key for `ENCRYPTION_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Database Setup

Run migrations to create database tables:

```bash
pnpm -w run backend:migration:run
```

To generate a new migration after changing entities:

```bash
pnpm -w run backend:migration:generate src/database/migrations/YourMigrationName
```

To revert the last migration:

```bash
cd apps/backend && pnpm migration:revert
```

### 4. Running the Application

#### Development Mode

Run both backend and frontend concurrently:

```bash
pnpm dev
```

Or run them separately:

```bash
# Backend only
pnpm backend:start

# Frontend only
pnpm frontend:start
```

#### Production Build

```bash
pnpm build
```

## Available Scripts

All scripts should be run from the **root directory** using `pnpm -w run` or the shortcuts below:

### Backend

- `pnpm backend:start` - Start backend in watch mode
- `pnpm backend:build` - Build backend
- `pnpm backend:test` - Run backend tests
- `pnpm -w run backend:migration:generate <name>` - Generate new migration
- `pnpm -w run backend:migration:run` - Run pending migrations
- `pnpm backend:seed` - Seed database with initial data

### Frontend

- `pnpm frontend:start` - Start frontend dev server
- `pnpm frontend:build` - Build frontend for production
- `pnpm frontend:preview` - Preview production build

### Infrastructure

- `pnpm dev:infra` - Start SST dev mode
- `pnpm deploy:infra` - Deploy infrastructure to AWS
- `pnpm remove:infra` - Remove deployed infrastructure

### Code Quality

- `pnpm lint` - Lint all code
- `pnpm format` - Format all code with Prettier

## Important Notes

### Environment Variables

- The `.env` file **must** be in the root directory
- Both `app.module.ts` and `ormconfig.ts` are configured to load from the root `.env`
- Never commit `.env` to version control (use `example.env` as a template)

### Running Commands

- Use `pnpm -w run` prefix for workspace root scripts
- Backend-specific commands can be run with `cd apps/backend && pnpm <command>`
- Frontend-specific commands can be run with `cd apps/frontend && pnpm <command>`

### Migrations

- Migrations are auto-generated from TypeORM entities
- Always review generated migrations before running
- Migration files are located in `apps/backend/src/database/migrations/`
- The database connection uses the `DATABASE_URL` from `.env`

### Encryption

- Sensitive data (API tokens, passwords) are encrypted using AES-256-GCM
- The `ENCRYPTION_KEY` must be a 32-byte base64-encoded string
- Encryption utilities are in `apps/backend/src/crypto.util.ts`

## Troubleshooting

### "ENCRYPTION_KEY not set" Error

Ensure your `.env` file is in the root directory and contains a valid `ENCRYPTION_KEY`.

### TypeScript "Cannot find name 'Buffer'" Error

If you see this error, restart your TypeScript server:

- VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

### Migration Errors

If migrations fail, check:

1. Database is accessible (check `DATABASE_URL`)
2. `.env` file is in the root directory
3. Migration order is correct (foreign keys created after tables)

To start fresh:

```bash
# Drop all tables manually in your database, then:
pnpm -w run backend:migration:run
```

### Database Connection Issues

- Verify your database credentials in `.env`
- For remote databases, ensure SSL settings match your provider
- Check that the database accepts connections from your IP

## Contributing

1. Create a feature branch from `master`
2. Make your changes
3. Run linting and tests
4. Commit using conventional commits
5. Create a pull request

## License

UNLICENSED - Private project
