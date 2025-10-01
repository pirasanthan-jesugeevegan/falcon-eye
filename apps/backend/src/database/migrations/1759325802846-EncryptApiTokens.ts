import { MigrationInterface, QueryRunner } from 'typeorm';

export class EncryptApiTokens1759325802846 implements MigrationInterface {
  name = 'EncryptApiTokens1759325802846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sonarcloud_config" RENAME COLUMN "apiToken" TO "encryptedApiToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jira_config" RENAME COLUMN "apiToken" TO "encryptedApiToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sonarcloud_config" DROP COLUMN "encryptedApiToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sonarcloud_config" ADD "encryptedApiToken" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "jira_config" DROP COLUMN "encryptedApiToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jira_config" ADD "encryptedApiToken" text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jira_config" DROP COLUMN "encryptedApiToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jira_config" ADD "encryptedApiToken" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sonarcloud_config" DROP COLUMN "encryptedApiToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sonarcloud_config" ADD "encryptedApiToken" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "jira_config" RENAME COLUMN "encryptedApiToken" TO "apiToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sonarcloud_config" RENAME COLUMN "encryptedApiToken" TO "apiToken"`,
    );
  }
}
