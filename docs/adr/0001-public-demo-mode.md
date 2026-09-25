# 0001: Public demo mode; authentication is the network perimeter

Status: accepted

## Context

Falcon Eye started as an internal tool: every route is open, CORS allowed any origin, and the
Jira, SonarCloud and GitHub routes store API tokens and call those services. Real deployments
run inside an organisation, behind an IP allow-list, VPN or SSO proxy, holding real data.

We also want a public instance to show what it does, holding only seeded sample data. On the
open internet the open API is unsafe even with sample data:

- Anyone could create, change or delete records.
- `POST /jira/config` verifies credentials by calling `${baseUrl}/rest/api/3/myself`, where
  `baseUrl` comes from the request. On a public function that is a server-side request forgery
  primitive: the API would fetch any URL a stranger names.

A second problem: `main.ts` (local and tests) and `lambda.ts` (deployed) configured the app
separately. The Lambda handler set `skipMissingProperties: true`, so requests with required
fields missing were accepted in production while the tests exercised stricter rules.

## Decision

Two modes, chosen by `DEMO_MODE`:

|                                   | Demo (`DEMO_MODE=true`)        | Private (`DEMO_MODE=false`)                  |
| --------------------------------- | ------------------------------ | -------------------------------------------- |
| Reads                             | open                           | open                                         |
| Writes (POST, PATCH, PUT, DELETE) | refused (403)                  | allowed                                      |
| Jira, SonarCloud, GitHub reads    | served from sample data        | allowed (call the real services)             |
| Who protects it                   | the app: it can change nothing | the network: IP allow-list, VPN or SSO proxy |

- The demo has no keys and no login: it is read-only, so there is nothing to steal or change.
  Its sample data is loaded by the seed script straight into its database, not through the API.
- Private mode has no application-level authentication. That is deliberate, and it is only safe
  behind a network perimeter. Production refuses to start unless `DEMO_MODE` is set to `true` or
  `false` (no silent default), and logs a warning when it starts without authentication.
- `ALLOWED_ORIGINS` must name the frontend explicitly in production; `*` is refused.
- Encrypted tokens are marked `@Exclude()` and never appear in a response.
- `configureApp()` is the only HTTP setup (helmet, CORS, strict validation, serialization).
  `main.ts`, the Lambda handler and the tests all call it.
- Rate limiting uses `@nestjs/throttler`.

### Amendment: integration reads in demo mode

The first version refused every Jira, SonarCloud and GitHub route in demo mode, which left the
dashboard's issue, quality-gate and workflow panels empty. Demo mode now serves their **reads**
from sample data (`src/demo/demo-integrations.ts`, inserted into the demo database by the seed):

- `executeQuery` (Jira, SonarCloud) and the GitHub run lookups return the sample data and make
  **no outbound HTTP call**, so the stored URL and token are never used. The SSRF risk described
  above stays closed: the only outbound call was the one that is now skipped.
- Every write (POST, PATCH, PUT, DELETE) on those routes is still refused with 403 by the guard,
  so a caller still cannot store a URL or token.
- The tokens in the demo database are encrypted placeholders, and `@Exclude()` keeps them out of
  every response.
- `@DisabledInDemo()` remains available for any route that must be off entirely in a demo.

`security.e2e-spec.ts` pins this: the sample-data routes fail their test if they make an outbound
call, and a private deployment is tested to still call the real Jira.

## Consequences

- Never deploy `DEMO_MODE=false` to the public internet. If that need ever arises, add real
  authentication first (a guard in front of every route); the guard structure here is ready for it.
- Rate limiting is in memory, so on Lambda it is best-effort per warm instance: a brake, not a wall.
- Validation is stricter in production than it was (missing and unknown properties are rejected).
- The `security.e2e-spec.ts` suite pins this table, so a change to the rules has to change a test.
