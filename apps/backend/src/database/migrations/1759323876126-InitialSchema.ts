import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1759323876126 implements MigrationInterface {
  name = 'InitialSchema1759323876126';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "e2e_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(10) NOT NULL, "timestamp" TIMESTAMP NOT NULL, "pass" integer NOT NULL, "fail" integer NOT NULL, "skip" integer NOT NULL, "reportUrl" text NOT NULL, "environment" character varying(50) NOT NULL, "duration" character varying(50) NOT NULL, "tag" character varying(50) NOT NULL, "product_id" uuid, CONSTRAINT "PK_72d94b95f491483d3ed2667dc00" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productName" character varying(255) NOT NULL, "icon" character varying(255), "path" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_270b1a4eb00eebe56b528e909f6" UNIQUE ("productName"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "unit_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP NOT NULL, "percentage" character varying NOT NULL, "commit" character varying NOT NULL, "pullRequest" character varying NOT NULL, "statementCoverage" character varying NOT NULL, "functionCoverage" character varying NOT NULL, "branchCoverage" character varying NOT NULL, "lineCoverage" character varying NOT NULL, "author" character varying NOT NULL, "product_id" uuid, CONSTRAINT "PK_1ddc3a148735639a9c8ead5a685" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sonarcloud_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "instanceName" character varying NOT NULL, "baseUrl" character varying NOT NULL, "apiToken" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e6bd45af46dfdeb88e4ab7b19ca" UNIQUE ("instanceName"), CONSTRAINT "PK_3de533a1f74c11651cdb9c2cbde" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sonarcloud_queries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "project" text NOT NULL, "description" text, "metric" text array NOT NULL, "sonarCloudConfigId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_435ed6631aeda787b40a08caf05" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "jira_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "instanceName" character varying NOT NULL, "baseUrl" character varying NOT NULL, "email" character varying NOT NULL, "apiToken" character varying NOT NULL, "projectKey" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f2faf730b8370261c3f7e203982" UNIQUE ("instanceName"), CONSTRAINT "PK_a461881499ef5f4be3c2e04534c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "jira_queries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "jqlQuery" text NOT NULL, "description" text, "jiraConfigId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eb4df3e7ef50d64df601bd068e7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "github_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner" character varying NOT NULL, "repo" character varying NOT NULL, "workflow" character varying NOT NULL, "encryptedPat" text NOT NULL, "inputsSchema" jsonb NOT NULL, "defaultRef" character varying NOT NULL DEFAULT 'main', "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_307a65953b6a9337d23896bc5c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "e2e_results" ADD CONSTRAINT "FK_2743cc593a86c5f32d25574385e" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD CONSTRAINT "FK_93230ba30d5b3871c47f5b025b6" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sonarcloud_queries" ADD CONSTRAINT "FK_e7814e44f0405f288d8f5c78268" FOREIGN KEY ("sonarCloudConfigId") REFERENCES "sonarcloud_config"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jira_queries" ADD CONSTRAINT "FK_874e7e8bc245cdf28e63f168c07" FOREIGN KEY ("jiraConfigId") REFERENCES "jira_config"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jira_queries" DROP CONSTRAINT "FK_874e7e8bc245cdf28e63f168c07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sonarcloud_queries" DROP CONSTRAINT "FK_e7814e44f0405f288d8f5c78268"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP CONSTRAINT "FK_93230ba30d5b3871c47f5b025b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "e2e_results" DROP CONSTRAINT "FK_2743cc593a86c5f32d25574385e"`,
    );
    await queryRunner.query(`DROP TABLE "github_configs"`);
    await queryRunner.query(`DROP TABLE "jira_queries"`);
    await queryRunner.query(`DROP TABLE "jira_config"`);
    await queryRunner.query(`DROP TABLE "sonarcloud_queries"`);
    await queryRunner.query(`DROP TABLE "sonarcloud_config"`);
    await queryRunner.query(`DROP TABLE "unit_results"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "e2e_results"`);
  }
}
