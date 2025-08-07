/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Migrations1753816962375 {
  name = 'Migrations1753816962375';

  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "e2e_results" DROP CONSTRAINT "FK_6498e1a1d8025a1fa0df259320e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP CONSTRAINT "FK_6230d04344df5d66e87a3a7cd23"`,
    );
    await queryRunner.query(
      `ALTER TABLE "e2e_results" DROP COLUMN "productName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "e2e_results" DROP COLUMN "report_url"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP COLUMN "productName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP COLUMN "pullRequest"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP COLUMN "statementCoverage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP COLUMN "functionCoverage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP COLUMN "branchCoverage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP COLUMN "lineCoverage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "e2e_results" ADD "reportUrl" text NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "e2e_results" ADD "product_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD "pullRequest" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD "statementCoverage" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD "functionCoverage" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD "branchCoverage" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD "lineCoverage" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "e2e_results" ADD CONSTRAINT "FK_2743cc593a86c5f32d25574385e" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "e2e_results" DROP CONSTRAINT "FK_2743cc593a86c5f32d25574385e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP COLUMN "lineCoverage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP COLUMN "branchCoverage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP COLUMN "functionCoverage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP COLUMN "statementCoverage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" DROP COLUMN "pullRequest"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "e2e_results" DROP COLUMN "product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "e2e_results" DROP COLUMN "reportUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD "lineCoverage" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD "branchCoverage" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD "functionCoverage" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD "statementCoverage" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD "pullRequest" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD "productName" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "e2e_results" ADD "reportUrl" text NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "e2e_results" ADD "productName" uuid`);
    await queryRunner.query(
      `ALTER TABLE "unit_results" ADD CONSTRAINT "FK_6230d04344df5d66e87a3a7cd23" FOREIGN KEY ("productName") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "e2e_results" ADD CONSTRAINT "FK_6498e1a1d8025a1fa0df259320e" FOREIGN KEY ("productName") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
};
