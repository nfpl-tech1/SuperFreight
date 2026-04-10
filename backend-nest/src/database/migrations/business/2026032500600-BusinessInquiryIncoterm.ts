import { MigrationInterface, QueryRunner } from 'typeorm';

export class BusinessInquiryIncoterm2026032500600
  implements MigrationInterface
{
  name = 'BusinessInquiryIncoterm2026032500600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inquiries"
      ADD COLUMN IF NOT EXISTS "incoterm" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inquiries"
      DROP COLUMN IF EXISTS "incoterm"
    `);
  }
}
