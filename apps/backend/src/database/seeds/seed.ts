import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { ProductsService } from '../../modules/products/products.service';
import { E2EResultsService } from '../../modules/e2e-results/e2e-results.service';
import { UnitResultsService } from '../../modules/unit-results/unit-results.service';
import { GithubConfig } from '../../modules/github/entities/github-config.entity';
import { JiraConfig } from '../../modules/jira/entities/jira-config.entity';
import { JiraQuery } from '../../modules/jira/entities/jira-query.entity';
import { SonarCloudConfig } from '../../modules/sonarcloud/entities/sonarcloud-config.entity';
import { SonarCloudQuery } from '../../modules/sonarcloud/entities/sonarcloud-query.entity';
import { seedIntegrations } from './seed-integrations';

/**
 * Seeds a fictional retailer ("Northwind") with 30 days of QA history, so the
 * dashboard has a realistic story to show: mostly green nightly runs, a few
 * believable incidents that get fixed, and coverage that creeps up.
 *
 * Deterministic (fixed PRNG seed) so every environment shows the same numbers.
 * Dates are relative to "now", so the charts always cover the last 30 days.
 *
 *   pnpm backend:seed                 seed an empty database
 *   SEED_RESET=true pnpm backend:seed wipe results, products and the Jira /
 *                                     SonarCloud / GitHub configs, then reseed
 */

const DAYS = 30;

// mulberry32: tiny seeded PRNG, so reruns produce identical data.
function createRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = createRng(20260925);
const between = (min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));
const pick = <T>(items: T[]) => items[Math.floor(rng() * items.length)];
const sha = () =>
  Array.from({ length: 7 }, () => between(0, 15).toString(16)).join('');
const round1 = (n: number) => Math.round(n * 10) / 10;

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}m ${String(Math.round(seconds % 60)).padStart(2, '0')}s`;

const dayStart = (daysAgo: number) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
};
const at = (day: Date, hour: number, minute: number) => {
  const d = new Date(day);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
};

interface ProductProfile {
  name: string;
  icon: string;
  path: string;
  slug: string;
  /** Nightly regression suite. */
  regressionTotal: number;
  regressionSkipped: number;
  regressionMinutes: number;
  /** Chance that a nightly run has one or two flaky failures. */
  flakeRate: number;
  /** Days ago -> failures on that night. The next night is green again. */
  incidents: Record<number, number>;
  smokeTotal: number;
  /** Failures in today's production smoke run: what the dashboard shows as "current". */
  smokeFailuresToday: number;
  unitTests: number;
  coverage: {
    statement: number;
    branch: number;
    function: number;
    line: number;
  };
  team: string[];
  pullRequests: { number: number; title: string }[];
}

const profiles: ProductProfile[] = [
  {
    name: 'Storefront Web',
    icon: 'ShoppingBagIcon',
    path: '/storefront',
    slug: 'storefront-web',
    regressionTotal: 184,
    regressionSkipped: 3,
    regressionMinutes: 14,
    flakeRate: 0.15,
    incidents: { 18: 9 }, // checkout selector changed by the design-system upgrade
    smokeTotal: 16,
    smokeFailuresToday: 0,
    unitTests: 812,
    coverage: { statement: 81.4, branch: 72.9, function: 79.8, line: 82.1 },
    team: ['Priya Nair', 'Tomasz Kowalski', 'Hannah Whitcombe'],
    pullRequests: [
      {
        number: 1471,
        title: 'Recalculate basket total when delivery address changes',
      },
      { number: 1476, title: 'Add size guide modal to product detail page' },
      { number: 1480, title: 'Debounce search suggestions to cut API calls' },
      { number: 1483, title: 'Fix focus trap in mini-basket drawer' },
      { number: 1488, title: 'Persist guest basket across sessions' },
      { number: 1491, title: 'Lazy-load below-the-fold product carousels' },
      { number: 1495, title: 'Show delivery cut-off banner on checkout' },
      {
        number: 1502,
        title: 'Upgrade Next.js to 14.2 and fix image loader config',
      },
    ],
  },
  {
    name: 'Payments API',
    icon: 'CreditCardIcon',
    path: '/payments',
    slug: 'payments-api',
    regressionTotal: 246,
    regressionSkipped: 2,
    regressionMinutes: 9,
    flakeRate: 0.05,
    incidents: { 9: 3 }, // 3DS challenge timeout against the gateway sandbox
    smokeTotal: 22,
    smokeFailuresToday: 0,
    unitTests: 1046,
    coverage: { statement: 91.2, branch: 84.6, function: 93.0, line: 91.8 },
    team: ['Amara Okafor', 'Daniel Reyes', 'Sven Lindqvist'],
    pullRequests: [
      { number: 612, title: 'Retry idempotent captures on gateway 502' },
      { number: 615, title: 'Add 3DS2 challenge timeout handling' },
      { number: 619, title: 'Reject refunds above the captured amount' },
      {
        number: 623,
        title: 'Store card fingerprint instead of last4 for duplicate checks',
      },
      { number: 627, title: 'Emit payment.settled webhook after ledger write' },
      {
        number: 631,
        title: 'Round FX-converted totals to currency minor units',
      },
      { number: 634, title: 'Rate-limit /payments/authorise per merchant' },
      { number: 638, title: 'Add Apple Pay merchant validation endpoint' },
    ],
  },
  {
    name: 'Order Fulfilment',
    icon: 'TruckIcon',
    path: '/fulfilment',
    slug: 'order-fulfilment',
    regressionTotal: 152,
    regressionSkipped: 4,
    regressionMinutes: 11,
    flakeRate: 0.1,
    incidents: { 5: 12, 4: 6 }, // carrier label sandbox outage, then partial recovery
    smokeTotal: 14,
    smokeFailuresToday: 0,
    unitTests: 655,
    coverage: { statement: 85.7, branch: 76.3, function: 88.4, line: 86.2 },
    team: ['Grace Adeyemi', 'Marek Zielinski', 'Isla MacRae'],
    pullRequests: [
      {
        number: 340,
        title: 'Split shipments when items ship from different warehouses',
      },
      { number: 343, title: 'Back off on carrier label API 429 responses' },
      {
        number: 347,
        title: 'Add click-and-collect ready-for-pickup notification',
      },
      { number: 350, title: 'Prevent double allocation of last-unit stock' },
      { number: 352, title: 'Backfill tracking URLs for legacy orders' },
      {
        number: 356,
        title: 'Cancel unpicked lines when an order is partially refunded',
      },
      { number: 359, title: 'Batch pick-list generation by aisle' },
      {
        number: 363,
        title: 'Expose delivery ETA on the order status endpoint',
      },
    ],
  },
  {
    name: 'Customer Mobile App',
    icon: 'DevicePhoneMobileIcon',
    path: '/mobile',
    slug: 'customer-mobile-app',
    regressionTotal: 96,
    regressionSkipped: 5,
    regressionMinutes: 27, // device farm is slow
    flakeRate: 0.35, // and flakier than the web suites
    incidents: { 13: 7 }, // Android 14 permission dialog changed
    smokeTotal: 12,
    smokeFailuresToday: 2,
    unitTests: 438,
    coverage: { statement: 74.6, branch: 63.2, function: 72.9, line: 75.3 },
    team: ['Noor Haddad', 'Callum Frost', 'Yuki Tanaka'],
    pullRequests: [
      { number: 908, title: 'Biometric sign-in with passcode fallback' },
      {
        number: 911,
        title: 'Fix Android back-button loop on order confirmation',
      },
      { number: 915, title: 'Cache product images with a 7-day TTL' },
      { number: 919, title: 'Sync wish list across devices' },
      { number: 922, title: 'Handle push permission denied state' },
      { number: 926, title: 'Show offline banner and queue basket edits' },
      { number: 930, title: 'Upgrade React Native to 0.74' },
      { number: 934, title: 'Live courier map on the track order screen' },
    ],
  },
];

async function seedE2E(service: E2EResultsService, p: ProductProfile) {
  let count = 0;
  for (let daysAgo = DAYS - 1; daysAgo >= 0; daysAgo--) {
    const day = dayStart(daysAgo);
    // The suite grows by a test or two over the month.
    const total = p.regressionTotal - Math.floor(daysAgo / 12);

    const incident = p.incidents[daysAgo];
    const fail = incident ?? (rng() < p.flakeRate ? between(1, 2) : 0);
    const skip = p.regressionSkipped;
    const seconds = p.regressionMinutes * 60 * (0.94 + rng() * 0.14) + fail * 6;

    await service.create({
      productName: p.name,
      timestamp: at(day, 2, between(5, 25)),
      pass: total - fail - skip,
      fail,
      skip,
      duration: formatDuration(seconds),
      reportUrl: `https://reports.northwind.example/${p.slug}/regression/${day.toISOString().slice(0, 10)}`,
      environment: 'STAGING',
      tag: 'Regression',
    });
    count++;

    // A smoke run against production after each release (every third day).
    if (daysAgo % 3 === 0) {
      const smokeFail = daysAgo === 0 ? p.smokeFailuresToday : 0;
      await service.create({
        productName: p.name,
        timestamp: at(day, 14, between(0, 40)),
        pass: p.smokeTotal - smokeFail,
        fail: smokeFail,
        skip: 0,
        duration: formatDuration(70 + rng() * 80),
        reportUrl: `https://reports.northwind.example/${p.slug}/smoke/${day.toISOString().slice(0, 10)}`,
        environment: 'PRODUCTION',
        tag: 'Smoke',
      });
      count++;
    }
  }
  return count;
}

async function seedUnit(service: UnitResultsService, p: ProductProfile) {
  let count = 0;
  const cov = { ...p.coverage };
  const step = DAYS / p.pullRequests.length;

  for (const [i, pr] of p.pullRequests.entries()) {
    const daysAgo = Math.max(0, Math.round(DAYS - 1 - i * step - rng() * 2));
    const author = pick(p.team);
    const commits = between(1, 3);

    for (let c = 0; c < commits; c++) {
      // Coverage drifts up with a little noise; the odd PR dips it slightly.
      const drift = rng() * 0.6 - 0.15;
      cov.statement = Math.min(98, cov.statement + drift);
      cov.branch = Math.min(96, cov.branch + drift * 1.1);
      cov.function = Math.min(99, cov.function + drift * 0.8);
      cov.line = Math.min(98, cov.line + drift);

      // Early commits on a PR sometimes have a broken test that gets fixed.
      const failing = c < commits - 1 && rng() < 0.3 ? between(1, 6) : 0;

      await service.create({
        productName: p.name,
        date: at(dayStart(daysAgo), 9 + c * 2 + between(0, 1), between(0, 59)),
        percentage: round1(((p.unitTests - failing) / p.unitTests) * 100),
        commit: sha(),
        pullRequest: `#${pr.number} ${pr.title}`,
        statementCoverage: round1(cov.statement),
        functionCoverage: round1(cov.function),
        branchCoverage: round1(cov.branch),
        lineCoverage: round1(cov.line),
        author,
      });
      count++;
    }
  }
  return count;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const productsService = app.get(ProductsService);
  const e2eResultsService = app.get(E2EResultsService);
  const unitResultsService = app.get(UnitResultsService);

  try {
    if (process.env.SEED_RESET === 'true') {
      console.log(
        'SEED_RESET=true: clearing results, products and integrations...',
      );
      await dataSource.query(
        'TRUNCATE TABLE e2e_results, unit_results, products, jira_queries, jira_config, sonarcloud_queries, sonarcloud_config, github_configs RESTART IDENTITY CASCADE',
      );
    } else if ((await productsService.findAll()).length > 0) {
      console.log(
        'Database already has products; nothing seeded. Use SEED_RESET=true to wipe and reseed.',
      );
      return;
    }

    console.log('Seeding database...');
    for (const p of profiles) {
      await productsService.create({
        productName: p.name,
        icon: p.icon,
        path: p.path,
      });
      const e2e = await seedE2E(e2eResultsService, p);
      const unit = await seedUnit(unitResultsService, p);
      console.log(`${p.name}: ${e2e} E2E runs, ${unit} unit runs`);
    }
    await seedIntegrations({
      jiraConfig: dataSource.getRepository(JiraConfig),
      jiraQuery: dataSource.getRepository(JiraQuery),
      sonarConfig: dataSource.getRepository(SonarCloudConfig),
      sonarQuery: dataSource.getRepository(SonarCloudQuery),
      github: dataSource.getRepository(GithubConfig),
    });
    console.log('Seeded Jira, SonarCloud and GitHub sample integrations');
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error while seeding database:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
