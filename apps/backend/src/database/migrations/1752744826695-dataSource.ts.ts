import { MigrationInterface, QueryRunner } from 'typeorm';

export class DataSource1752744826695 implements MigrationInterface {
  name = 'DataSource1752744826695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "unit_results" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "date" TIMESTAMP NOT NULL,
                "percentage" character varying NOT NULL,
                "commit" character varying NOT NULL,
                "pull_request" character varying NOT NULL,
                "statement_coverage" character varying NOT NULL,
                "function_coverage" character varying NOT NULL,
                "branch_coverage" character varying NOT NULL,
                "line_coverage" character varying NOT NULL,
                "author" character varying NOT NULL,
                "productName" uuid,
                "product_id" uuid,
                CONSTRAINT "PK_1ddc3a148735639a9c8ead5a685" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "unit_results"
            ADD CONSTRAINT "FK_6230d04344df5d66e87a3a7cd23" FOREIGN KEY ("productName") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "unit_results"
            ADD CONSTRAINT "FK_93230ba30d5b3871c47f5b025b6" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "unit_results" DROP CONSTRAINT "FK_93230ba30d5b3871c47f5b025b6"
        `);
    await queryRunner.query(`
            ALTER TABLE "unit_results" DROP CONSTRAINT "FK_6230d04344df5d66e87a3a7cd23"
        `);
    await queryRunner.query(`
            DROP TABLE "unit_results"
        `);
  }
}
