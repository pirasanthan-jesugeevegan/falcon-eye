# Falcon Eye Backend

The NestJS backend API for the Falcon Eye QA Dashboard, providing RESTful endpoints for product management, Jira integration, GitHub workflow management, SonarCloud integration, and test results tracking.

## 🎯 Features

### Core Modules

#### 1. **Products Management**

- **CRUD Operations**: Create, read, update, and delete products
- **Product Metadata**: Store product names, icons, paths, and active status
- **Product Relationships**: Link products to test results and configurations

#### 2. **Jira Integration**

- **Jira Configuration Management**:
  - Store multiple Jira instance configurations
  - Secure storage of API tokens and credentials
  - Instance-specific settings and project keys
- **Jira Query Management**:
  - Create and manage custom JQL queries
  - Execute queries against Jira instances
  - Store query results and execution history
- **Issue Tracking**:
  - Fetch and store Jira issues
  - Real-time issue status monitoring
  - Issue filtering and search capabilities

#### 3. **GitHub Integration**

- **GitHub Configuration Management**:
  - Store GitHub repository configurations
  - Secure storage of GitHub tokens
  - Repository-specific workflow settings
- **Workflow Management**:
  - Trigger GitHub Actions workflows
  - Monitor workflow run status
  - Retrieve workflow execution history
  - Custom input schema support for workflows

#### 4. **SonarCloud Integration**

- **SonarCloud Configuration Management**:
  - Store SonarCloud project configurations
  - Secure storage of SonarCloud tokens
  - Project-specific quality gate settings
- **Quality Metrics Management**:
  - Create and manage custom SonarCloud queries
  - Execute queries against SonarCloud projects
  - Monitor code quality metrics and quality gates
  - Track code coverage and technical debt

#### 5. **Test Results Management**

- **E2E Test Results**:
  - Store end-to-end test execution results
  - Track pass/fail/skip statistics
  - Store test reports and execution metadata
  - Environment-specific test tracking
- **Unit Test Results**:
  - Store code coverage metrics
  - Track test execution history
  - Link to commits and pull requests
  - Author attribution and timestamps

#### 6. **Database Management**

- **TypeORM Integration**: Full ORM support with PostgreSQL
- **Migrations**: Version-controlled database schema changes
- **Seeding**: Initial data population for development
- **Entity Relationships**: Proper foreign key relationships

## 🛠️ Technology Stack

- **NestJS** - Node.js framework with TypeScript
- **TypeScript** - Type safety and modern JavaScript features
- **TypeORM** - Database ORM with PostgreSQL support
- **PostgreSQL** - Primary database
- **Class Validator** - Request validation and DTOs
- **Axios** - HTTP client for external API calls
- **Jest** - Testing framework
- **ESLint & Prettier** - Code quality and formatting

## 📁 Project Structure

```
src/
├── modules/            # Feature modules
│   ├── products/       # Product management
│   │   ├── dto/        # Data Transfer Objects
│   │   │   ├── create-product.dto.ts
│   │   │   └── update-product.dto.ts
│   │   ├── entities/   # Database entities
│   │   │   └── product.entity.ts
│   │   ├── products.controller.ts
│   │   ├── products.module.ts
│   │   └── products.service.ts
│   ├── jira/          # Jira integration
│   │   ├── dto/        # Jira DTOs
│   │   │   ├── create-jira-config.dto.ts
│   │   │   ├── create-jira-query.dto.ts
│   │   │   ├── jira-response.dto.ts
│   │   │   ├── update-jira-config.dto.ts
│   │   │   └── update-jira-query.dto.ts
│   │   ├── entities/   # Jira entities
│   │   │   ├── jira-config.entity.ts
│   │   │   └── jira-query.entity.ts
│   │   ├── jira.controller.ts
│   │   ├── jira.module.ts
│   │   └── jira.service.ts
│   ├── github/        # GitHub integration
│   │   ├── dto/        # GitHub DTOs
│   │   │   ├── create-github-config.dto.ts
│   │   │   └── trigger-workflow.dto.ts
│   │   ├── entities/   # GitHub entities
│   │   │   └── github-config.entity.ts
│   │   ├── github-config.controller.ts
│   │   ├── github-config.service.ts
│   │   ├── github.service.ts
│   │   └── github.module.ts
│   ├── sonarcloud/    # SonarCloud integration
│   │   ├── dto/        # SonarCloud DTOs
│   │   │   ├── create-sonarcloud-config.dto.ts
│   │   │   ├── create-sonarcloud-query.dto.ts
│   │   │   ├── update-sonarcloud-config.dto.ts
│   │   │   └── update-sonarcloud-query.dto.ts
│   │   ├── entities/   # SonarCloud entities
│   │   │   ├── sonarcloud-config.entity.ts
│   │   │   └── sonarcloud-query.entity.ts
│   │   ├── sonarcloud.controller.ts
│   │   ├── sonarcloud.module.ts
│   │   └── sonarcloud.service.ts
│   ├── e2e-results/   # E2E test results
│   │   ├── dto/
│   │   │   └── create-e2e-result.dto.ts
│   │   ├── entities/
│   │   │   └── e2e-result.entity.ts
│   │   ├── e2e-results.controller.ts
│   │   ├── e2e-results.module.ts
│   │   └── e2e-results.service.ts
│   └── unit-results/  # Unit test results
│       ├── dto/
│       │   └── create-unit-result.dto.ts
│       ├── entities/
│       │   └── unit-result.entity.ts
│       ├── unit-results.controller.ts
│       ├── unit-results.module.ts
│       └── unit-results.service.ts
├── database/          # Database configuration
│   ├── migrations/    # Database migrations
│   │   └── 1752744826695-dataSource.ts.ts
│   └── seeds/         # Database seeders
│       └── seed.ts
├── app.module.ts      # Root application module
└── main.ts           # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- pnpm 7+
- PostgreSQL database

### Installation

1. **Install dependencies**

```bash
pnpm install
```

2. **Environment Setup**
   Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=qa_dashboard

# Application Configuration
NODE_ENV=development
PORT=3000

# External API Configuration (optional)
JIRA_API_TIMEOUT=30000
GITHUB_API_TIMEOUT=30000
SONARCLOUD_API_TIMEOUT=30000
```

3. **Database Setup**

```bash
# Run database migrations
pnpm migration:run

# Seed the database (optional)
pnpm seed
```

### Development

#### **Start development server**

```bash
pnpm start:dev
```

The API will be available at `http://localhost:3000/api`

#### **Start in debug mode**

```bash
pnpm start:debug
```

#### **Build for production**

```bash
pnpm build
```

#### **Start production server**

```bash
pnpm start:prod
```

### Available Scripts

- `pnpm start` - Start the application
- `pnpm start:dev` - Start in development mode with hot reload
- `pnpm start:debug` - Start in debug mode
- `pnpm start:prod` - Start production server
- `pnpm build` - Build the application
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:cov` - Run tests with coverage
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## 🔧 Database Management

### Migrations

#### **Generate a migration**

```bash
pnpm migration:generate
```

#### **Run migrations**

```bash
pnpm migration:run
```

#### **Revert migrations**

```bash
pnpm migration:revert
```

### Seeding

#### **Run database seeds**

```bash
pnpm seed
```

## 🔌 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

### API Endpoints

#### **Products Management**

##### `GET /api/products`

Get all products

- **Response**: Array of Product objects
- **Status**: 200 OK

##### `GET /api/products/:id`

Get a specific product by ID

- **Parameters**: `id` (string) - Product UUID
- **Response**: Product object
- **Status**: 200 OK

##### `POST /api/products`

Create a new product

- **Request Body**:

```json
{
  "productName": "string (required)",
  "icon": "string (optional)",
  "path": "string (optional)",
  "isActive": "boolean (optional, default: true)"
}
```

- **Response**: Created Product object
- **Status**: 201 Created

##### `PATCH /api/products/:id`

Update a product

- **Parameters**: `id` (string) - Product UUID
- **Request Body**: Partial Product object
- **Response**: Updated Product object
- **Status**: 200 OK

##### `DELETE /api/products/:id`

Delete a product

- **Parameters**: `id` (string) - Product UUID
- **Response**: No content
- **Status**: 204 No Content

#### **Jira Integration**

##### **Jira Configuration Endpoints**

##### `GET /api/jira/config`

Get all Jira configurations

- **Response**: Array of JiraConfig objects
- **Status**: 200 OK

##### `GET /api/jira/config/:id`

Get a specific Jira configuration

- **Parameters**: `id` (string) - Configuration UUID
- **Response**: JiraConfig object
- **Status**: 200 OK

##### `POST /api/jira/config`

Create a new Jira configuration

- **Request Body**:

```json
{
  "instanceName": "string (required)",
  "baseUrl": "string (required, URL)",
  "email": "string (required, email)",
  "apiToken": "string (required)",
  "projectKey": "string (optional)"
}
```

- **Response**: Created JiraConfig object
- **Status**: 201 Created

##### `PATCH /api/jira/config/:id`

Update a Jira configuration

- **Parameters**: `id` (string) - Configuration UUID
- **Request Body**: Partial JiraConfig object
- **Response**: Updated JiraConfig object
- **Status**: 200 OK

##### `DELETE /api/jira/config/:id`

Delete a Jira configuration

- **Parameters**: `id` (string) - Configuration UUID
- **Response**: No content
- **Status**: 204 No Content

##### **Jira Query Endpoints**

##### `GET /api/jira/query`

Get all Jira queries

- **Response**: Array of JiraQuery objects
- **Status**: 200 OK

##### `GET /api/jira/query/:id`

Get a specific Jira query

- **Parameters**: `id` (string) - Query UUID
- **Response**: JiraQuery object
- **Status**: 200 OK

##### `GET /api/jira/config/:configId/query`

Get queries by configuration ID

- **Parameters**: `configId` (string) - Configuration UUID
- **Response**: Array of JiraQuery objects
- **Status**: 200 OK

##### `POST /api/jira/query`

Create a new Jira query

- **Request Body**:

```json
{
  "name": "string (required)",
  "jqlQuery": "string (required)",
  "description": "string (optional)",
  "jiraConfigId": "string (required, UUID)",
  "isActive": "boolean (optional, default: true)"
}
```

- **Response**: Created JiraQuery object
- **Status**: 201 Created

##### `PATCH /api/jira/query/:id`

Update a Jira query

- **Parameters**: `id` (string) - Query UUID
- **Request Body**: Partial JiraQuery object
- **Response**: Updated JiraQuery object
- **Status**: 200 OK

##### `DELETE /api/jira/query/:id`

Delete a Jira query

- **Parameters**: `id` (string) - Query UUID
- **Response**: No content
- **Status**: 204 No Content

##### `GET /api/jira/query/:id/execute`

Execute a Jira query

- **Parameters**: `id` (string) - Query UUID
- **Response**: Query execution results with issues
- **Status**: 200 OK

#### **GitHub Integration**

##### **GitHub Configuration Endpoints**

##### `GET /api/github/config`

Get all GitHub configurations

- **Response**: Array of GithubConfig objects
- **Status**: 200 OK

##### `POST /api/github/config`

Create a new GitHub configuration

- **Request Body**:

```json
{
  "repository": "string (required)",
  "token": "string (required)",
  "workflowFile": "string (required)",
  "inputsSchema": "array (optional)"
}
```

- **Response**: Created GithubConfig object
- **Status**: 201 Created

##### `PATCH /api/github/config/:id`

Update GitHub configuration inputs schema

- **Parameters**: `id` (string) - Configuration UUID
- **Request Body**:

```json
{
  "inputsSchema": "array (required)"
}
```

- **Response**: Updated GithubConfig object
- **Status**: 200 OK

##### `DELETE /api/github/config/:id`

Delete a GitHub configuration

- **Parameters**: `id` (string) - Configuration UUID
- **Response**: No content
- **Status**: 204 No Content

##### **GitHub Workflow Endpoints**

##### `POST /api/github/config/:id/trigger`

Trigger a GitHub workflow

- **Parameters**: `id` (string) - Configuration UUID
- **Request Body**:

```json
{
  "inputs": "object (optional)"
}
```

- **Response**: Workflow trigger result
- **Status**: 200 OK

##### `GET /api/github/config/:id/runs`

Get workflow runs for a configuration

- **Parameters**: `id` (string) - Configuration UUID
- **Response**: Array of workflow runs
- **Status**: 200 OK

##### `GET /api/github/config/:id/runs/:runId`

Get specific workflow run status

- **Parameters**:
  - `id` (string) - Configuration UUID
  - `runId` (string) - Workflow run ID
- **Response**: Workflow run details
- **Status**: 200 OK

#### **SonarCloud Integration**

##### **SonarCloud Configuration Endpoints**

##### `GET /api/sonarcloud/config`

Get all SonarCloud configurations

- **Response**: Array of SonarCloudConfig objects
- **Status**: 200 OK

##### `GET /api/sonarcloud/config/:id`

Get a specific SonarCloud configuration

- **Parameters**: `id` (string) - Configuration UUID
- **Response**: SonarCloudConfig object
- **Status**: 200 OK

##### `POST /api/sonarcloud/config`

Create a new SonarCloud configuration

- **Request Body**:

```json
{
  "organization": "string (required)",
  "projectKey": "string (required)",
  "token": "string (required)"
}
```

- **Response**: Created SonarCloudConfig object
- **Status**: 201 Created

##### `PATCH /api/sonarcloud/config/:id`

Update a SonarCloud configuration

- **Parameters**: `id` (string) - Configuration UUID
- **Request Body**: Partial SonarCloudConfig object
- **Response**: Updated SonarCloudConfig object
- **Status**: 200 OK

##### `DELETE /api/sonarcloud/config/:id`

Delete a SonarCloud configuration

- **Parameters**: `id` (string) - Configuration UUID
- **Response**: No content
- **Status**: 204 No Content

##### **SonarCloud Query Endpoints**

##### `GET /api/sonarcloud/query`

Get all SonarCloud queries

- **Response**: Array of SonarCloudQuery objects
- **Status**: 200 OK

##### `GET /api/sonarcloud/query/:id`

Get a specific SonarCloud query

- **Parameters**: `id` (string) - Query UUID
- **Response**: SonarCloudQuery object
- **Status**: 200 OK

##### `GET /api/sonarcloud/config/:configId/query`

Get queries by configuration ID

- **Parameters**: `configId` (string) - Configuration UUID
- **Response**: Array of SonarCloudQuery objects
- **Status**: 200 OK

##### `POST /api/sonarcloud/query`

Create a new SonarCloud query

- **Request Body**:

```json
{
  "name": "string (required)",
  "query": "string (required)",
  "description": "string (optional)",
  "sonarCloudConfigId": "string (required, UUID)",
  "isActive": "boolean (optional, default: true)"
}
```

- **Response**: Created SonarCloudQuery object
- **Status**: 201 Created

##### `PATCH /api/sonarcloud/query/:id`

Update a SonarCloud query

- **Parameters**: `id` (string) - Query UUID
- **Request Body**: Partial SonarCloudQuery object
- **Response**: Updated SonarCloudQuery object
- **Status**: 200 OK

##### `DELETE /api/sonarcloud/query/:id`

Delete a SonarCloud query

- **Parameters**: `id` (string) - Query UUID
- **Response**: No content
- **Status**: 204 No Content

#### **E2E Test Results**

##### `GET /api/e2e-results`

Get all E2E test results

- **Query Parameters**: `productName` (string, optional) - Filter by product
- **Response**: Array of E2EResult objects
- **Status**: 200 OK

##### `GET /api/e2e-results/:id`

Get a specific E2E test result

- **Parameters**: `id` (string) - Result UUID
- **Response**: E2EResult object
- **Status**: 200 OK

##### `POST /api/e2e-results`

Create a new E2E test result

- **Request Body**:

```json
{
  "productName": "string (required)",
  "timestamp": "Date (required)",
  "pass": "number (required)",
  "fail": "number (required)",
  "skip": "number (required)",
  "report_url": "string (required)",
  "environment": "string (required)",
  "duration": "string (required)",
  "tag": "string (required)"
}
```

- **Response**: Created E2EResult object
- **Status**: 201 Created

#### **Unit Test Results**

##### `GET /api/unit-results`

Get all unit test results

- **Query Parameters**: `productName` (string, optional) - Filter by product
- **Response**: Array of UnitResult objects
- **Status**: 200 OK

##### `GET /api/unit-results/:id`

Get a specific unit test result

- **Parameters**: `id` (string) - Result UUID
- **Response**: UnitResult object
- **Status**: 200 OK

##### `POST /api/unit-results`

Create a new unit test result

- **Request Body**:

```json
{
  "productName": "string (required)",
  "date": "Date (required)",
  "percentage": "number (required)",
  "commit": "string (required)",
  "pull_request": "string (required)",
  "statement_coverage": "number (required)",
  "function_coverage": "number (required)",
  "branch_coverage": "number (required)",
  "line_coverage": "number (required)",
  "author": "string (required)"
}
```

- **Response**: Created UnitResult object
- **Status**: 201 Created

## 🏗️ Architecture

### Module Structure

The application follows NestJS module architecture:

- Each feature is organized as a separate module
- Modules contain controllers, services, DTOs, and entities
- Shared functionality is extracted into common modules

### Database Design

- **TypeORM Entities**: Define database schema and relationships
- **Migrations**: Version-controlled schema changes
- **Seeding**: Initial data population
- **Relationships**: Proper foreign key constraints

### Service Layer

- **Business Logic**: Encapsulated in service classes
- **Data Access**: TypeORM repositories for database operations
- **External APIs**: Axios for Jira, GitHub, and SonarCloud API integration
- **Error Handling**: Comprehensive error management

### Validation

- **DTOs**: Data Transfer Objects with validation decorators
- **Class Validator**: Request validation and sanitization
- **Type Safety**: Full TypeScript support throughout

## 🔒 Security Considerations

### API Security

- Input validation on all endpoints
- SQL injection prevention through TypeORM
- CORS configuration for frontend integration
- Rate limiting (can be added as needed)

### Data Protection

- Secure storage of API tokens (Jira, GitHub, SonarCloud)
- Environment variable management
- Database connection security

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Individual service and controller tests
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application flow testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

## 📦 Deployment

### Production Build

```bash
pnpm build
```

### Environment Configuration

- Set `NODE_ENV=production`
- Configure production database URL
- Set appropriate CORS origins
- Configure logging levels

### Docker Support

The application can be containerized for deployment:

- Dockerfile for application container
- Docker Compose for local development
- Environment-specific configurations

## 🔍 Monitoring & Logging

### Logging

- Structured logging with NestJS logger
- Different log levels for development and production
- Error tracking and monitoring

### Health Checks

- Database connection health
- External API connectivity (Jira, GitHub, SonarCloud)
- Application status endpoints

## 🤝 Contributing

1. Follow NestJS best practices and conventions
2. Write comprehensive tests for new features
3. Use proper TypeScript types and interfaces
4. Follow the existing code style and patterns
5. Update documentation for API changes

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Class Validator Documentation](https://github.com/typestack/class-validator)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [Jira REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [SonarCloud Web API Documentation](https://sonarcloud.io/web_api/)
