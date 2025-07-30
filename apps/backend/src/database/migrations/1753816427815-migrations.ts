import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1753816427815 implements MigrationInterface {
  name = 'Migrations1753816427815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "productName" character varying(255) NOT NULL,
                "icon" character varying(255),
                "path" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "isActive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_270b1a4eb00eebe56b528e909f6" UNIQUE ("productName"),
                CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "e2e_results"
            ADD CONSTRAINT "FK_6498e1a1d8025a1fa0df259320e" FOREIGN KEY ("productName") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "e2e_results" DROP CONSTRAINT "FK_6498e1a1d8025a1fa0df259320e"
        `);
    await queryRunner.query(`
            DROP TABLE "products"
        `);
  }
}
