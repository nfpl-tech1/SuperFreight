import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppUserEmailSignature2026040901400 implements MigrationInterface {
  name = 'AppUserEmailSignature2026040901400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "emailSignature" text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "emailSignature"
    `);
  }
}
